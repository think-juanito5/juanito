import { type Logger, NullLogger } from '@dbc-tech/logger'
import { TypeBoxResponse, fetch } from '@erfanium/fetch-typebox'
import type { Static, TSchema, TUnknown } from '@sinclair/typebox'
import { TypeCheck } from '@sinclair/typebox/compiler'
import {
  ExponentialBackoff,
  type IDefaultPolicyContext,
  type IPolicy,
  handleResultType,
  retry,
  wrap,
} from 'cockatiel'
import { nanoid } from 'nanoid'
import { Err, Ok, type Result } from 'ts-results-es'

type ResiliencePolicy<
  C extends IDefaultPolicyContext = IDefaultPolicyContext,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  A = any,
> = IPolicy<C, A>

export type HttpServiceConfig = {
  authHeader?: () => Promise<string>
  baseUrl: string
  defaultHeaders?: Record<string, string>
  logger?: Logger
  retries?: number
}

export type HttpServiceError = {
  response: Response
  status: number
  statusText: string
}

export type HttpServiceResponse<T extends TSchema = TUnknown> = {
  response: Response
  status: number
  data: Awaited<Static<T>>
}

export type FetchParams = {
  path: string
  query?: Record<string, string>
  body?: unknown
}

export type FetchInit = FetchParams & { method: string }

export class HttpService {
  private logger: Logger
  readonly resiliencePolicy: ResiliencePolicy
  private authHeader?: string

  constructor(private readonly config: HttpServiceConfig) {
    this.logger = config.logger ?? NullLogger()
    const maxAttempts = config.retries ?? 3
    const authRetryPolicy = retry(
      handleResultType(TypeBoxResponse, (r) => r.status === 401),
      { maxAttempts },
    )
    authRetryPolicy.onFailure(() => {
      this.logger.error('[policy.onFailure] Auth failed')
      this.authHeader = undefined
    })

    const rateLimitRetryPolicy = retry(
      handleResultType(TypeBoxResponse, (r) => r.status === 429),
      { maxAttempts, backoff: new ExponentialBackoff() },
    )
    rateLimitRetryPolicy.onFailure(() => {
      this.logger.error('[policy.onFailure] Rate limit exceeded')
    })

    const serverErrorRetry = retry(
      handleResultType(TypeBoxResponse, (r) => r.status >= 500).orType(Error),
      { maxAttempts, backoff: new ExponentialBackoff() },
    )
    serverErrorRetry.onFailure(() => {
      this.logger.error('[policy.onFailure] Network or Server error >= 500')
    })

    this.resiliencePolicy = wrap(
      authRetryPolicy,
      rateLimitRetryPolicy,
      serverErrorRetry,
    )
  }

  private async getFetchInit(
    method: string,
    body?: unknown,
  ): Promise<RequestInit> {
    const requestInit: RequestInit = {
      method,
      body: body ? JSON.stringify(body) : undefined,
    }

    requestInit.headers = new Headers(this.config.defaultHeaders)

    if (this.config.authHeader) {
      if (!this.authHeader) this.authHeader = await this.config.authHeader()
      requestInit.headers.set('Authorization', this.authHeader)
    }

    return requestInit
  }

  private getUrl(path: string, query?: Record<string, string>): string {
    const buildUrl = (baseUrl: string, path: string) => {
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1)
      }

      if (!path.startsWith('/')) {
        path = `/${path}`
      }

      return new URL(`${baseUrl}${path}`)
    }
    const url = buildUrl(this.config.baseUrl, path).toString()
    return query && Object.keys(query).length > 0
      ? `${url}?${new URLSearchParams(query).toString()}`
      : url
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
    const fetchInit = { ...fetchParams, method: 'DELETE' }
    return typeCheck ? this.send(fetchInit, typeCheck) : this.send(fetchInit)
  }

  async get(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
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
    const fetchInit = { ...fetchParams, method: 'GET' }
    return typeCheck ? this.send(fetchInit, typeCheck) : this.send(fetchInit)
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
    const fetchInit = { ...fetchParams, method: 'PATCH' }
    return typeCheck ? this.send(fetchInit, typeCheck) : this.send(fetchInit)
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
    const fetchInit = { ...fetchParams, method: 'POST' }
    return typeCheck ? this.send(fetchInit, typeCheck) : this.send(fetchInit)
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
    const fetchInit = { ...fetchParams, method: 'PUT' }
    return typeCheck ? this.send(fetchInit, typeCheck) : this.send(fetchInit)
  }

  async send(
    fetchInit: FetchInit,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async send<T extends TSchema = TUnknown>(
    fetchInit: FetchInit,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async send<T extends TSchema = TUnknown>(
    fetchInit: FetchInit,
    typeCheck?: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>> {
    const { path, method, query, body } = fetchInit
    const correlationId =
      this.config.defaultHeaders?.['x-correlation-id'] ?? nanoid()
    const response: TypeBoxResponse = await this.resiliencePolicy.execute(
      async (c) => {
        c.signal
        const url = this.getUrl(path, query)
        const requestInit = await this.getFetchInit(method, body)
        this.logger.debug(`Sending request to ${url}`, {
          correlationId,
          module: 'HttpService',
          method: 'send',
          url,
          requestInit,
        })
        return fetch(url, requestInit)
      },
    )
    if (!response.ok) {
      try {
        const statusText = await response.text()
        this.logger.error(`Error response`, {
          status: response.status,
          correlationId,
          module: 'HttpService',
          method: 'send',
          statusText,
        })
        return Err({
          status: response.status,
          statusText,
          response: response.clone(),
        })
      } catch (_err) {
        this.logger.error(`Error response`, {
          status: response.status,
          correlationId,
          module: 'HttpService',
          method: 'send',
          statusText: response.statusText,
        })
        return Err({
          status: response.status,
          statusText: response.statusText,
          response: response.clone(),
        })
      }
    }

    if (!typeCheck) {
      const data = await response.text()
      this.logger.debug(`Received response`, {
        status: response.status,
        correlationId,
        module: 'HttpService',
        method: 'send',
        data,
      })
      try {
        return Ok({
          status: response.status,
          response,
          data: JSON.parse(data),
        })
      } catch (_err) {
        return Ok({
          status: response.status,
          response,
          data: data as never,
        })
      }
    }

    const data = await response.json(typeCheck)
    this.logger.debug(`Received response`, {
      status: response.status,
      correlationId,
      module: 'HttpService',
      method: 'send',
      data,
    })
    return Ok({
      status: response.status,
      response,
      data,
    })
  }
}
