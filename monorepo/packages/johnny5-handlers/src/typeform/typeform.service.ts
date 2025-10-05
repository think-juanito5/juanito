import { Readable } from 'stream'
import type { HttpServiceConfig, HttpServiceError } from '@dbc-tech/http'
import { HttpService } from '@dbc-tech/http'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import { NotFoundError } from 'elysia'
import type { TypeformServiceConfig } from './types/typeform-types'

export const errorFrom = (err: HttpServiceError) => {
  if (err.response.status === 404) return new NotFoundError(err.statusText)
  return new Error(err.statusText)
}

export class TypeformService {
  private logger: Logger
  private httpService: HttpService

  constructor(config: TypeformServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      Accept: 'application/json',
      'x-client-id': config.clientId || 'TypeformService',
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

  /**
   * Downloads a file from a Typeform response.
   * @param formId - The ID of the Typeform.
   * @returns A Promise that resolves to a Readable stream containing the file data.
   * @throws An error if the download fails.
   */
  async downloadFile(formId: string): Promise<Readable> {
    const result = await this.httpService.get({
      path: `/forms/${formId}/responses/files`,
      customOptions: { dataFormat: 'stream' },
    })
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data as Readable
  }

  /**
   * Downloads a file from a Typeform response.
   * @param path - The path part of the Typeform url containing the.
   * @returns A Promise that resolves to a Readable stream containing the file data.
   * @throws An error if the download fails.
   */
  async downloadFileFromPath(path: string): Promise<Readable> {
    const result = await this.httpService.get({
      path,
      customOptions: { dataFormat: 'stream' },
    })
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data as Readable
  }
}
