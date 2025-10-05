import { type Static, t } from 'elysia'

export type DaprRoutingRule = Static<typeof daprRoutingRule>
export const daprRoutingRule = t.Object({
  match: t.String(),
  path: t.String(),
})

export type DaprSubscription = Static<typeof daprSubscriptionSchema>
export const daprSubscriptionSchema = t.Object({
  pubsubname: t.String(),
  topic: t.String(),
  route: t.Optional(t.String()),
  routes: t.Optional(
    t.Object({
      rules: t.Array(daprRoutingRule),
      default: t.Optional(t.String()),
    }),
  ),
  deadLetterTopic: t.Optional(t.String()),
  metadata: t.Optional(
    t.Object({
      rawPayload: t.String({
        enum: ['true', 'false'],
      }),
    }),
  ),
})

export type DaprResponseSchema = Static<typeof daprResponseSchema>
export const daprResponseSchema = t.Object({
  status: t.Union([
    t.Literal('SUCCESS'),
    t.Literal('RETRY'),
    t.Literal('DROP'),
  ]),
})
