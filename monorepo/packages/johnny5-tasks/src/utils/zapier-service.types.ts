import { type Logger } from '@dbc-tech/logger'

export type ZapierServiceConfig = {
  baseUrl: string
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}
