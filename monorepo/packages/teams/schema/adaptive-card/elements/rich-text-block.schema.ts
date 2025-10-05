import { type Static, Type } from '@sinclair/typebox'
import { colorSchema } from './color.schema'
import { sizeSchema } from './size.schema'
import { spacingSchema } from './spacing.schema'
import { styleSchema } from './style.schema'
import { targetWidthSchema } from './target-width.schema'

export const inlineSchema = Type.Object({
  type: Type.Literal('TextRun'),
  text: Type.String(),
  selectAction: Type.Object({
    type: Type.Literal('Action.ToggleVisibility'),
    targetElements: Type.Array(Type.String()),
  }),
})

export type RichTextBlock = Static<typeof richTextBlockSchema>
export const richTextBlockSchema = Type.Object({
  id: Type.Optional(Type.String()),
  type: Type.Literal('RichTextBlock'),
  size: Type.Optional(sizeSchema),
  spacing: Type.Optional(spacingSchema),
  weight: Type.Optional(Type.String()),
  separator: Type.Optional(Type.Boolean()),
  color: Type.Optional(colorSchema),
  isSubtle: Type.Optional(Type.Boolean()),
  wrap: Type.Optional(Type.Boolean()),
  style: Type.Optional(styleSchema),
  targetWidth: Type.Optional(targetWidthSchema),
  isVisible: Type.Optional(Type.Boolean()),
  inlines: Type.Optional(Type.Array(inlineSchema)),
})
