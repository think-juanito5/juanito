import { DataverseService } from '@dbc-tech/dataverse'
import type { Logger } from '@dbc-tech/logger'

export const createDataverseService = (
  correlationId?: string,
  logger?: Logger,
) =>
  new DataverseService({
    clientId: process.env.DATAVERSE_CLIENT_ID!,
    clientSecret: process.env.DATAVERSE_CLIENT_SECRET!,
    tenantId: process.env.DATAVERSE_TENANT_ID!,
    tokenUrl: process.env.DATAVERSE_TOKEN_URL!,
    baseUrl: process.env.DATAVERSE_BASE_URL!,
    correlationId: correlationId,
    logger: logger,
  })
