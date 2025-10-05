import { type Static, Type } from '@sinclair/typebox'

export type VerticalContentAlignment = Static<typeof verticalContentAlignment>
export const verticalContentAlignment = Type.Union([Type.Literal('Center')])
