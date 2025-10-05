import { type Static, Type } from '@sinclair/typebox'
import { colorSchema } from './color.schema'
import { sizeSchema } from './size.schema'
import { spacingSchema } from './spacing.schema'
import { textBlockSchema } from './text-block.schema'

export type Rating = Static<typeof ratingSchema>
export const ratingSchema = Type.Object({
  type: Type.Literal('Rating'),
  value: Type.Number(),
  count: Type.Number(),
  color: colorSchema,
  size: sizeSchema,
  fallback: textBlockSchema,
  spacing: spacingSchema,
})
