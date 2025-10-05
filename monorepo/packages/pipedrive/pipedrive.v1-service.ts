import { Readable } from 'stream'
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
import { NotFoundError } from 'elysia'
import _ from 'lodash'
import { serializeError } from 'serialize-error'
import type { Result } from 'ts-results-es'
import {
  CCreatePerson,
  CDealFile,
  CDealFiles,
  CDealResponse,
  CDealUserResponse,
  CPagePipedriveNotes,
  CPersonResponse,
  CPipedriveDealPutResponse,
  CSinglePipedriveNote,
} from './pipedrive.schema'
import type {
  CreatePersonResponseSchema,
  Deal,
  DealFile,
  DealFiles,
  DealResponse,
  DealResponseSchema,
  DealUserResponse,
  PagePipedriveNotes,
  Person,
  PersonResponse,
  PersonResponseItem,
  PipedriveDealPutResponse,
  SearchPerson,
  SinglePipedriveNote,
} from './pipedrive.schema'
import type { DealDocuments, PipedriveServiceConfig } from './types'

export class PipedriveV1Service {
  private logger: Logger
  private httpService: HttpService

  constructor(config: PipedriveServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-client-id': config.clientId || 'PipedriveV1Service',
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
   * Retrieves a file from Pipedrive by its ID.
   * @param fileId - The ID of the file to retrieve.
   * @param query - Optional query parameters to include in the request.
   * @returns A Promise that resolves to the retrieved DealFile object.
   * @throws An error if the request fails.
   */
  async getFile(
    fileId: number,
    query?: Record<string, string>,
  ): Promise<DealFile> {
    const result = await this.httpService.get(
      { path: `/v1/files/${fileId}`, query },
      CDealFile,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  /**
   * Downloads a file from the specified fileId.
   * @param fileId - The ID of the file to download.
   * @returns A Promise that resolves to a Readable stream containing the file data.
   * @throws If there is an error downloading the file.
   */
  async downloadFile(fileId: number): Promise<Readable> {
    try {
      const result = await this.httpService.get({
        path: `/v1/files/${fileId}/download`,
        customOptions: { dataFormat: 'stream' },
      })
      if (!result.ok) throw errorFrom(result.val)

      return result.val.data as Readable
    } catch (error) {
      await this.logger.error(
        `Unexpected error downloading file with ID ${fileId}:`,
        error,
      )
      throw new Error('Failed to download file')
    }
  }

  /**
   * Retrieves the files associated with a deal by its ID.
   * @param dealId - The ID of the deal.
   * @returns A Promise that resolves to an object containing the deal ID and an array of documents.
   * @throws If the request to retrieve the files fails.
   */
  async getFilesByDealId(dealId: number): Promise<DealDocuments> {
    const result = await this.httpService.get(
      { path: `/v1/deals/${dealId}/files` },
      CDealFiles,
    )
    if (!result.ok) throw errorFrom(result.val)

    const docs: DealFiles = result.val.data
    const { data } = docs
    const res = data.map((xfile) => ({
      id: xfile.id,
      fileName: xfile.name,
      fileType: xfile.file_type,
    }))
    return { dealId: dealId, documents: res }
  }

  /**
   * Downloads a file by deal ID.
   * @param dealId - The ID of the deal.
   * @returns A Promise that resolves to a Readable stream representing the downloaded file.
   * @throws An error if the download fails or if the deal has more than one file.
   */
  async downloadFileByDealId(dealId: number): Promise<Readable> {
    const result = await this.httpService.get(
      { path: `/v1/deals/${dealId}/files` },
      CDealFiles,
    )
    if (!result.ok) throw errorFrom(result.val)

    const docs: DealFiles = result.val.data
    const { data } = docs
    if (data.length > 1) {
      throw new NotFoundError('Deal has more that one files found!')
    }
    return this.downloadFile(data[0].id)
  }

  async createPerson(body: Person): Promise<CreatePersonResponseSchema> {
    const result = await this.httpService.post(
      {
        path: '/v1/persons',
        body,
      },
      CCreatePerson,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async createDeal(body: Deal): Promise<DealResponseSchema> {
    const result = await this.httpService.post(
      {
        path: '/v1/deals',
        body,
      },
      CDealResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async searchPerson(body: SearchPerson): Promise<PersonResponse> {
    const result = await this.httpService.get(
      {
        path: `/v1/persons/search`,
        query: { fields: body.field, term: body.term },
      },
      CPersonResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async searchPersonByTerm(
    searchParams: SearchPerson[],
  ): Promise<PersonResponseItem[]> {
    let searchResults: PersonResponseItem[] = []

    for (let index = 0; index < searchParams.length; index++) {
      const param = searchParams[index]
      const result = await this.searchPerson(param)

      if (index === 0 && result.data.items.length === 0) {
        searchResults = []
      } else {
        if (index === 0) {
          searchResults = result.data.items
        } else {
          searchResults = _.intersectionBy(
            searchResults,
            result.data.items,
            'item.id',
          )
        }
      }
    }

    return searchResults
  }

  /**
   * Retrieves a deal from the Pipedrive API based on the provided ID.
   * @param id - The ID of the deal to retrieve.
   * @returns A Promise that resolves to the retrieved deal.
   * @throws An error if the API request fails.
   */
  /**
   * Get deals associated with a person.
   * @param query - Optional query parameters to include in the request.
   * @returns A Promise that resolves to the retrieved Deal object.
   * @throws An error if the request fails.
   */
  async getDeal(dealId: number): Promise<DealResponse> {
    const result = await this.httpService.get(
      { path: `/v1/deals/${dealId}` },
      CDealResponse,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  //from v2
  /**
   * Posts notes to Pipedrive.
   * @param body - The body of the notes to be posted.
   * @returns A promise that resolves to a PipedriveNoteType.
   * @throws An error if the post request fails.
   */
  async postNotes(body: Record<string, unknown>): Promise<SinglePipedriveNote> {
    const result = await this.httpService.post(
      {
        path: `/v1/notes`,
        body,
      },
      CSinglePipedriveNote,
    )

    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  /**
   * Sends notes to a Pipedrive deal.
   *
   * @param dealId - The ID of the deal to which the note will be attached.
   * @param message - The content of the note to be sent.
   * @returns A promise that resolves when the note has been successfully posted or rejects with an error message.
   * @throws Will throw an error if the note could not be posted to Pipedrive.
   */
  async createPipedriveNote(dealId: number, message: string) {
    const data = {
      deal_id: dealId,
      content: message,
      pinned_to_deal_flag: 1,
    }
    try {
      const res = await this.postNotes(data)
      if (!res.data.id) {
        throw new Error(`Failed to post notes to Pipedrive @dealId:${dealId}`)
      }
      await this.logger.debug(
        `Successfully posted notes to Pipedrive @dealId:${dealId}`,
      )
    } catch (error) {
      const errMsg = serializeError(error)
      await this.logger.error(
        `Failed to post notes to Pipedrive @dealId:${dealId} Error: `,
        errMsg,
      )
    }
  }

  async getDealFiles(dealId: number): Promise<DealFiles> {
    const result = await this.httpService.get(
      {
        path: `/v1/deals/${dealId}/files`,
        query: { start: '0', sort: 'update_time', limit: '100' },
      },
      CDealFiles,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async getDealNotes(dealId: number): Promise<PagePipedriveNotes> {
    const result = await this.httpService.get(
      {
        path: `/v1/notes`,
        query: {
          deal_id: `${dealId}`,
          start: '0',
          sort: 'add_time',
          limit: '100',
        },
      },
      CPagePipedriveNotes,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  /**
   * Updates a deal in Pipedrive.
   * @param dealId - The ID of the deal to be updated.
   * @param dealBody - The body of the deal to be updated.
   * @returns A promise that resolves to a Pipedrive status.
   * @throws An error if the update request fails.
   */
  async updateDeal(
    dealId: number,
    dealBody: Record<string, unknown>,
  ): Promise<PipedriveDealPutResponse> {
    const result = await this.httpService.put(
      {
        path: `/v1/deals/${dealId}`,
        body: dealBody,
      },
      CPipedriveDealPutResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async getDealUser(userId: number): Promise<DealUserResponse> {
    const result = await this.httpService.get(
      { path: `/v1/users/${userId}` },
      CDealUserResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }
}
