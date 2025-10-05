import { Readable } from 'stream'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import type { Static, TSchema, TUnknown } from '@sinclair/typebox'
import { TypeCheck } from '@sinclair/typebox/compiler'
import {
  ExponentialBackoff,
  type IDefaultPolicyContext,
  type IPolicy,
  handleResultType,
  handleType,
  retry,
  wrap,
} from 'cockatiel'
import { nanoid } from 'nanoid'
import { serializeError } from 'serialize-error'
import { Err, Ok, type Result } from 'ts-results-es'

type ResiliencePolicy<
  C extends IDefaultPolicyContext = IDefaultPolicyContext,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  A = any,
> = IPolicy<C, A>

export class ResponseValidationError extends Error {}

export type HttpServiceConfig = {
  authHeader?: () => Promise<string>
  authHeaderKey?: string
  defaultHeaders?: Record<string, string>
  baseUrl: string
  defaultQueryParams?: Record<string, string>
  logger?: Logger
  retries?: number
  disableResponseLogging?: boolean
  authFailureBackoffInitialDelay?: number
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

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public response: Response,
  ) {
    super(message)
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

export const errorFrom = (err: HttpServiceError) =>
  new HttpError(err.statusText, err.response.status, err.response)

export type StreamHttpServiceResponse = {
  response: Response
  status: number
  data: Readable
}

/**
 * typed customOptions for the HTTP service.
 */
type CustomOptions = {
  dataFormat?: 'stream'
  action?: 'upload'
  filename?: string
  overrideBaseUrl?: string
  rawBody?: boolean
}

export type FetchParams = {
  path: string
  query?: Record<string, string>
  body?: unknown
  headers?: Record<string, string>
  customOptions?: CustomOptions
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
      handleResultType(Response, (r) => {
        return r.status === 401
      }),
      {
        maxAttempts,
        backoff: new ExponentialBackoff({
          initialDelay: config.authFailureBackoffInitialDelay,
        }),
      },
    )
    authRetryPolicy.onFailure(async (e) => {
      if (!e.handled) return

      await this.logger.error('[authRetryPolicy.onFailure] event', e)
      this.authHeader = undefined
    })

    const rateLimitRetryPolicy = retry(
      handleResultType(Response, (r) => {
        return r.status === 429
      }),
      { maxAttempts, backoff: new ExponentialBackoff() },
    )
    rateLimitRetryPolicy.onFailure(async (e) => {
      if (!e.handled) return

      await this.logger.error('[rateLimitRetryPolicy.onFailure] event', e)
    })

    const serverErrorRetry = retry(
      handleResultType(Response, (r) => {
        return r.status >= 500
      }),
      { maxAttempts, backoff: new ExponentialBackoff() },
    )
    serverErrorRetry.onFailure(async (e) => {
      if (!e.handled) return

      await this.logger.debug('[serverErrorRetry.onFailure] event', e)
    })

    const exceptionRetry = retry(handleType(Error), {
      maxAttempts,
      backoff: new ExponentialBackoff(),
    })
    exceptionRetry.onFailure(async (e) => {
      if (!e.handled) return

      if ('error' in e.reason) {
        const error = e.reason.error
        await this.logger.error(
          `[exceptionRetry.onFailure] exception:${error.name}`,
          serializeError(error),
        )
      } else {
        await this.logger.debug(
          '[exceptionRetry.onFailure] event',
          JSON.stringify(serializeError(e)),
        )
      }
    })

    this.resiliencePolicy = wrap(
      authRetryPolicy,
      rateLimitRetryPolicy,
      serverErrorRetry,
      exceptionRetry,
    )
  }

  private async getFetchInit(
    method: string,
    body?: unknown,
    headers?: Record<string, string>,
    customOptions?: CustomOptions,
  ): Promise<RequestInit> {
    const formData = new FormData()
    // const operation = customOptions?.action
    const { rawBody, action: operation } = customOptions ?? {}
    if (operation === 'upload') {
      const fileName = customOptions?.filename ?? 'tempfile'
      const buffer = body as Buffer
      formData.append('file', new Blob([new Uint8Array(buffer)]), fileName)
    }

    const requestInit: RequestInit = { method }

    if (body && rawBody) {
      requestInit.body = body as string
    } else if (body) {
      requestInit.body =
        operation === 'upload' ? formData : JSON.stringify(body)
    }

    requestInit.headers = new Headers({
      ...this.config.defaultHeaders,
      ...headers,
    })
    if (operation === 'upload') {
      requestInit.headers.delete('content-type')
      requestInit.headers.delete('accept')
    }

    if (this.config.authHeader) {
      if (!this.authHeader) this.authHeader = await this.config.authHeader()
      requestInit.headers.set(
        this.config.authHeaderKey ?? 'Authorization',
        this.authHeader!,
      )
    }
    return requestInit
  }

  private getUrl(
    path: string,
    query?: Record<string, string>,
    customOptions?: CustomOptions,
  ): string {
    const buildUrl = (baseUrl: string, path: string) => {
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1)
      }

      if (!!baseUrl && !path.startsWith('/')) {
        path = `/${path}`
      }

      const url = new URL(`${baseUrl}${path}`)
      return url
    }

    const isCustomUrlDocument = (url: string): boolean => {
      const urlExtensions = /\.(pdf|xls|xlsx|jpg|jpeg|png|doc|docx|ppt|pptx)$/i
      return urlExtensions.test(url)
    }

    const overrideBaseUrl = customOptions?.overrideBaseUrl ?? ''

    const baseUrl =
      overrideBaseUrl.length > 0 ? overrideBaseUrl : this.config.baseUrl

    const url =
      overrideBaseUrl.length > 0 && isCustomUrlDocument(overrideBaseUrl)
        ? baseUrl.toString()
        : buildUrl(baseUrl, path).toString()

    const queryParams = this.config.defaultQueryParams
      ? { ...query, ...this.config.defaultQueryParams }
      : query
    return queryParams && Object.keys(queryParams).length > 0
      ? `${url}?${new URLSearchParams(queryParams).toString()}`
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

  async send<T extends TSchema = TUnknown>(
    fetchInit: FetchInit,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<StreamHttpServiceResponse, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    const { path, method, query, body, headers, customOptions } = fetchInit
    const dataFormat = customOptions?.dataFormat
    const correlationId =
      this.config.defaultHeaders?.['x-correlation-id'] ?? nanoid()
    const response: Response = await this.resiliencePolicy.execute(
      async (c) => {
        c.signal
        const url = this.getUrl(path, query, customOptions)
        const requestInit = await this.getFetchInit(
          method,
          body,
          headers,
          customOptions,
        )

        await this.logger.debug(`Sending request to ${url}`, {
          correlationId,
          module: 'HttpService',
          method: 'send',
          url,
          requestInit,
        })

        return await fetch(url, requestInit)
      },
    )

    if (
      response.ok &&
      response.status === 204 &&
      response.statusText === 'No Content'
    ) {
      await this.logger.debug(`Empty response`, {
        status: response.status,
        correlationId,
        module: 'HttpService',
        method: 'send',
      })

      return Ok({
        status: response.status,
        response,
        data: undefined,
      })
    }

    if (!response.ok) {
      try {
        const statusText = await response.text()
        await this.logger.error(`Error response`, {
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
        await this.logger.error(`Error response`, {
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

    if (dataFormat === 'stream') {
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No readable stream available from response.')
      }

      const stream = new Readable({
        async read() {
          const { done, value } = await reader.read()
          if (done) {
            this.push(null)
          } else {
            this.push(Buffer.from(value))
          }
        },
      })

      return Ok({
        status: response.status,
        response,
        data: stream,
      })
    }

    if (!typeCheck) {
      const data = await response.text()
      if (!this.config.disableResponseLogging) {
        await this.logger.debug(`Received response`, {
          status: response.status,
          correlationId,
          module: 'HttpService',
          method: 'send',
          data,
        })
      }
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

    const data = await response.json()
    const result = typeCheck.Check(data)
    if (!result) {
      const errors = typeCheck.Errors(data)
      const firstError = errors.First()
      await this.logger.error('Response schema validation error', {
        path: firstError?.path,
        value: firstError?.value,
        message: firstError?.message,
      })

      throw new ResponseValidationError(
        `ResponseValidationError ${firstError?.message}. path: ${firstError?.path} value: ${firstError?.value}`,
        {
          cause: firstError,
        },
      )
    }

    if (!this.config.disableResponseLogging) {
      await this.logger.debug(`Received response`, {
        status: response.status,
        correlationId,
        module: 'HttpService',
        method: 'send',
        data,
      })
    }
    return Ok({
      status: response.status,
      response,
      data,
    })
  }
}
