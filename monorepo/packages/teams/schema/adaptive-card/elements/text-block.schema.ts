import { type Static, Type } from '@sinclair/typebox'
import { colorSchema } from './color.schema'
import { sizeSchema } from './size.schema'
import { spacingSchema } from './spacing.schema'
import { styleSchema } from './style.schema'
import { targetWidthSchema } from './target-width.schema'
import { weightSchema } from './weight.schema'

export type TextBlock = Static<typeof textBlockSchema>
export const textBlockSchema = Type.Object({
  id: Type.Optional(Type.String()),
  text: Type.String(),
  type: Type.Literal('TextBlock'),
  size: Type.Optional(sizeSchema),
  spacing: Type.Optional(spacingSchema),
  weight: Type.Optional(weightSchema),
  separator: Type.Optional(Type.Boolean()),
  color: Type.Optional(colorSchema),
  isSubtle: Type.Optional(Type.Boolean()),
  wrap: Type.Optional(Type.Boolean()),
  style: Type.Optional(styleSchema),
  targetWidth: Type.Optional(targetWidthSchema),
  isVisible: Type.Optional(Type.Boolean()),
})
