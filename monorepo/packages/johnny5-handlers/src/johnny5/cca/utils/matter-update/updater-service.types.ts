import { type Logger } from '@dbc-tech/logger'

export type MatterSyncServiceConfig = {
  baseUrl: string
  apiKey: string
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}

export type CalcuMatterUpdateRequest = {
  id: number
  matter_id: number
  file_note?: string
  matter_type_id: number
  matter_name: string
  assignedto_id?: number
  client_id1?: number
  status?: number
}
