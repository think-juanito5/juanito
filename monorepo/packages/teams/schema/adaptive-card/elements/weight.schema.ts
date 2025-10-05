import { type Static, Type } from '@sinclair/typebox'

export type Weight = Static<typeof weightSchema>
export const weightSchema = Type.Union([Type.Literal('Bolder')])
