import { type Static, Type } from '@sinclair/typebox'

export type BtrFileOpening = Static<typeof btrFileOpeningSchema>
export const btrFileOpeningSchema = Type.Object({
  clientId: Type.String(),
  intent: Type.Union([Type.Literal('buy'), Type.Literal('sell')]),
  fileTemplate: Type.String(),
  contractDocumentBlob: Type.String(),
  professionalFees: Type.Optional(Type.String()),
  additionalInfo: Type.Optional(Type.String()),
  email: Type.Optional(Type.String({ format: 'email' })),
  testMode: Type.Optional(Type.Boolean()),
})
