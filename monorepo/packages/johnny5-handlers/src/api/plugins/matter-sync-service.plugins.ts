import type { Logger } from '@dbc-tech/logger'
import Elysia from 'elysia'
import { MatterSyncService } from '../../johnny5/cca/utils/matter-update/updater-service'
import { logger } from './logger.plugin'

export const ccaMatterSync = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ logger }) => {
    return { matterSync: createMatterSyncService(logger) }
  })

export const createMatterSyncService = (
  logger: Logger,
  correlationId?: string,
) =>
  new MatterSyncService({
    baseUrl: process.env['STMT_CALCULATOR_API_ENDPOINT']!,
    apiKey: process.env['STMT_CALCULATOR_API_KEY']!,
    logger,
    correlationId,
  })
