import type { HttpServiceConfig } from '@dbc-tech/http'
import { HttpService, errorFrom } from '@dbc-tech/http'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import {
  CMovingHubAuthToken,
  CSaveNewResponse,
  type SaveNew,
  type SaveNewResponse,
} from './schema/moving-hub.schema'
import type { MovingHubServiceConfig } from './types/movinghub-types'

export class MovingHubService {
  private logger: Logger
  private httpService: HttpService

  constructor(private config: MovingHubServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const encodedCredentials = btoa(`${config.username}:${config.password}`)
    const tokenService = new HttpService({
      baseUrl: config.baseUrl,
      defaultHeaders: {
        Accept: 'application/json',
        Authorization: `Basic ${encodedCredentials}`,
      },
      logger: this.logger,
    })
    const getToken = async () => {
      const result = await tokenService.post(
        {
          path: '/v2/auth',
        },
        CMovingHubAuthToken,
      )
      if (!result.ok) {
        this.logger.error(
          `[MovingHubService.getToken] Failed to get token from ${config.baseUrl}`,
          result.val,
        )
        throw errorFrom(result.val)
      }

      return result.val.data.token
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'MHUB-API-KEY': config.apiKey,
    }
    if (config.correlationId) headers['x-correlation-id'] = config.correlationId

    const httpServiceConfig: HttpServiceConfig = {
      authHeader: async () => getToken(),
      authHeaderKey: 'token',
      baseUrl: config.baseUrl,
      defaultHeaders: headers,
      logger: this.logger,
      retries: config.retries ?? 5,
    }
    this.httpService = new HttpService(httpServiceConfig)
  }

  /**
   * Saves a new application.
   *
   * @param body - The data to be saved.
   * @returns A promise that resolves to the response containing the saved data.
   * @throws An error if the save operation fails.
   */
  async saveNew(body: SaveNew): Promise<SaveNewResponse> {
    const result = await this.httpService.post(
      { path: `/v2/applications/save-new/${this.config.partnerCode}`, body },
      CSaveNewResponse,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }
}
