import {
  type HttpServiceConfig,
  type HttpServiceError,
  type HttpServiceResponse,
  errorFrom,
} from '@dbc-tech/http'
import type { FetchParams, StreamHttpServiceResponse } from '@dbc-tech/http'
import { HttpService } from '@dbc-tech/http'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import type { TSchema, TUnknown } from '@sinclair/typebox'
import type { TypeCheck } from '@sinclair/typebox/compiler'
import _ from 'lodash'
import type { Result } from 'ts-results-es'
import {
  CV2CreatePersonResponse,
  CV2Deal,
  CV2DealResponse,
  CV2Deals,
  CV2PersonResponse,
  type V2CreatePersonResponse,
  type V2Deal,
  type V2DealCreate,
  type V2DealResponse,
  type V2DealUpdate,
  type V2Deals,
  type V2PersonCreate,
  type V2PersonResponse,
  type V2PersonResponseItem,
  type V2PersonUpdate,
  type V2SearchPerson,
} from './schemas/v2/deal.schema'
import {
  CDealPersonResponse,
  type DealPersonResponse,
} from './types/pipedrive.person.request.v2.schema'

export type PipedriveV2ServiceConfig = {
  baseUrl: string
  apiToken: string
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}

export class PipedriveV2Service {
  private logger: Logger
  private httpService: HttpService

  constructor(config: PipedriveV2ServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-client-id': config.clientId || 'PipedriveV2Service',
    }
    if (config.correlationId) headers['x-correlation-id'] = config.correlationId

    const defaultQueryParams = { api_token: config.apiToken }

    const httpServiceConfig: HttpServiceConfig = {
      baseUrl: config.baseUrl,
      defaultHeaders: headers,
      defaultQueryParams: defaultQueryParams,
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

  /**
   * Get details of a deal
   * @param id - The ID of the deal to retrieve.
   * @param query - Optional query parameters to include in the request.
   * @returns A Promise that resolves to the retrieved Deal object.
   * @throws An error if the request fails.
   */
  async getDeal(id: number, query?: Record<string, string>): Promise<V2Deal> {
    const result = await this.httpService.get(
      { path: `/api/v2/deals/${id}`, query },
      CV2Deal,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  /**
   * Retrieves a deal person from Pipedrive by their ID.
   * @param personId - The ID of the person to retrieve.
   * @returns A Promise that resolves to a DealPersonResponse object representing the retrieved deal person.
   * @throws An error if the retrieval fails.
   */
  async getDealPerson(personId: number): Promise<DealPersonResponse> {
    const result = await this.httpService.get(
      { path: `/api/v2/persons/${personId}` },
      CDealPersonResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async createDeal(body: V2DealCreate): Promise<V2DealResponse> {
    const result = await this.httpService.post(
      { path: '/api/v2/deals', body },
      CV2DealResponse,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async searchPerson(body: V2SearchPerson): Promise<V2PersonResponse> {
    const result = await this.httpService.get(
      {
        path: `/api/v2/persons/search`,
        query: { fields: body.field, term: body.term },
      },
      CV2PersonResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async searchPersonByTerm(
    searchParams: V2SearchPerson[],
  ): Promise<V2PersonResponseItem[]> {
    let searchResults: V2PersonResponseItem[] = []

    for (let index = 0; index < searchParams.length; index++) {
      const param = searchParams[index]
      const result = await this.searchPerson(param)

      if (index === 0 && result.data && result.data.items.length === 0) {
        searchResults = []
      } else {
        if (index === 0) {
          searchResults = result.data!.items
        } else {
          searchResults = _.intersectionBy(
            searchResults,
            result.data!.items,
            'item.id',
          )
        }
      }
    }

    return searchResults
  }

  async createPerson(body: V2PersonCreate): Promise<V2CreatePersonResponse> {
    const result = await this.httpService.post(
      {
        path: '/api/v2/persons',
        body,
      },
      CV2CreatePersonResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async getPerson(id: number): Promise<V2CreatePersonResponse | number> {
    const result = await this.httpService.get(
      {
        path: `/api/v2/persons/${id}`,
        query: { include_fields: 'marketing_status' },
      },
      CV2CreatePersonResponse,
    )
    if (!result.ok) {
      return 0
    }
    return result.val.data
  }

  async updatePerson(
    id: number,
    body: V2PersonUpdate,
  ): Promise<V2CreatePersonResponse> {
    const result = await this.httpService.patch(
      {
        path: `/api/v2/persons/${id}`,
        body,
      },
      CV2CreatePersonResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  /**
   * Get deals associated with a person.
   * @param query - Optional query parameters to include in the request.
   * @returns A Promise that resolves to the retrieved Deal object.
   * @throws An error if the request fails.
   */
  async getDeals(query?: Record<string, string>): Promise<V2Deals> {
    const result = await this.httpService.get(
      { path: `/api/v2/deals`, query },
      CV2Deals,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  /**
   * Updates an existing deal in the Pipedrive system.
   *
   * @param id - The unique identifier of the deal to update.
   * @param body - The data to update the deal with, conforming to the V2DealData interface.
   * @returns A promise that resolves to the updated deal response of type V2DealResponse.
   * @throws Will throw an error if the HTTP request fails or the response is not OK.
   */
  async updateDeal(id: number, body: V2DealUpdate): Promise<V2DealResponse> {
    const result = await this.httpService.patch(
      {
        path: `/api/v2/deals/${id}`,
        body,
      },
      CV2DealResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }
}
