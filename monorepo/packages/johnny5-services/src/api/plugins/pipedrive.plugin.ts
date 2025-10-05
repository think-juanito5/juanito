import type { Logger } from '@dbc-tech/logger'
import { PipedriveV1Service, PipedriveV2Service } from '@dbc-tech/pipedrive'
import Elysia from 'elysia'
import { logger } from './logger.plugin'

export const pipedriveV1 = new Elysia()
  .use(logger)
  .resolve({ as: 'scoped' }, async ({ headers, logger }) => {
    return { pipedrive: createPipedriveV1Service(headers, logger) }
  })

export const pipedriveV2 = new Elysia()
  .use(logger)
  .resolve({ as: 'scoped' }, async ({ headers, logger }) => {
    return { pipedrive: createPipedriveV2Service(headers, logger) }
  })

export const createPipedriveV1Service = (
  headers: Record<string, string | undefined>,
  logger: Logger,
  correlationId?: string,
) => {
  return new PipedriveV1Service({
    baseUrl: process.env.PIPEDRIVE_PROXY_URL!,
    apiToken: process.env.PIPEDRIVE_API_TOKEN!,
    clientId: headers['x-client-id'] || '',
    logger,
    correlationId,
  })
}

export const createPipedriveV2Service = (
  headers: Record<string, string | undefined>,
  logger: Logger,
  correlationId?: string,
) => {
  return new PipedriveV2Service({
    baseUrl: process.env.PIPEDRIVE_PROXY_URL!,
    apiToken: process.env.PIPEDRIVE_API_TOKEN!,
    clientId: headers['x-client-id'] || '',
    logger,
    correlationId,
  })
}
