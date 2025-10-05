import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import {
  type DbFile,
  type DbTask,
  FileModel,
  MongoDbTaskLogger,
  TaskModel,
  emitTaskStatus,
} from '@dbc-tech/johnny5-mongodb'
import {
  type Johnny5ConfigService,
  createJohnny5ConfigService,
} from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { type RouteConfig, publishCloudEvent } from '@dbc-tech/johnny5/dapr'
import {
  AllEnvironments,
  type Environment,
  type TaskStatus,
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
import { createPipedriveV2Service } from './pipedrive.plugin'

export const taskContext = (contextConfig: ContextConfig = {}) =>
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
          ctx: await createTaskContext(
            contextConfig,
            headers,
            path,
            token,
            id as string,
          ),
        }
      },
    )

export type TaskContext = {
  correlationId: string
  name: string
  jwt: JwtSchema
  environment: Environment
  logger: Logger
  config: AppConfig
  actionstep: () => ActionStepService
  pipedrive: () => PipedriveV2Service
  johnny5Config: Johnny5ConfigService
  status: (status: TaskStatus, errorReason?: string) => Promise<void>
  next: (
    route: RouteConfig,
    data: Record<string, unknown>,
    scheduledEnqueueTimeUtc?: Date,
  ) => Promise<void>
  file: HydratedDocument<DbFile>
  task: HydratedDocument<DbTask>
}

export type ContextConfig = {
  logLevel?: string
  correlationId?: string
}

export const createTaskContext = async (
  contextConfig: ContextConfig,
  headers: Record<string, string | undefined>,
  path: string,
  jwt: JwtSchema,
  taskId: string,
): Promise<TaskContext> => {
  const task = await TaskModel.findById(taskId)
  if (!task) {
    throw new Error(`Task Id:${taskId} not found`)
  }

  const file = await FileModel.findById(task.fileId)
  if (!file) {
    throw new Error(`File Id:${task.fileId} not found`)
  }

  const fileId = file.id as string
  const correlationId = nanoid(16)
  contextConfig.correlationId = correlationId
  const { tenant } = jwt
  const logger = MongoDbTaskLogger({
    correlationId,
    taskId,
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
    pipedrive: () => createPipedriveV2Service(headers, logger, correlationId),
    johnny5Config,
    status: (status: TaskStatus, errorReason: string | undefined) =>
      emitTaskStatus(
        status,
        errorReason,
        logger,
        taskId,
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
    task,
  }
}

export const getEnvironment = (): Environment => {
  let env: Environment = (process.env.APP_ENV || 'dev') as Environment
  if (!AllEnvironments.includes(env as Environment)) env = 'dev'
  return env
}
