import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import {
  type DbFile,
  FileModel,
  emitJobStatus,
} from '@dbc-tech/johnny5-mongodb'
import {
  type Johnny5ConfigService,
  createJohnny5ConfigService,
} from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { type RouteConfig, publishCloudEvent } from '@dbc-tech/johnny5/dapr'
import {
  AllEnvironments,
  type Environment,
  type JobStatus,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import { type JwtSchema, jwtSchema } from '@dbc-tech/johnny5/typebox/jwt.schema'
import { type Logger } from '@dbc-tech/logger'
import jwt from '@elysiajs/jwt'
import Elysia from 'elysia'
import type { HydratedDocument } from 'mongoose'
import { nanoid } from 'nanoid'
import { MongoDbFileLogger } from '../../utils/mongodb-file-logger'
import { createActionstepService } from './actionstep.plugin'
import bearer from './bearer.plugin'

export const fileContext = (contextConfig: ContextConfig = {}) =>
  new Elysia()
    .use(
      jwt({
        name: 'jwtauth',
        secret: process.env.JWT_SECRET!,
        schema: jwtSchema,
      }),
    )
    .use(bearer())
    .onBeforeHandle({ as: 'scoped' }, async ({ jwtauth, set, bearer }) => {
      const token = await jwtauth.verify(bearer)

      if (!token) {
        set.status = 401
        return 'Unauthorized'
      }
    })
    .guard({
      params: idStringSchema,
    })
    .resolve(
      { as: 'scoped' },
      async ({ jwtauth, bearer, headers, path, params: { id } }) => {
        const token = await jwtauth.verify(bearer)

        if (!token) {
          throw new Error('Unexpected error resolving the bearer token')
        }

        return {
          ctx: await createFileContext(
            contextConfig,
            headers,
            path,
            token,
            id as string,
          ),
        }
      },
    )

export type FileContext = {
  correlationId: string
  name: string
  jwt: JwtSchema
  environment: Environment
  logger: Logger
  config: AppConfig
  actionstep: () => ActionStepService
  johnny5Config: Johnny5ConfigService
  status: (
    jobId: string,
    status: JobStatus,
    errorReason?: string,
  ) => Promise<void>
  next: (
    route: RouteConfig,
    data: Record<string, unknown>,
    scheduledEnqueueTimeUtc?: Date,
  ) => Promise<void>
  file: HydratedDocument<DbFile>
}

export type ContextConfig = {
  logLevel?: string
  correlationId?: string
}

export const createFileContext = async (
  contextConfig: ContextConfig,
  headers: Record<string, string | undefined>,
  path: string,
  jwt: JwtSchema,
  fileId: string,
): Promise<FileContext> => {
  const file = await FileModel.findById(fileId)
  if (!file) {
    throw new Error(`File Id:${fileId} not found`)
  }

  const correlationId = nanoid(16)
  contextConfig.correlationId = correlationId
  const { tenant } = jwt
  const logger = MongoDbFileLogger({
    correlationId,
    fileId,
    name: path,
    tenant,
  })
  const environment = getEnvironment()
  const config = appConfig({
    connectionString: process.env.APP_CONFIGURATION_CONNECTION_STRING!,
    appName: `J5:Services`,
    appEnv: environment,
  })
  const johnny5Config = createJohnny5ConfigService(tenant)

  return {
    name: path,
    correlationId,
    jwt,
    environment,
    logger,
    config,
    actionstep: () =>
      createActionstepService(tenant, headers, logger, correlationId),
    johnny5Config,
    status: (
      jobId: string,
      status: JobStatus,
      errorReason: string | undefined,
    ) =>
      emitJobStatus(
        status,
        errorReason,
        logger,
        jobId,
        fileId,
        correlationId,
        path,
        tenant,
      ),
    next: (
      route: RouteConfig,
      data: Record<string, unknown>,
      scheduledEnqueueTimeUtc?: Date,
    ) =>
      publishCloudEvent(
        route,
        logger,
        correlationId,
        path,
        data,
        scheduledEnqueueTimeUtc,
      ),
    file,
  }
}

export const getEnvironment = (): Environment => {
  let env: Environment = (process.env.APP_ENV || 'dev') as Environment
  if (!AllEnvironments.includes(env as Environment)) env = 'dev'
  return env
}
