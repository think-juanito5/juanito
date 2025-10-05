import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import type { TrustPilotLinkService } from '@dbc-tech/cca-common'
import type { DataverseService } from '@dbc-tech/dataverse'
import type { Johnny5Service } from '@dbc-tech/johnny5-http-service'
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
import { dapr } from '@dbc-tech/johnny5/dapr'
import {
  AllEnvironments,
  type Environment,
  type TaskCloudEvent,
  type TaskId,
  type TaskStatus,
  taskCloudEventSchema,
} from '@dbc-tech/johnny5/typebox'
import { ConsoleLogger, type Logger, profileFn } from '@dbc-tech/logger'
import type {
  PipedriveV1Service,
  PipedriveV2Service,
} from '@dbc-tech/pipedrive'
import type { PowerappTeamsService } from '@dbc-tech/teams'
import { Elysia } from 'elysia'
import type { HydratedDocument } from 'mongoose'
import { nanoid } from 'nanoid'
import { serializeError } from 'serialize-error'
import { createActionstepService } from './actionstep.plugin'
import { createJohnny5Service } from './cca.services.plugin'
import { createDataverseService } from './dataverse.plugin'
import {
  createPipedriveV1Service,
  createPipedriveV2Service,
} from './pipedrive.plugin'
import { createPowerappTeamsService } from './powerapp-teams.plugin'
import { createTrustPilotLinkService } from './trustpilot.plugin'

export const taskContext = (config: ContextConfig) =>
  new Elysia()
    .guard({
      body: taskCloudEventSchema,
    })
    .resolve({ as: 'scoped' }, async ({ headers, body, path }) => {
      const message = body as TaskCloudEvent
      config.name = config.name || path
      return {
        ctx: await createTaskContext(config, headers, message.data),
      }
    })
    .onError({ as: 'scoped' }, async ({ code, error, ctx }) => {
      const jsonError = serializeError(error)
      if (!ctx) {
        const logger = ConsoleLogger()
        await logger.error('taskContext not found', jsonError)
        return dapr.drop
      }

      const { logger, status } = ctx
      await logger.error(`Unhandled error: (${code})`, jsonError)
      await status('failed', JSON.stringify(jsonError))
      return dapr.drop
    })

export type TaskContext = {
  correlationId: string
  name: string
  environment: Environment
  logger: Logger
  config: AppConfig
  actionstep: () => ActionStepService
  dataverse: () => DataverseService
  pipedriveV1: (apiToken?: string) => PipedriveV1Service
  pipedriveV2: (apiToken?: string) => PipedriveV2Service
  powerappTeams: () => PowerappTeamsService
  services: () => Johnny5Service
  trustpilot: () => TrustPilotLinkService
  johnny5Config: Johnny5ConfigService
  status: (status: TaskStatus, errorReason?: string) => Promise<void>
  file: HydratedDocument<DbFile>
  task: HydratedDocument<DbTask>
  profile: <T>(run: () => Promise<T>, name?: string) => Promise<T>
}

export type ContextConfig = {
  logLevel?: string
  name?: string
  correlationId?: string
}

export const createTaskContext = async (
  contextConfig: ContextConfig,
  headers: Record<string, string | undefined>,
  { taskId, fileId, tenant }: TaskId,
): Promise<TaskContext> => {
  const file = await FileModel.findById(fileId)
  if (!file) {
    throw new Error(`File Id:${fileId} not found`)
  }

  const task = await TaskModel.findById(taskId)
  if (!task) {
    throw new Error(`Task Id:${taskId} not found`)
  }

  const correlationId = nanoid(16)
  contextConfig.correlationId = correlationId

  const contextName = contextConfig.name || 'taskContext'

  const logger = MongoDbTaskLogger({
    correlationId,
    fileId,
    taskId,
    name: contextName,
    tenant,
  })
  const environment = getEnvironment()
  const config = appConfig({
    connectionString: process.env.APP_CONFIGURATION_CONNECTION_STRING!,
    appName: `J5:Handlers`,
    appEnv: environment,
  })
  const johnny5Config = createJohnny5ConfigService(tenant)

  return {
    name: contextName,
    correlationId,
    environment,
    logger,
    config,
    actionstep: () =>
      createActionstepService(tenant, headers, logger, correlationId),
    dataverse: () => createDataverseService(correlationId, logger),
    pipedriveV1: (apiToken?: string) =>
      createPipedriveV1Service({ headers, logger, correlationId, apiToken }),
    pipedriveV2: (apiToken?: string) =>
      createPipedriveV2Service({ headers, logger, correlationId, apiToken }),
    powerappTeams: () => createPowerappTeamsService(logger, correlationId),
    services: () => createJohnny5Service(tenant, logger, correlationId),
    trustpilot: () => createTrustPilotLinkService(),
    johnny5Config,
    status: (status: TaskStatus, errorReason: string | undefined) =>
      emitTaskStatus(
        status,
        errorReason,
        logger,
        taskId,
        fileId,
        correlationId,
        contextName,
        tenant,
      ),
    file,
    task,
    profile: <T>(run: () => Promise<T>, name?: string) =>
      profileFn(run, logger, name),
  }
}

export const getEnvironment = (): Environment => {
  let env: Environment = (process.env.APP_ENV || 'dev') as Environment
  if (!AllEnvironments.includes(env as Environment)) env = 'dev'
  return env
}
