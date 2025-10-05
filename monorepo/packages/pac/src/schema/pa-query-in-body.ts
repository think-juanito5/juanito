import { Type } from '@sinclair/typebox'
import type { Static } from 'elysia'

export const GetMultipleRequestSchema = Type.Object({
  filter: Type.Optional(Type.String()),
  include: Type.Optional(Type.String()),
  pageSize: Type.Optional(Type.String()),
  sort: Type.Optional(Type.String()),
})
export type GetMultipleRequest = Static<typeof GetMultipleRequestSchema>
