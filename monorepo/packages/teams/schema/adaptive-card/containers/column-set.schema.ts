import { type Static, Type } from '@sinclair/typebox'
import { allElements } from '../elements'
import { horizontalAlignment } from '../elements/horizontal-alignment.schema'
import { spacingSchema } from '../elements/spacing.schema'
import { targetWidthSchema } from '../elements/target-width.schema'
import { verticalContentAlignment } from '../elements/vertical-alignment'

export type Column = Static<typeof columnSchema>
export const columnSchema = Type.Object({
  type: Type.Literal('Column'),
  items: Type.Array(allElements),
  width: Type.Union([Type.Literal('auto'), Type.Literal('stretch')]),
  horizontalAlignment: Type.Optional(horizontalAlignment),
  verticalContentAlignment: Type.Optional(verticalContentAlignment),
  spacing: Type.Optional(spacingSchema),
  targetWidth: Type.Optional(targetWidthSchema),
})

export type ColumnSet = Static<typeof columnSetSchema>
export const columnSetSchema = Type.Object({
  type: Type.Literal('ColumnSet'),
  columns: Type.Array(columnSchema),
  spacing: Type.Optional(spacingSchema),
})
