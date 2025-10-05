import { type Static, Type } from '@sinclair/typebox'

export type HorizontalAlignment = Static<typeof horizontalAlignment>
export const horizontalAlignment = Type.Union([Type.Literal('Center')])
