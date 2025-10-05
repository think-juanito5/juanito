import { type Static, Type } from '@sinclair/typebox'

export type BatchMatterClose = Static<typeof batchMatterCloseSchema>
export const batchMatterCloseSchema = Type.Object({
  matterIds: Type.Array(Type.Number()),
  email: Type.Optional(Type.String({ format: 'email' })),
  closureReason: Type.Optional(Type.String()),
})
