import { Type } from '@sinclair/typebox'
import type { Static } from 'elysia'

export type MergeActionParticipants = Static<
  typeof ActionParticipantMergeSchema
>
export const ActionParticipantMergeSchema = Type.Array(
  Type.Object({
    action: Type.String(),
    participantType: Type.String(),
    oldParty: Type.String(),
    participant: Type.String(),
  }),
)
