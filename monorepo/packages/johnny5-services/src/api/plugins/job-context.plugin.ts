import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import type { DataverseService } from '@dbc-tech/dataverse'
import {
  type DbFile,
  type DbJob,
  FileModel,
  JobModel,
  MongoDbJobLogger,
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
import type { PipedriveV2Service } from '@dbc-tech/pipedrive'
import jwt from '@elysiajs/jwt'
import Elysia from 'elysia'
import type { HydratedDocument } from 'mongoose'
import { nanoid } from 'nanoid'
import { createActionstepService } from './actionstep.plugin'
import bearer from './bearer.plugin'
import { createDataverseService } from './dataverse.plugin'
import { createPipedriveV2Service } from './pipedrive.plugin'

export const jobContext = (contextConfig: ContextConfig = {}) =>
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
          ctx: await createJobContext(
            contextConfig,
            headers,
            path,
            token,
            id as string,
          ),
        }
      },
    )

export type JobContext = {
  correlationId: string
  name: string
  jwt: JwtSchema
  environment: Environment
  logger: Logger
  config: AppConfig
  actionstep: () => ActionStepService
  dataverse: () => DataverseService
  pipedrive: () => PipedriveV2Service
  johnny5Config: Johnny5ConfigService
  status: (status: JobStatus, errorReason?: string) => Promise<void>
  next: (
    route: RouteConfig,
    data: Record<string, unknown>,
    scheduledEnqueueTimeUtc?: Date,
  ) => Promise<void>
  file: HydratedDocument<DbFile>
  job: HydratedDocument<DbJob>
}

export type ContextConfig = {
  logLevel?: string
  correlationId?: string
}

export const createJobContext = async (
  contextConfig: ContextConfig,
  headers: Record<string, string | undefined>,
  path: string,
  jwt: JwtSchema,
  jobId: string,
): Promise<JobContext> => {
  const job = await JobModel.findById(jobId)
  if (!job) {
    throw new Error(`Job Id:${jobId} not found`)
  }

  const file = await FileModel.findById(job.fileId)
  if (!file) {
    throw new Error(`File Id:${job.fileId} not found`)
  }

  const fileId = file.id as string
  const correlationId = nanoid(16)
  contextConfig.correlationId = correlationId
  const { tenant } = jwt
  const logger = MongoDbJobLogger({
    correlationId,
    jobId,
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
    dataverse: () => createDataverseService(correlationId, logger),
    pipedrive: () => createPipedriveV2Service(headers, logger, correlationId),
    johnny5Config,
    status: (status: JobStatus, errorReason: string | undefined) =>
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
    job,
  }
}

export const getEnvironment = (): Environment => {
  let env: Environment = (process.env.APP_ENV || 'dev') as Environment
  if (!AllEnvironments.includes(env as Environment)) env = 'dev'
  return env
}
