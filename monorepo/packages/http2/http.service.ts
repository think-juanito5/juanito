import { Readable } from 'stream'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import { until } from '@open-draft/until'
import type { Static, TSchema, TUnknown } from '@sinclair/typebox'
import { TypeCheck } from '@sinclair/typebox/compiler'
import { nanoid } from 'nanoid'
import { type $Fetch, FetchError, type FetchResponse, ofetch } from 'ofetch'
import { Err, Ok, type Result } from 'ts-results-es'

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
  retryStatusCodes?: number[]
}

export type HttpServiceError = {
  response: FetchResponse<unknown> | undefined
  status: number
  statusText: string
}

export type HttpServiceResponse<T extends TSchema = TUnknown> = {
  response: FetchResponse<unknown>
  status: number
  data: Awaited<Static<T>>
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public response: FetchResponse<unknown> | undefined,
  ) {
    super(message)
    Object.setPrototypeOf(this, HttpError.prototype)
  }

  override toString() {
    if (this.response?._data === undefined) {
      return this.message
    }
    if (typeof this.response._data === 'string') {
      return this.response._data
    }
    try {
      return JSON.stringify(this.response._data)
    } catch {
      return this.message
    }
  }
}

export const errorFrom = (err: HttpServiceError) =>
  new HttpError(err.statusText, err.status, err.response)

export type StreamHttpServiceResponse = {
  response: FetchResponse<unknown>
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
  private apiFetch: $Fetch
  private authToken?: string
  private correlationId?: string

  constructor(private readonly config: HttpServiceConfig) {
    this.logger = config.logger ?? NullLogger()
    this.apiFetch = this.createFetch(config)
  }

  private createFetch(config: HttpServiceConfig) {
    const self = this
    const apiFetch = ofetch.create({
      retry: config.retries ?? 3,
      retryDelay: config.authFailureBackoffInitialDelay ?? 500,
      retryStatusCodes: config.retryStatusCodes ?? [
        401, 408, 409, 425, 429, 500, 502, 503, 504,
      ],
      async onRequest({ request, options }) {
        self.logger.debug('[onRequest]', {
          request,
          options,
          correlationId: self.correlationId,
        })

        if (!self.authToken && config.authHeader)
          self.authToken = await config.authHeader()
        if (self.authToken) {
          options.headers.set('Authorization', self.authToken)
        }
      },
      async onResponseError({ request, response }) {
        self.logger.error('[onResponseError]', {
          request,
          status: response.status,
          statusText: response.statusText,
          correlationId: self.correlationId,
        })
        if (response.status === 401) {
          self.authToken = undefined // Reset auth header on error
        }
      },
    })

    return apiFetch
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

    return requestInit
  }

  private getUrl(
    path: string,
    query?: Record<string, string>,
    customOptions?: CustomOptions,
  ): string {
    const buildUrl = (baseUrl: string | undefined, path: string) => {
      if (baseUrl && baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1)
      }

      if (baseUrl && !path.startsWith('/')) {
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
    this.correlationId =
      this.config.defaultHeaders?.['x-correlation-id'] ?? nanoid()
    const url = this.getUrl(path, query, customOptions)
    const requestInit = await this.getFetchInit(
      method,
      body,
      headers,
      customOptions,
    )

    await this.logger.debug(`[send] Sending request to ${url}`, {
      correlationId: this.correlationId,
      url,
      requestInit,
    })

    const { error, data: response } = await until<
      FetchError<unknown>,
      FetchResponse<unknown>
    >(() => this.apiFetch.raw(url, requestInit))

    if (error) {
      try {
        await this.logger.error(`[send] Error response`, {
          status: error.status,
          correlationId: this.correlationId,
          statusText: error.statusText,
        })
        return Err({
          status: error.status as number,
          statusText:
            error.statusText ??
            (typeof error.data === 'string'
              ? error.data
              : JSON.stringify(error.data)),
          response: error.response,
        })
      } catch (_err) {
        await this.logger.error(`[send] Error response`, {
          status: error.status,
          correlationId: this.correlationId,
          statusText: error.statusText,
        })
        return Err({
          status: error.status as number,
          statusText: error.statusText as string,
          response: error.response,
        })
      }
    }

    if (response.status === 204 && response.statusText === 'No Content') {
      await this.logger.debug(`[send] Empty response`, {
        status: response.status,
        correlationId: this.correlationId,
      })

      return Ok({
        status: response.status,
        response,
        data: undefined,
      })
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
      const data = await response._data
      if (!this.config.disableResponseLogging) {
        await this.logger.debug(`[send] Received response`, {
          status: response.status,
          correlationId: this.correlationId,
          data,
        })
      }
      try {
        return Ok({
          status: response.status,
          response,
          data,
        })
      } catch (_err) {
        return Err({
          status: response.status,
          statusText: (_err as Error).message,
          response,
          data: data as never,
        })
      }
    }

    const data = await response._data
    const result = typeCheck.Check(data)
    if (!result) {
      const errors = typeCheck.Errors(data)
      const firstError = errors.First()
      await this.logger.error(`[send] Response schema validation error`, {
        path: firstError?.path,
        value: firstError?.value,
        message: firstError?.message,
        correlationId: this.correlationId,
      })

      throw new ResponseValidationError(
        `ResponseValidationError ${firstError?.message}. path: ${firstError?.path} value: ${firstError?.value}`,
        {
          cause: firstError,
        },
      )
    }

    if (!this.config.disableResponseLogging) {
      await this.logger.debug(`[send] Received response`, {
        status: response.status,
        correlationId: this.correlationId,
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
