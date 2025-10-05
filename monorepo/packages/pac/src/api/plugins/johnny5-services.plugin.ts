import { Johnny5Service } from '@dbc-tech/johnny5-http-service'
import type { Tenant } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'

export const createJohnny5Service = (
  tenant: Tenant,
  logger: Logger,
  correlationId?: string,
) =>
  new Johnny5Service({
    authBaseUrl: process.env['AUTH_BASE_URL']!,
    authApiKey: process.env[`${tenant}_API_KEY`]!,
    baseUrl: process.env['CCA_SERVICES_BASE_URL']!,
    correlationId,
    logger,
  })
