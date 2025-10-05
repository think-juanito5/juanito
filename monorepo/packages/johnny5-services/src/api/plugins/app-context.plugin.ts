import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import type { DataverseService } from '@dbc-tech/dataverse'
import { emitJobStatus, emitTaskStatus } from '@dbc-tech/johnny5-mongodb'
import {
  type Johnny5ConfigService,
  createJohnny5ConfigService,
} from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { type RouteConfig, publishCloudEvent } from '@dbc-tech/johnny5/dapr'
import {
  AllEnvironments,
  type Environment,
  type JobId,
  type JobStatus,
  type TaskId,
  type TaskStatus,
  type Tenant,
} from '@dbc-tech/johnny5/typebox'
import { type JwtSchema, jwtSchema } from '@dbc-tech/johnny5/typebox/jwt.schema'
import { ConsoleContextLogger, type Logger } from '@dbc-tech/logger'
import type {
  PipedriveV1Service,
  PipedriveV2Service,
} from '@dbc-tech/pipedrive'
import type { PricingService } from '@dbc-tech/pricing'
import jwt from '@elysiajs/jwt'
import Elysia from 'elysia'
import { nanoid } from 'nanoid'
import { createActionstepService } from './actionstep.plugin'
import bearer from './bearer.plugin'
import { createDataverseService } from './dataverse.plugin'
import {
  createPipedriveV1Service,
  createPipedriveV2Service,
} from './pipedrive.plugin'
import { createPricingService } from './pricing.plugin'

export const appContext = (contextConfig: ContextConfig = {}) =>
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

      const { tenant } = token
      if (
        contextConfig.allowedTenants &&
        !contextConfig.allowedTenants.includes(tenant)
      ) {
        set.status = 401
        return 'Unauthorized'
      }

      if (contextConfig.authorize && !(await contextConfig.authorize(token))) {
        set.status = 401
        return 'Unauthorized'
      }
    })
    .resolve({ as: 'scoped' }, async ({ jwtauth, bearer, headers, path }) => {
      const token = await jwtauth.verify(bearer)

      if (!token) {
        throw new Error('Unexpected error resolving the bearer token')
      }

      return {
        ctx: createAppContext(contextConfig, headers, path, token),
      }
    })

export type AppContext = {
  correlationId: string
  name: string
  jwt: JwtSchema
  environment: Environment
  logger: Logger
  config: AppConfig
  actionstep: () => ActionStepService
  dataverse: () => DataverseService
  pipedriveV1: () => PipedriveV1Service
  pipedriveV2: () => PipedriveV2Service
  pricing: (tenant?: Tenant) => PricingService
  johnny5Config: Johnny5ConfigService
  jobStatus: (
    jobId: string,
    fileId: string,
    status: JobStatus,
    errorReason?: string,
  ) => Promise<void>
  taskStatus: (
    taskId: string,
    fileId: string,
    status: TaskStatus,
    errorReason?: string,
  ) => Promise<void>
  start: (
    route: RouteConfig,
    data: JobId | TaskId,
    scheduledEnqueueTimeUtc?: Date,
  ) => Promise<void>
}

export type ContextConfig = {
  logLevel?: string
  /**
   * @deprecated use `authorize` instead
   *
   * List of tenants that are authorized to use this context.
   * If not provided, all tenants are authorized.
   */
  allowedTenants?: Tenant[]
  authorize?: (jwt: JwtSchema) => Promise<boolean>
  correlationId?: string
}

export const createAppContext = (
  contextConfig: ContextConfig,
  headers: Record<string, string | undefined>,
  path: string,
  jwt: JwtSchema,
): AppContext => {
  const correlationId = nanoid(16)
  contextConfig.correlationId = correlationId
  const { tenant } = jwt
  const logger = ConsoleContextLogger({
    ...contextConfig,
    tenant,
  })
  const environment = getEnvironment()
  const config = appConfig({
    connectionString: process.env.APP_CONFIGURATION_CONNECTION_STRING!,
    appName: `CCA:Services`,
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
    pipedriveV1: () => createPipedriveV1Service(headers, logger, correlationId),
    pipedriveV2: () => createPipedriveV2Service(headers, logger, correlationId),
    pricing: (tenant?: Tenant) =>
      createPricingService(tenant || jwt.tenant, correlationId, logger),
    johnny5Config,
    jobStatus: (
      jobId: string,
      fileId: string,
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
    taskStatus: (
      taskId: string,
      fileId: string,
      status: TaskStatus,
      errorReason: string | undefined,
    ) =>
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
    start: (
      route: RouteConfig,
      data: JobId | TaskId,
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
  }
}

export const getEnvironment = (): Environment => {
  let env: Environment = (process.env.APP_ENV || 'dev') as Environment
  if (!AllEnvironments.includes(env as Environment)) env = 'dev'
  return env
}
