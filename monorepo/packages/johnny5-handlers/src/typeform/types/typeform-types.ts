import { type Logger } from '@dbc-tech/logger'

export type TypeformServiceConfig = {
  baseUrl: string
  apiKey: string
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}
