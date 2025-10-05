import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import type { Johnny5Service } from '@dbc-tech/johnny5-http-service'
import {
  type DbFile,
  FileModel,
  MongoDbFileLogger,
  emitJobStatus,
} from '@dbc-tech/johnny5-mongodb'
import {
  type Johnny5ConfigService,
  createJohnny5ConfigService,
} from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { type RouteConfig, publishJobCloudEvent } from '@dbc-tech/johnny5/dapr'
import {
  AllEnvironments,
  type Environment,
  type FileCloudEvent,
  type FileId,
  type JobStatus,
  fileCloudEventSchema,
} from '@dbc-tech/johnny5/typebox'
import { type Logger } from '@dbc-tech/logger'
import type { PipedriveV2Service } from '@dbc-tech/pipedrive'
import { type PowerappTeamsService } from '@dbc-tech/teams'
import { Elysia } from 'elysia'
import type { HydratedDocument } from 'mongoose'
import { nanoid } from 'nanoid'
import type { PowerappWorkflowService } from '../../johnny5-helper/powerapp-workflow.service'
import type { MatterSyncService } from '../../johnny5/cca/utils/matter-update/updater-service'
import type { TypeformService } from '../../typeform/typeform.service'
import { createActionstepService } from './actionstep.plugin'
import { createJohnny5Service } from './cca.services.plugin'
import { createMatterSyncService } from './matter-sync-service.plugins'
import { createPipedriveV2Service } from './pipedrive.plugin'
import { createPowerappTeamsService } from './powerapp-teams.plugin'
import { createPowerappWorkflowService } from './powerapp.plugin'
import { createTypeFormService } from './typeform.plugin'

export const fileContext = (config: ContextConfig) =>
  new Elysia()
    .guard({
      as: 'scoped',
      body: fileCloudEventSchema,
    })
    .resolve({ as: 'scoped' }, async ({ headers, body }) => {
      const message = body as FileCloudEvent
      return {
        ctx: await createFileContext(config, headers, message.data),
      }
    })

export type FileContext = {
  correlationId: string
  name: string
  environment: Environment
  logger: Logger
  config: AppConfig
  actionstep: () => ActionStepService
  pipeDrive: (apiToken?: string) => PipedriveV2Service
  typeForm: () => TypeformService
  powerapp: () => PowerappWorkflowService
  powerappTeams: () => PowerappTeamsService
  services: () => Johnny5Service
  johnny5Config: Johnny5ConfigService
  syncMatter: () => MatterSyncService
  status: (
    jobId: string,
    status: JobStatus,
    errorReason?: string,
  ) => Promise<void>
  next: (
    jobId: string,
    route: RouteConfig,
    scheduledEnqueueTimeUtc?: Date,
  ) => Promise<void>
  file: HydratedDocument<DbFile>
}

export type ContextConfig = {
  logLevel?: string
  name: string
  correlationId?: string
}

export const createFileContext = async (
  contextConfig: ContextConfig,
  headers: Record<string, string | undefined>,
  { fileId, tenant }: FileId,
): Promise<FileContext> => {
  const file = await FileModel.findById(fileId)
  if (!file) {
    throw new Error(`File Id:${fileId} not found`)
  }

  const correlationId = nanoid(16)
  contextConfig.correlationId = correlationId

  const logger = MongoDbFileLogger({
    correlationId,
    fileId,
    name: contextConfig.name,
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
    name: contextConfig.name,
    correlationId,
    environment,
    logger,
    config,
    actionstep: () =>
      createActionstepService(tenant, headers, logger, correlationId),
    pipeDrive: (apiToken?: string) =>
      createPipedriveV2Service({ headers, logger, correlationId, apiToken }),
    typeForm: () => createTypeFormService(tenant, logger, correlationId),
    powerapp: () => createPowerappWorkflowService(logger, correlationId),
    services: () => createJohnny5Service(tenant, logger, correlationId),
    powerappTeams: () => createPowerappTeamsService(logger, correlationId),
    johnny5Config,
    syncMatter: () => createMatterSyncService(logger, correlationId),
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
        contextConfig.name,
        tenant,
      ),
    next: (jobId: string, route: RouteConfig, scheduledEnqueueTimeUtc?: Date) =>
      publishJobCloudEvent(
        route,
        logger,
        jobId,
        fileId,
        correlationId,
        contextConfig.name,
        tenant,
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
