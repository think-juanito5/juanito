import { Readable } from 'stream'
import type { FetchParams, HttpServiceConfig } from '@dbc-tech/http'
import { HttpService, errorFrom } from '@dbc-tech/http'
import { type Logger, NullLogger } from '@dbc-tech/logger'

export type BlobStorageConfig = {
  baseUrl: string
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}

export class BlobStorageService {
  private logger: Logger
  private httpService: HttpService

  constructor(config: BlobStorageConfig) {
    this.logger = config.logger ?? NullLogger()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-client-id': config.clientId || 'BlobStorageService',
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

  async download(url: string): Promise<Readable> {
    const fetchParams: FetchParams = {
      path: '',
      customOptions: {
        dataFormat: 'stream',
        overrideBaseUrl: url,
      },
    }

    const result = await this.httpService.get(fetchParams)
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data as Readable
  }
}
