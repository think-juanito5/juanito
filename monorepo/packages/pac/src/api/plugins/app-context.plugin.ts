import type { ActionStepService } from '@dbc-tech/actionstep'
import { type AppConfig, appConfig } from '@dbc-tech/azure-config'
import type { HttpService } from '@dbc-tech/http'
import type { Johnny5Service } from '@dbc-tech/johnny5-http-service'
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
import jwt from '@elysiajs/jwt'
import Elysia from 'elysia'
import { nanoid } from 'nanoid'
import { type PACActionStepService } from '../../pac.actionstep.service'
import {
  createActionstepService,
  createPacActionstepService,
} from './actionstep.plugin'
import bearer from './bearer.plugin'
import { createHttpService } from './http.plugin'
import { createJohnny5Service } from './johnny5-services.plugin'

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
  // intouch: () => IntouchService
  actionstep: () => ActionStepService
  pacActionstep: () => PACActionStepService
  services: (tenant: Tenant) => Johnny5Service
  httpService: () => HttpService
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
    httpService: () => createHttpService({ baseUrl: '', logger }),
    pacActionstep: () =>
      createPacActionstepService(tenant, headers, logger, correlationId),
    services: (tenant: Tenant) =>
      createJohnny5Service(tenant, logger, correlationId),
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
