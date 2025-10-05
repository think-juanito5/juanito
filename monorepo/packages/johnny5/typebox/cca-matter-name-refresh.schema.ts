import { type Static, Type } from '@sinclair/typebox'

export type CcaMatterNameRefresh = Static<typeof ccaMatterNameRefreshSchema>
export const ccaMatterNameRefreshSchema = Type.Optional(
  Type.Object({
    pipedriveFileNotesEnabled: Type.Optional(Type.Boolean()),
    teamsNotifyEnabled: Type.Optional(Type.Boolean()),
    initiateMatterCreation: Type.Optional(Type.Boolean()),
    assignedToId: Type.Optional(Type.String()),
    eventName: Type.Optional(Type.String()),
  }),
)

export const ReadinessEntity = Type.Union([
  Type.Literal('client'),
  Type.Literal('conveyancer'),
  Type.Literal('tenant'),
  Type.Literal('stepchange'),
])

export type ReadinessEntityType = Static<typeof ReadinessEntity>

export const MatterReadinessStateSchema = Type.Object({
  matterId: Type.Integer({ minimum: 1 }),
  detailsReady: Type.Array(ReadinessEntity),
})

export type MatterReadinessState = Static<typeof MatterReadinessStateSchema>
