import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionSchema } from './actions'
import { Nullable, Numeric, linksSchema, metaSchema } from './common'
import { ParticipantSchema } from './participants'
import { ParticipantTypeSchema } from './participanttypes'

export const ActionParticipantLinksSchema = Type.Object({
  action: Type.String(),
  participantType: Type.String(),
  participant: Type.String(),
})
export type ActionParticipantLinks = Static<typeof ActionParticipantLinksSchema>

export const ActionParticipantSchema = Type.Object({
  id: Type.String(),
  participantNumber: Numeric(),
  links: ActionParticipantLinksSchema,
})
export type ActionParticipant = Static<typeof ActionParticipantSchema>

export const ActionParticipantPostConstructorSchema = Type.Object({
  links: ActionParticipantLinksSchema,
})
export type ActionParticipantPostConstructor = Static<
  typeof ActionParticipantPostConstructorSchema
>

export const ActionParticipantPostSchema = Type.Object({
  actionparticipants: ActionParticipantPostConstructorSchema,
})
export type ActionParticipantPost = Static<typeof ActionParticipantPostSchema>

export const ActionParticipantPostMultipleSchema = Type.Object({
  actionparticipants: Type.Array(
    Type.Object({
      links: ActionParticipantLinksSchema,
    }),
  ),
})
export type ActionParticipantPostMultiple = Static<
  typeof ActionParticipantPostMultipleSchema
>

const linkedSchema = Type.Object({
  actions: Type.Optional(Type.Array(ActionSchema)),
  participants: Type.Optional(Type.Array(ParticipantSchema)),
  participanttypes: Type.Optional(Type.Array(ParticipantTypeSchema)),
})

export type SingleActionParticipant = Static<
  typeof SingleActionParticipantSchema
>
export const SingleActionParticipantSchema = Type.Object({
  links: linksSchema,
  actionparticipants: ActionParticipantSchema,
  linked: Type.Optional(linkedSchema),
  meta: metaSchema,
})
export const CSingleActionParticipant = TypeCompiler.Compile(
  SingleActionParticipantSchema,
)

export type PagedActionParticipants = Static<
  typeof PagedActionParticipantsSchema
>
export const PagedActionParticipantsSchema = Type.Object({
  links: linksSchema,
  actionparticipants: Type.Array(ActionParticipantSchema),
  linked: Type.Optional(linkedSchema),
  meta: metaSchema,
})
export const CPagedActionParticipants = TypeCompiler.Compile(
  PagedActionParticipantsSchema,
)

export type UnknownActionParticipants = Static<
  typeof UnknownActionParticipantsSchema
>
export const UnknownActionParticipantsSchema = Type.Object({
  links: linksSchema,
  actionparticipants: Type.Union([
    ActionParticipantSchema,
    Type.Array(ActionParticipantSchema),
  ]),
  linked: Type.Optional(linkedSchema),
  meta: metaSchema,
})
export const CUnknownActionParticipants = TypeCompiler.Compile(
  UnknownActionParticipantsSchema,
)

export const ActionCreateParticipantSchema = Type.Object({
  links: linksSchema,
  actionparticipants: Type.Object({
    id: Type.String(),
    participantNumber: Nullable(Type.Number()),
    links: Type.Record(Type.String(), Type.String()),
  }),
  linked: Type.Optional(linkedSchema),
  meta: metaSchema,
})
export type ActionCreateParticipant = Static<
  typeof ActionCreateParticipantSchema
>
export const CActionCreateParticipant = TypeCompiler.Compile(
  ActionCreateParticipantSchema,
)

export const ActionLinkParticipantSchema = Type.Object({
  links: linksSchema,
  actionparticipants: Type.Object({
    id: Type.String(),
    participantNumber: Nullable(Type.Number()),
    links: Type.Record(Type.String(), Type.String()),
  }),
  linked: Type.Optional(linkedSchema),
  meta: metaSchema,
})
export type ActionLinkParticipant = Static<typeof ActionLinkParticipantSchema>
export const CActionLinkParticipant = TypeCompiler.Compile(
  ActionLinkParticipantSchema,
)
