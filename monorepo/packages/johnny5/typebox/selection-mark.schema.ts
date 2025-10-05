import { type Static, Type } from '@sinclair/typebox'

export type YesNoResponse = Static<typeof selectionMarkTypeSchema>
export type SelectionMark = Static<typeof selectionMarkTypeSchema>
export const selectionMarkTypeSchema = Type.Union([
  Type.Literal('Yes'),
  Type.Literal('No'),
])

export type SelectionMarkValues = SelectionMark | ''
