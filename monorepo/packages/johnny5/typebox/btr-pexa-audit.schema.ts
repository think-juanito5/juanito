import { idStringSchema } from '@dbc-tech/johnny5'
import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from 'elysia/type-system'

export const pexaAuditFilenoteSchema = Type.Object({
  dataverseGuid: Type.String(),
  filenote: Type.String(),
})
export type PexaAuditFilenote = Static<typeof pexaAuditFilenoteSchema>
export const CPexaAuditFilenote = TypeCompiler.Compile(pexaAuditFilenoteSchema)

export const pexaAuditReadyResponseSchema = Type.Union([
  idStringSchema,
  Type.Null(),
])
export type PexaAuditReadyResponse = Static<typeof pexaAuditReadyResponseSchema>
export const CPexaAuditReadyResponse = TypeCompiler.Compile(
  pexaAuditReadyResponseSchema,
)
