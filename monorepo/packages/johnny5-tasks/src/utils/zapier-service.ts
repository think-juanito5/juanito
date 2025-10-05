import type { HttpServiceConfig, HttpServiceError } from '@dbc-tech/http'
import { HttpService } from '@dbc-tech/http'
import {
  CZapierResponse,
  type ZapierPayload,
  type ZapierResponse,
} from '@dbc-tech/johnny5'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import { NotFoundError } from 'elysia'
import type { ZapierServiceConfig } from './zapier-service.types'

export const errorFrom = (err: HttpServiceError) => {
  if (err.response.status === 404) return new NotFoundError(err.statusText)
  return new Error(err.statusText)
}

export class ZapierService {
  private logger: Logger
  private httpService: HttpService

  constructor(config: ZapierServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-client-id': config.clientId || 'ZapierService',
    }
    if (config.correlationId) headers['x-correlation-id'] = config.correlationId

    const httpServiceConfig: HttpServiceConfig = {
      baseUrl: config.baseUrl,
      defaultHeaders: headers,
      logger: this.logger,
      retries: config.retries ?? 5,
    }
    this.httpService = new HttpService(httpServiceConfig)
  }

  async ccaQuoteThankyou(body: ZapierPayload): Promise<ZapierResponse> {
    const result = await this.httpService.post(
      { path: `/hooks/catch/21970356/u3nnu65/`, body },
      CZapierResponse,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }
}
