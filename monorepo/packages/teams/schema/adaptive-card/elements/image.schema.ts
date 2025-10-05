import { type Static, Type } from '@sinclair/typebox'
import { sizeSchema } from './size.schema'
import { styleSchema } from './style.schema'

export type Image = Static<typeof imageSchema>
export const imageSchema = Type.Object({
  type: Type.Literal('Image'),
  style: Type.Optional(styleSchema),
  url: Type.String(),
  width: Type.Optional(Type.String()),
  height: Type.Optional(Type.String()),
  size: Type.Optional(sizeSchema),
  selectAction: Type.Optional(
    Type.Object({
      type: Type.Literal('Action.OpenUrl'),
      url: Type.String(),
      altText: Type.String(),
    }),
  ),
  altText: Type.Optional(Type.String()),
})
