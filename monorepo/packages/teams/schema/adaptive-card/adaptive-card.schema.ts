import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { actionSetSchema, columnSetSchema, factSetSchema } from './containers'
import { imageSchema, textBlockSchema } from './elements'
import { ratingSchema } from './elements/rating.schema'
import { richTextBlockSchema } from './elements/rich-text-block.schema'

export const allComponents = Type.Union([
  textBlockSchema,
  richTextBlockSchema,
  actionSetSchema,
  factSetSchema,
  columnSetSchema,
  imageSchema,
  ratingSchema,
])

export type AdaptiveCard = Static<typeof adaptiveCardSchema>
export const adaptiveCardSchema = Type.Object({
  type: Type.Literal('AdaptiveCard'),
  msteams: Type.Optional(
    Type.Object({
      width: Type.Union([Type.Literal('Full'), Type.Literal('Large')]),
    }),
  ),
  speak: Type.Optional(Type.String()),
  $schema: Type.Union([
    Type.Literal('http://adaptivecards.io/schemas/adaptive-card.json'),
    Type.Literal('https://adaptivecards.io/schemas/adaptive-card.json'),
  ]),
  version: Type.Union([
    Type.Literal('1.3'),
    Type.Literal('1.4'),
    Type.Literal('1.5'),
  ]),
  body: Type.Array(allComponents),
})

export const CAdaptiveCard = TypeCompiler.Compile(adaptiveCardSchema)
