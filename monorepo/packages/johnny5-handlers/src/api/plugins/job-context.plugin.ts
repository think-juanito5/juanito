import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import type { DataverseService } from '@dbc-tech/dataverse'
import type { Johnny5Service } from '@dbc-tech/johnny5-http-service'
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
import {
  type RouteConfig,
  dapr,
  publishJobCloudEvent,
} from '@dbc-tech/johnny5/dapr'
import {
  AllEnvironments,
  type Environment,
  type JobCloudEvent,
  type JobId,
  type JobStatus,
  jobCloudEventSchema,
} from '@dbc-tech/johnny5/typebox'
import { safeExecuteFn } from '@dbc-tech/johnny5/utils'
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
import type { PowerappWorkflowService } from '../../johnny5-helper/powerapp-workflow.service'
import { type MatterSyncService } from '../../johnny5/cca/utils/matter-update/updater-service'
import type { TypeformService } from '../../typeform/typeform.service'
import { createActionstepService } from './actionstep.plugin'
import { createJohnny5Service } from './cca.services.plugin'
import { createDataverseService } from './dataverse.plugin'
import { createMatterSyncService } from './matter-sync-service.plugins'
import {
  createPipedriveV1Service,
  createPipedriveV2Service,
} from './pipedrive.plugin'
import { createPowerappTeamsService } from './powerapp-teams.plugin'
import { createPowerappWorkflowService } from './powerapp.plugin'
import { createTypeFormService } from './typeform.plugin'

export const jobContext = (config: ContextConfig) =>
  new Elysia()
    .guard({
      body: jobCloudEventSchema,
    })
    .resolve({ as: 'scoped' }, async ({ headers, body }) => {
      const message = body as JobCloudEvent
      return {
        ctx: await createJobContext(config, headers, message.data),
      }
    })
    .onError({ as: 'scoped' }, async ({ code, error, ctx }) => {
      const jsonError = serializeError(error)
      if (!ctx) {
        const logger = ConsoleLogger()
        await logger.error('jobContext not found', jsonError)
        return dapr.drop
      }

      const { logger, status } = ctx
      await logger.error(`Unhandled error: (${code})`, jsonError)
      await status('error-processing', JSON.stringify(jsonError))
      return dapr.drop
    })

export type JobContext = {
  correlationId: string
  name: string
  environment: Environment
  logger: Logger
  config: AppConfig
  actionstep: () => ActionStepService
  dataverse: () => DataverseService
  pipedriveV1: (apiToken?: string) => PipedriveV1Service
  pipedriveV2: (apiToken?: string) => PipedriveV2Service
  typeForm: () => TypeformService
  powerapp: () => PowerappWorkflowService
  powerappTeams: () => PowerappTeamsService
  services: () => Johnny5Service
  syncMatter: () => MatterSyncService
  johnny5Config: Johnny5ConfigService
  status: (status: JobStatus, errorReason?: string) => Promise<void>
  next: (route: RouteConfig, scheduledEnqueueTimeUtc?: Date) => Promise<void>
  file: HydratedDocument<DbFile>
  job: HydratedDocument<DbJob>
  profile: <T>(run: () => Promise<T>, name?: string) => Promise<T>
  safeExecute: <T>(
    run: () => Promise<T | undefined>,
    ignoreOn?: (error: unknown) => boolean,
  ) => Promise<T | undefined>
}

export type ContextConfig = {
  logLevel?: string
  name: string
  correlationId?: string
}

export const createJobContext = async (
  contextConfig: ContextConfig,
  headers: Record<string, string | undefined>,
  { jobId, fileId, tenant }: JobId,
): Promise<JobContext> => {
  const file = await FileModel.findById(fileId)
  if (!file) {
    throw new Error(`File Id:${fileId} not found`)
  }

  const job = await JobModel.findById(jobId)
  if (!job) {
    throw new Error(`Job Id:${jobId} not found`)
  }

  const correlationId = nanoid(16)
  contextConfig.correlationId = correlationId

  const logger = MongoDbJobLogger({
    correlationId,
    fileId,
    jobId,
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
    dataverse: () => createDataverseService(correlationId, logger),
    pipedriveV1: (apiToken?: string) =>
      createPipedriveV1Service({ headers, logger, correlationId, apiToken }),
    pipedriveV2: (apiToken?: string) =>
      createPipedriveV2Service({ headers, logger, correlationId, apiToken }),
    typeForm: () => createTypeFormService(tenant, logger, correlationId),
    powerapp: () => createPowerappWorkflowService(logger, correlationId),
    powerappTeams: () => createPowerappTeamsService(logger, correlationId),
    services: () => createJohnny5Service(tenant, logger, correlationId),
    syncMatter: () => createMatterSyncService(logger, correlationId),
    johnny5Config,
    status: (status: JobStatus, errorReason: string | undefined) =>
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
    next: (route: RouteConfig, scheduledEnqueueTimeUtc?: Date) =>
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
    job,
    profile: <T>(run: () => Promise<T>, name?: string) =>
      profileFn(run, logger, name),
    safeExecute: async <T>(
      run: () => Promise<T | undefined>,
      ignoreOn?: (error: unknown) => boolean,
    ) => safeExecuteFn(run, logger, ignoreOn),
  }
}

export const getEnvironment = (): Environment => {
  let env: Environment = (process.env.APP_ENV || 'dev') as Environment
  if (!AllEnvironments.includes(env as Environment)) env = 'dev'
  return env
}
