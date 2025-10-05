import type {
  HttpServiceConfig,
  HttpServiceError,
  HttpServiceResponse,
} from '@dbc-tech/http'
import type { FetchParams, StreamHttpServiceResponse } from '@dbc-tech/http'
import { HttpService, errorFrom } from '@dbc-tech/http'
import type { CcaRaqWebhook } from '@dbc-tech/johnny5'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import type { PipedriveWebhookV1 } from '@dbc-tech/pipedrive'
import type { TSchema, TUnknown } from '@sinclair/typebox'
import type { TypeCheck } from '@sinclair/typebox/compiler'
import type { Result } from 'ts-results-es'

export type DatalakeServiceConfig = {
  baseUrl: string
  clientId?: string
  correlationId?: string
  retries?: number
  apikey?: string
  logger?: Logger
}

export class DatalakeService {
  private logger: Logger
  private httpService: HttpService
  private config: DatalakeServiceConfig

  constructor(config: DatalakeServiceConfig) {
    this.config = config
    this.logger = config.logger ?? NullLogger()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-client-id': config.clientId || 'DatalakeService',
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

  async delete(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async delete<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async delete<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.delete(fetchParams, typeCheck)
      : this.httpService.delete(fetchParams)
  }

  async get(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async get(
    fetchParams: FetchParams,
  ): Promise<Result<StreamHttpServiceResponse, HttpServiceError>>
  async get<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async get<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.get(fetchParams, typeCheck)
      : this.httpService.get(fetchParams)
  }

  async patch(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async patch<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async patch<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.patch(fetchParams, typeCheck)
      : this.httpService.patch(fetchParams)
  }

  async post(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async post<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async post<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.post(fetchParams, typeCheck)
      : this.httpService.post(fetchParams)
  }

  async put(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async put<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async put<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.put(fetchParams, typeCheck)
      : this.httpService.put(fetchParams)
  }

  async submitCcaRaq(body: CcaRaqWebhook) {
    const result = await this.httpService.post({
      headers: {
        'X-Api-Key': this.config.apikey!,
        'X-Data-Source': 'RequestAQuote',
      },
      path: `/lead/requestquote`,
      body,
    })
    if (!result.ok) throw errorFrom(result.val)
    return result.val
  }

  async submitCcaPipedrivePersonWebhook(body: PipedriveWebhookV1) {
    const result = await this.httpService.post({
      path: `/lead/pipedriveperson`,
      body,
    })
    if (!result.ok) throw errorFrom(result.val)
    return result.val
  }

  async submitCcaPipedriveDealWebhook(body: PipedriveWebhookV1) {
    const result = await this.httpService.post({
      path: `/lead/pipedrivedeal`,
      body,
    })
    if (!result.ok) throw errorFrom(result.val)
    return result.val
  }
}
