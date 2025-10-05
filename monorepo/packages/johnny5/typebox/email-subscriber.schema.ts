import { type Static, t } from 'elysia'

export type EmailSubscriber = Static<typeof emailSubscriberSchema>
export const emailSubscriberSchema = t.Object({
  email: t.String(),
  name: t.String(),
  events: t.Array(t.String()),
})
