import type { Tenant } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import Elysia from 'elysia'
import { TypeformService } from '../../typeform/typeform.service'
import { logger } from './logger.plugin'

export const ccaTypeform = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ logger }) => {
    return { typeform: createTypeFormService('CCA', logger) }
  })

export const fclTypeform = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ logger }) => {
    return { typeform: createTypeFormService('FCL', logger) }
  })

export const btrTypeform = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ logger }) => {
    return { typeform: createTypeFormService('BTR', logger) }
  })

export const createTypeFormService = (
  tenant: Tenant,
  logger: Logger,
  correlationId?: string,
) =>
  new TypeformService({
    baseUrl: process.env[`CCA_TYPEFORM_API_URL`]!,
    apiKey: process.env[`${tenant}_TYPEFORM_API_KEY`]!,
    logger,
    correlationId,
  })
