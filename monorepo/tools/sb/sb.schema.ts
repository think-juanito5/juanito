import { type Static, Type } from '@sinclair/typebox'

export type Thresholds = Static<typeof thresholdsSchema>
const thresholdsSchema = Type.Object({
  minActiveMessageCount: Type.Optional(Type.Number()),
  minDeadLetterCount: Type.Optional(Type.Number()),
})

export type Override = Static<typeof overrideSchema>
export const overrideSchema = Type.Object({
  queue: Type.Optional(Type.String()),
  topic: Type.Optional(Type.String()),
  subscription: Type.Optional(Type.String()),
  thresholds: thresholdsSchema,
})

export type Namespace = Static<typeof namespaceSchema>
export const namespaceSchema = Type.Object({
  subscription: Type.String(),
  resourceGroup: Type.String(),
  namespace: Type.String(),
  environment: Type.Optional(Type.String()),
  thresholds: Type.Optional(thresholdsSchema),
  overrides: Type.Optional(Type.Array(overrideSchema)),
})

export type ServiceBus = Static<typeof serviceBusSchema>
export const serviceBusSchema = Type.Object({
  teamsAlertUrl: Type.Optional(Type.String()),
  teamsId: Type.Optional(Type.String()),
  channelId: Type.Optional(Type.String()),
  namespaces: Type.Array(namespaceSchema),
})
