import { type Static, t } from 'elysia'

export type TeamsSubscriber = Static<typeof teamsSubscriberSchema>
export const teamsSubscriberSchema = t.Object({
  teamsUrl: t.String(),
  teamsId: t.Optional(t.String()),
  channelId: t.Optional(t.String()),
  events: t.Array(t.String()),
})
