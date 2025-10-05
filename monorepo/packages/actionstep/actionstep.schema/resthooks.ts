import { type Static, Type } from '@sinclair/typebox'
import { Numeric } from './common'

export type Resthook = Static<typeof ResthookSchema>
export const ResthookSchema = Type.Object({
  id: Numeric(),
  eventName: Type.String(),
  targetUrl: Type.String(),
  status: Type.String(),
  triggeredCount: Numeric(),
  triggeredLastTimestamp: Type.Optional(Type.String()),
})

export type ResthookPut = Static<typeof ResthookPutSchema>
export const ResthookPutSchema = Type.Object({
  resthooks: Type.Array(
    Type.Object({
      eventName: Type.String(),
      targetUrl: Type.String(),
      status: Type.Optional(Type.String()),
    }),
  ),
})
