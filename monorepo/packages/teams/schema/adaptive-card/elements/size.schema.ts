import { type Static, Type } from '@sinclair/typebox'

export type Size = Static<typeof sizeSchema>
export const sizeSchema = Type.Union([
  Type.Literal('Large'),
  Type.Literal('Medium'),
  Type.Literal('Small'),
])
