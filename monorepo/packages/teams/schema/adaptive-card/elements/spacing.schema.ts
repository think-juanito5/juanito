import { type Static, Type } from '@sinclair/typebox'

export type Spacing = Static<typeof spacingSchema>
export const spacingSchema = Type.Union([
  Type.Literal('None'),
  Type.Literal('Small'),
  Type.Literal('Medium'),
  Type.Literal('Large'),
])
