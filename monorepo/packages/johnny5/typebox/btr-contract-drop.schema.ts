import { type Static, Type } from '@sinclair/typebox'

export type BtrContractDrop = Static<typeof btrContractDropSchema>
export const btrContractDropSchema = Type.Object({
  clientId: Type.String(),
  matterId: Type.Number(),
  contractDocumentBlob: Type.String(),
  email: Type.Optional(Type.String({ format: 'email' })),
  testMode: Type.Optional(Type.Boolean()),
})
