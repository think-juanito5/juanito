import { ActionStepService } from '@dbc-tech/actionstep'
import type { Tenant } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import Elysia from 'elysia'
import { logger } from './logger.plugin'

export const btrActionstep = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ headers, logger }) => {
    return {
      actionstep: createActionstepService('BTR', headers, logger),
    }
  })

export const ccaActionstep = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ headers, logger }) => {
    return {
      actionstep: createActionstepService('CCA', headers, logger),
    }
  })

export const fclActionstep = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ headers, logger }) => {
    return {
      actionstep: createActionstepService('FCL', headers, logger),
    }
  })

export const createActionstepService = (
  tenant: Tenant,
  headers: Record<string, string | undefined>,
  logger: Logger,
  correlationId?: string,
) => {
  const deets = {
    baseUrl: process.env[`${tenant}_ACTIONSTEP_API_URL`]!,
    tokenUrl: process.env.AUTH_BASE_URL!,
    apikey: process.env[`${tenant}_API_KEY`]!,
    clientId: headers['x-client-id'] || process.env.APP_NAME,
    correlationId,
    logger,
  }
  return new ActionStepService(deets)
}
