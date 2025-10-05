import type { HttpServiceConfig, HttpServiceError } from '@dbc-tech/http'
import { HttpService } from '@dbc-tech/http'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import { NotFoundError } from 'elysia'
import {
  CPowerappExtractResponse,
  type PowerappExtractResponse,
} from './powerapp-workflow.schema'
import type { PowerappWorkflowServiceConfig } from './types/powerapp-workflow.types'

export const errorFrom = (err: HttpServiceError) => {
  if (err.response.status === 404) return new NotFoundError(err.statusText)
  return new Error(err.statusText)
}
export class PowerappWorkflowService {
  private logger: Logger

  constructor(private readonly config: PowerappWorkflowServiceConfig) {
    this.logger = config.logger ?? NullLogger()
  }

  private createHttpService(url: URL): HttpService {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-client-id': this.config.clientId || 'PowerappWorkflowService',
    }
    if (this.config.correlationId)
      headers['x-correlation-id'] = this.config.correlationId

    const httpServiceConfig: HttpServiceConfig = {
      baseUrl: url.origin,
      defaultHeaders: headers,
      logger: this.logger,
      retries: this.config.retries ?? 5,
      disableResponseLogging: true,
    }
    return new HttpService(httpServiceConfig)
  }

  async sendDocumentToExtract(
    powerAppsUrl: string,
    body: {
      url: string
    },
  ): Promise<PowerappExtractResponse> {
    const url = new URL(powerAppsUrl)
    const httpService = this.createHttpService(url)
    const query: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })

    const result = await httpService.post(
      {
        path: url.pathname,
        query,
        body,
      },
      CPowerappExtractResponse,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }
}
