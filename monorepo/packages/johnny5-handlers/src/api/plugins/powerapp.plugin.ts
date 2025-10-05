import type { Logger } from '@dbc-tech/logger'
import Elysia from 'elysia'
import { PowerappWorkflowService } from '../../johnny5-helper/powerapp-workflow.service'
import { logger } from './logger.plugin'

export const powerapp = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ logger }) => {
    return { powerapp: createPowerappWorkflowService(logger) }
  })

export const createPowerappWorkflowService = (
  logger: Logger,
  correlationId?: string,
) =>
  new PowerappWorkflowService({
    logger,
    correlationId,
  })
