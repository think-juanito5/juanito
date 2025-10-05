import type { Logger } from '@dbc-tech/logger'
import { PipedriveV1Service, PipedriveV2Service } from '@dbc-tech/pipedrive'
import Elysia from 'elysia'
import { logger } from './logger.plugin'

export const pipedriveV1 = (apiToken?: string) =>
  new Elysia()
    .use(logger)
    .resolve({ as: 'scoped' }, async ({ headers, logger }) => {
      return {
        pipedrive: createPipedriveV1Service({ headers, logger, apiToken }),
      }
    })

export const pipedriveV2 = (apiToken?: string) =>
  new Elysia()
    .use(logger)
    .resolve({ as: 'scoped' }, async ({ headers, logger }) => {
      return {
        pipedrive: createPipedriveV2Service({ headers, logger, apiToken }),
      }
    })

export type PipedriveArgs = {
  headers: Record<string, string | undefined>
  logger: Logger
  apiToken?: string
  correlationId?: string
}

export const createPipedriveV1Service = ({
  headers,
  logger,
  apiToken,
  correlationId,
}: PipedriveArgs) => {
  return new PipedriveV1Service({
    baseUrl: process.env.PIPEDRIVE_PROXY_URL!,
    apiToken: apiToken || process.env.PIPEDRIVE_API_TOKEN!,
    clientId: headers['x-client-id'] || '',
    logger,
    correlationId,
  })
}

export const createPipedriveV2Service = ({
  headers,
  logger,
  apiToken,
  correlationId,
}: PipedriveArgs) => {
  return new PipedriveV2Service({
    baseUrl: process.env.PIPEDRIVE_PROXY_URL!,
    apiToken: apiToken || process.env.PIPEDRIVE_API_TOKEN!,
    clientId: headers['x-client-id'] || '',
    logger,
    correlationId,
  })
}
