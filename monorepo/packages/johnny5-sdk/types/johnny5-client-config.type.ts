import type { Logger } from '@dbc-tech/logger'

export type Johnny5ClientConfig = {
  authBaseUrl: string
  authApiKey: string
  baseUrl: string
  correlationId?: string
  retries?: number
  logger?: Logger
}
