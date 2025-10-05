import type { HttpServiceConfig, HttpServiceError } from '@dbc-tech/http'
import { HttpService } from '@dbc-tech/http'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import { NotFoundError } from 'elysia'
import {
  CSettlementCalcuMatterUpdateResponse,
  type SettlementCalcuMatterUpdateResponse,
} from './updater-service.schema'
import type {
  CalcuMatterUpdateRequest,
  MatterSyncServiceConfig,
} from './updater-service.types'

export const errorFrom = (err: HttpServiceError) => {
  if (err.response.status === 404) return new NotFoundError(err.statusText)
  return new Error(err.statusText)
}

export class MatterSyncService {
  private logger: Logger
  private httpService: HttpService

  constructor(config: MatterSyncServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Api-Key': config.apiKey,
      Accept: 'application/json',
      'x-client-id': config.clientId || 'MatterSyncService',
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

  async settlementCalcuSyncMatter(
    body: CalcuMatterUpdateRequest,
  ): Promise<SettlementCalcuMatterUpdateResponse> {
    const result = await this.httpService.post(
      { path: `/v1/app_calculator/save_calculator`, body },
      CSettlementCalcuMatterUpdateResponse,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }
}
