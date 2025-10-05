import { type Static, Type } from '@sinclair/typebox'
import { spacingSchema } from '../elements/spacing.schema'
import { targetWidthSchema } from '../elements/target-width.schema'

export type Action = Static<typeof actionSchema>
export const actionSchema = Type.Object({
  type: Type.Union([
    Type.Literal('Action.OpenUrl'),
    Type.Literal('Action.Execute'),
  ]),
  title: Type.Optional(Type.String()),
  url: Type.Optional(Type.String()),
  iconUrl: Type.Optional(Type.String()),
})

export type ActionSet = Static<typeof actionSetSchema>
export const actionSetSchema = Type.Object({
  type: Type.Literal('ActionSet'),
  spacing: Type.Optional(spacingSchema),
  targetWidth: Type.Optional(targetWidthSchema),
  actions: Type.Array(actionSchema),
})
