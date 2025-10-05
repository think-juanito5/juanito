import { type Logger } from '@dbc-tech/logger'

export type PipedriveServiceConfig = {
  baseUrl: string
  apiToken: string
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}

export type DealDocument = {
  id: number
  fileName: string
  fileType?: string
}

export type DealDocuments = {
  dealId: number
  documents: DealDocument[]
}
