import { type Static, Type } from '@sinclair/typebox'

export type CcaOnMatterArchive = Static<typeof ccaOnMatterArchiveSchema>
export const ccaOnMatterArchiveSchema = Type.Object({
  matterId: Type.Number(),
  actionType: Type.Number(),
  primaryParticipantIds: Type.Array(Type.Number()),
  testMode: Type.Optional(Type.Boolean()),
})
