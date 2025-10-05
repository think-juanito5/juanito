import { type Logger } from '@dbc-tech/logger'

export type PowerappWorkflowServiceConfig = {
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}
