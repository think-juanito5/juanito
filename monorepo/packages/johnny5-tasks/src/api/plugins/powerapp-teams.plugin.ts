import type { Logger } from '@dbc-tech/logger'
import { PowerappTeamsService } from '@dbc-tech/teams'
import Elysia from 'elysia'
import { logger } from './logger.plugin'

export const powerappTeams = new Elysia()
  .use(logger)
  .resolve({ as: 'global' }, async ({ logger }) => {
    return { powerappTeams: createPowerappTeamsService(logger) }
  })

export const createPowerappTeamsService = (
  logger: Logger,
  correlationId?: string,
) =>
  new PowerappTeamsService({
    logger,
    correlationId,
  })
