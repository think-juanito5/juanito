import { Type } from '@sinclair/typebox'
import { imageSchema } from './image.schema'
import { textBlockSchema } from './text-block.schema'

export const allElements = Type.Union([textBlockSchema, imageSchema])

export * from './image.schema'
export * from './text-block.schema'
export * from './color.schema'
