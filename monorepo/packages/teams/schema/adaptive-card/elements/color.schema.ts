import { type Static, Type } from '@sinclair/typebox'

export type Color = Static<typeof colorSchema>
export const colorSchema = Type.Union([
  Type.Literal('default'),
  Type.Literal('good'),
  Type.Literal('attention'),
  Type.Literal('warning'),
  Type.Literal('Marigold'),
])
