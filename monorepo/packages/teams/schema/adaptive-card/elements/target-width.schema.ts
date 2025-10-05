import { type Static, Type } from '@sinclair/typebox'

export type TargetWidthSchema = Static<typeof targetWidthSchema>
export const targetWidthSchema = Type.Union([
  Type.Literal('AtLeast:Standard'),
  Type.Literal('AtLeast:Narrow'),
  Type.Literal('VeryNarrow'),
])
