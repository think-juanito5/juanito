import { FilenotePipedriveService } from '@dbc-tech/cca-common'
import type { Logger } from '@dbc-tech/logger'
import { PipedriveV1Service } from '@dbc-tech/pipedrive'
import Elysia from 'elysia'
import { logger } from './logger.plugin'

export const createPipedriveV1Service = (
  headers: Record<string, string | undefined>,
  logger: Logger,
  correlationId?: string,
) => {
  return new PipedriveV1Service({
    baseUrl: process.env.PIPEDRIVE_PROXY_URL!,
    apiToken: process.env.PIPEDRIVE_API_TOKEN!,
    clientId: headers['x-client-id'] || 'filenote-client-id',
    logger,
    correlationId,
  })
}

export const createFilenotePipedriveService = (
  pipedrive: PipedriveV1Service,
  logger: Logger,
) => {
  return new FilenotePipedriveService(pipedrive, logger)
}

export const filenotePipedriveSvc = new Elysia()
  .use(logger)
  .resolve({ as: 'scoped' }, async ({ headers, logger }) => {
    const pipedrive = createPipedriveV1Service(headers, logger)

    return {
      filenotePipedrive: createFilenotePipedriveService(pipedrive, logger),
    }
  })
