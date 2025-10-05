import { type Static, Type } from '@sinclair/typebox'

export type Style = Static<typeof styleSchema>
export const styleSchema = Type.Union([
  Type.Literal('RoundedCorners'),
  Type.Literal('Person'),
  Type.Literal('Heading'),
])
