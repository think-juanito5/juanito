import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import type { Johnny5Service } from '@dbc-tech/johnny5-http-service'
import { emitJobStatus } from '@dbc-tech/johnny5-mongodb'
import {
  Johnny5ConfigService,
  createJohnny5ConfigService,
} from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { type RouteConfig, publishCloudEvent } from '@dbc-tech/johnny5/dapr'
import {
  AllEnvironments,
  type Environment,
  type JobStatus,
  type Tenant,
} from '@dbc-tech/johnny5/typebox'
import { ConsoleContextLogger, type Logger } from '@dbc-tech/logger'
import type { PipedriveV2Service } from '@dbc-tech/pipedrive'
import type { PricingService } from '@dbc-tech/pricing'
import type { PowerappTeamsService } from '@dbc-tech/teams'
import { Elysia } from 'elysia'
import { nanoid } from 'nanoid'
import { createActionstepService } from './actionstep.plugin'
import { createJohnny5Service } from './cca.services.plugin'
import { createPipedriveV2Service } from './pipedrive.plugin'
import { createPowerappTeamsService } from './powerapp-teams.plugin'
import { createPricingService } from './pricing.plugin'

export const appContext = (config: ContextConfig) =>
  new Elysia().resolve({ as: 'scoped' }, async ({ headers }) => {
    return {
      ctx: createAppContext(config, headers),
    }
  })

export type AppContext = {
  correlationId: string
  name: string
  environment: Environment
  logger: Logger
  config: AppConfig
  actionstep: (tenant: Tenant) => ActionStepService
  pipeDrive: (apiToken?: string) => PipedriveV2Service
  powerappTeams: () => PowerappTeamsService
  pricing: (tenant: Tenant) => PricingService
  services: (tenant: Tenant) => Johnny5Service
  johnny5Config: (tenant: Tenant) => Johnny5ConfigService
  status: (
    jobId: string,
    fileId: string,
    tenant: Tenant,
    status: JobStatus,
    errorReason?: string,
  ) => Promise<void>
  next: (
    route: RouteConfig,
    data: Record<string, unknown>,
    scheduledEnqueueTimeUtc?: Date,
  ) => Promise<void>
}

export type ContextConfig = {
  logLevel?: string
  name: string
  correlationId?: string
}

export const createAppContext = (
  contextConfig: ContextConfig,
  headers: Record<string, string | undefined>,
): AppContext => {
  const correlationId = nanoid(16)
  contextConfig.correlationId = correlationId
  const logger = ConsoleContextLogger(contextConfig)
  const environment = getEnvironment()
  const config = appConfig({
    connectionString: process.env.APP_CONFIGURATION_CONNECTION_STRING!,
    appName: `CCA:Handlers`,
    appEnv: environment,
  })

  return {
    name: contextConfig.name,
    correlationId,
    environment,
    logger,
    config,
    actionstep: (tenant: Tenant) =>
      createActionstepService(tenant, headers, logger, correlationId),
    pipeDrive: (apiToken?: string) =>
      createPipedriveV2Service({ headers, logger, apiToken, correlationId }),
    powerappTeams: () => createPowerappTeamsService(logger, correlationId),
    pricing: (tenant: Tenant) =>
      createPricingService(tenant, correlationId, logger),
    services: (tenant: Tenant) =>
      createJohnny5Service(tenant, logger, correlationId),
    johnny5Config: (tenant: Tenant) => createJohnny5ConfigService(tenant),
    status: (
      jobId: string,
      fileId: string,
      tenant: Tenant,
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
    next: (
      route: RouteConfig,
      data: Record<string, unknown>,
      scheduledEnqueueTimeUtc?: Date,
    ) =>
      publishCloudEvent(
        route,
        logger,
        correlationId,
        contextConfig.name,
        data,
        scheduledEnqueueTimeUtc,
      ),
  }
}

export const getEnvironment = (): Environment => {
  let env: Environment = (process.env.APP_ENV || 'dev') as Environment
  if (!AllEnvironments.includes(env as Environment)) env = 'dev'
  return env
}
