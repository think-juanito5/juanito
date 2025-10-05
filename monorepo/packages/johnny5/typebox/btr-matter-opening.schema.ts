import { type Static, Type } from '@sinclair/typebox'

export type BtrMatterOpening = Static<typeof btrMatterOpeningSchema>
export const btrMatterOpeningSchema = Type.Object({
  clientId: Type.String(),
  matterName: Type.String(),
  intent: Type.Union([Type.Literal('buy'), Type.Literal('sell')]),
  templateMatterId: Type.Number(),
  professionalFees: Type.Optional(Type.String()),
  additionalInfo: Type.Optional(Type.String()),
  email: Type.Optional(Type.String({ format: 'email' })),
  testMode: Type.Optional(Type.Boolean()),
})
