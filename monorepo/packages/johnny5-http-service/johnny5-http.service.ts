import type {
  FetchParams,
  HttpServiceConfig,
  HttpServiceError,
  HttpServiceResponse,
} from '@dbc-tech/http'
import { HttpService, errorFrom } from '@dbc-tech/http'
import {
  type BatchMatterClose,
  type BtrSdsAgentWebhook,
  CIdString,
  CPexaAuditFilenote,
  CPexaAuditReadyResponse,
  CQuote,
  type CcaDealMatter,
  type CcaMatterNameRefresh,
  type CcaOnMatterArchive,
  type CcaPaymentForm,
  type CcaPipedriveNotification,
  type CcaRaqWebhook,
  type IdString,
  type MatterClose,
  type MatterDeactivation,
  type MatterReactivation,
  type PexaAuditFilenote,
  type Quote,
  type ccaMatterTpLinkParams,
} from '@dbc-tech/johnny5'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import {
  type Static,
  type TSchema,
  type TUnknown,
  Type as t,
} from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import type { TypeCheck } from '@sinclair/typebox/compiler'
import type { Result } from 'ts-results-es'
import type { TypeFormWebhookReceived } from './schema/typeform'

export type Johnny5HttpServiceConfig = {
  authBaseUrl: string
  authApiKey: string
  baseUrl: string
  correlationId?: string
  retries?: number
  logger?: Logger
}

export type CcaAuthToken = Static<typeof CcaAuthTokenSchema>
export const CcaAuthTokenSchema = t.Object({
  access_token: t.String(),
})
export const CCcaAuthToken = TypeCompiler.Compile(CcaAuthTokenSchema)

export class Johnny5Service {
  private logger: Logger
  private httpService: HttpService

  constructor(config: Johnny5HttpServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const tokenService = new HttpService({
      baseUrl: config.authBaseUrl,
      defaultHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: config.authApiKey,
      },
      logger: this.logger,
    })
    const getToken = async () => {
      const result = await tokenService.post(
        {
          path: '/v1/apikey',
        },
        CCcaAuthToken,
      )
      if (!result.ok) {
        await this.logger.error(
          `[CcaHttpService.getToken] Failed to get token from ${config.authBaseUrl}/v1/apikey`,
          result.val,
        )
        throw errorFrom(result.val)
      }

      return `Bearer ${result.val.data.access_token}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (config.correlationId) headers['x-correlation-id'] = config.correlationId

    const httpServiceConfig: HttpServiceConfig = {
      authHeader: async () => getToken(),
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

  async matterClose(matterId: number, body: MatterClose) {
    const result = await this.httpService.post({
      path: `/johnny5/v1/matters/${matterId}/close`,
      body,
    })
    if (!result.ok) throw errorFrom(result.val)
    return result.val
  }

  async batchMatterClose(
    fileId: string,
    body: BatchMatterClose,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      { path: `/johnny5/v1/files/${fileId}/batch-matter-close`, body },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async requestQuote(body: CcaRaqWebhook): Promise<Quote> {
    const result = await this.httpService.post(
      { path: `/quotes/v1`, body },
      CQuote,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async deactivateMatter(
    actionId: number,
    body: MatterDeactivation,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      { path: `/johnny5/v1/matters/${actionId}/deactivate`, body },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async reactivateMatter(
    actionId: number,
    body: MatterReactivation,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      { path: `/johnny5/v1/matters/${actionId}/reactivate`, body },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async dealMatter(body: CcaDealMatter): Promise<IdString> {
    const result = await this.httpService.post(
      { path: `/johnny5/v1/cca-deal-matter`, body },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async sendPipedriveNotification(
    dealId: number,
    body: CcaPipedriveNotification,
  ): Promise<void> {
    const result = await this.httpService.post({
      path: `/johnny5/v1/deals/${dealId}/prepared-notification`,
      body,
    })
    if (!result.ok) throw errorFrom(result.val)
  }

  async staleMatterCleanup(): Promise<IdString> {
    const result = await this.httpService.post(
      { path: `/johnny5/v1/stale-matter-cleanup` },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async ccaOnMatterArchive(body: CcaOnMatterArchive): Promise<IdString> {
    const result = await this.httpService.post(
      { path: `/johnny5/v1/cca-on-matter-archive`, body },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async ccaMatterNameRefresh(
    actionId: number,
    body?: CcaMatterNameRefresh,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/matters/${actionId}/name-refresh`,
        body,
      },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async pexaAuditReady(
    actionId: number,
    taskId: number,
  ): Promise<IdString | null> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/matters/${actionId}/tasks/${taskId}/pexa-audit`,
      },
      CPexaAuditReadyResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) return null // No content, no Pexa Audit record created
    return result.val.data as IdString
  }

  async pexaAuditFailedReady(
    actionId: number,
    taskId: number,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/matters/${actionId}/tasks/${taskId}/pexa-audit-failed-ready`,
      },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async ccaMatterTrustPilotLink(
    actionId: number,
    body?: ccaMatterTpLinkParams,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/matters/${actionId}/trustpilot-link`,
        body,
      },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  /**
   * Creates a PEXA audit file note for a specific matter and task.
   *
   * @param actionId - The ID of the matter.
   * @param taskId - The ID of the task within the matter.
   * @param dataverseGuid - The GUID associated with the Dataverse record.
   *  In this case, we want the uniqueidentifier for the BTR PEXA Audit record.
   * @returns A promise that resolves to the created PexaAuditFilenote object.
   * @throws Throws an error if the HTTP request fails.
   */
  async pexaAuditFileNote(
    actionId: number,
    taskId: number,
    dataverseGuid: string,
    extra: string | undefined,
  ): Promise<PexaAuditFilenote> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/matters/${actionId}/tasks/${taskId}/pexa-audit-filenote`,
        body: {
          dataverseGuid,
          extra,
        },
      },
      CPexaAuditFilenote,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async ccaDealPersonMarketingStatusArchive(
    dealId: number,
    personId: number,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/deals/${dealId}/persons/${personId}/marketing-status-archive`,
      },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async ccaEmailUnsubscribe(email: string, option: string): Promise<IdString> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/cca-email-unsubscribe`,
        body: {
          email,
          option,
        },
      },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async createBespokeTaskProcessorJob(
    webhook: TypeFormWebhookReceived,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      { path: `/johnny5/v1/bespoke-tasks`, body: webhook },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async ccaDealLostUnsubscribe(
    dealId: number,
    personId: number,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/deals/${dealId}/persons/${personId}/lost-unsubscribe`,
      },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async btrSdsAgentRegister(webhook: BtrSdsAgentWebhook): Promise<IdString> {
    const result = await this.httpService.post(
      { path: `/johnny5/v1/btr-sds-agent-register`, body: webhook },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async ccaPaymentForm(
    actionId: number,
    body: CcaPaymentForm,
  ): Promise<IdString> {
    const result = await this.httpService.post(
      {
        path: `/johnny5/v1/matters/${actionId}/payment`,
        body,
      },
      CIdString,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }
}
