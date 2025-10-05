import { type Static, Type } from '@sinclair/typebox'

export type CloudEvent = Static<typeof cloudEventSchema>
export const cloudEventSchema = Type.Object({
  topic: Type.Optional(Type.String()),
  pubsubname: Type.Optional(Type.String()),
  id: Type.String(),
  specversion: Type.Literal('1.0'),
  datacontenttype: Type.Literal('application/cloudevents+json'),
  source: Type.String(),
  subject: Type.Optional(Type.String()),
  type: Type.String(),
  time: Type.String(),
  traceid: Type.Optional(Type.String()),
  tracestate: Type.Optional(Type.String()),
  traceparent: Type.Optional(Type.String()),
})
