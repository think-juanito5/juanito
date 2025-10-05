import type { Tenant } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { PricingService } from '@dbc-tech/pricing'

export const createPricingService = (
  tenant: Tenant,
  correlationId?: string,
  logger?: Logger,
) =>
  new PricingService({
    clientId: process.env.DATAVERSE_CLIENT_ID!,
    clientSecret: process.env.DATAVERSE_CLIENT_SECRET!,
    tenantId: process.env.DATAVERSE_TENANT_ID!,
    tokenUrl: process.env.DATAVERSE_TOKEN_URL!,
    baseUrl: process.env.DATAVERSE_BASE_URL!,
    correlationId: correlationId,
    logger: logger,
    tenant: tenant,
  })
