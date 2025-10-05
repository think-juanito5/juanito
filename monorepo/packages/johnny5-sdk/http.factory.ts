import { HttpService, type HttpServiceConfig, errorFrom } from '@dbc-tech/http2'
import { NullLogger } from '@dbc-tech/logger'
import type { Johnny5ClientConfig } from './types'
import { CDbcAuthToken } from './types/dbc-auth-token.type'

export const createHttpService = (config: Johnny5ClientConfig) => {
  const logger = config.logger ?? NullLogger()

  const tokenService = new HttpService({
    baseUrl: config.authBaseUrl,
    defaultHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: config.authApiKey,
    },
    logger,
    retryStatusCodes: [408, 425, 429, 500, 502, 503, 504],
  })
  const getToken = async () => {
    const result = await tokenService.post(
      {
        path: '/v1/apikey',
      },
      CDbcAuthToken,
    )
    if (!result.ok) {
      await logger.error(
        `[johnny5Client.getToken] Failed to get token from ${config.authBaseUrl}/v1/apikey`,
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
    logger,
    retries: config.retries ?? 5,
    retryStatusCodes: [401, 408, 425, 429, 500, 502, 503, 504],
  }

  return new HttpService(httpServiceConfig)
}
