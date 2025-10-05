import { type Logger } from '@dbc-tech/logger'

export type MovingHubServiceConfig = {
  baseUrl: string
  username: string
  password: string
  apiKey: string
  partnerCode: string
  correlationId?: string
  retries?: number
  logger?: Logger
}
