import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { linksSchema, metaSchema } from './common'
import { ParticipantSchema } from './participants'
import { ParticipantTypeSchema } from './participanttypes'

export const ParticipantDefaultTypesLinksSchema = Type.Object({
  participantType: Type.Optional(Type.String()),
  participant: Type.Optional(Type.String()),
})

export const ParticipantDefaultTypesSchema = Type.Object({
  id: Type.String(),
  links: ParticipantDefaultTypesLinksSchema,
})
export type ParticipantDefaultTypes = Static<
  typeof ParticipantDefaultTypesSchema
>

export const ParticipantDefaultTypesPostSchema = Type.Object({
  participantdefaulttypes: Type.Object({
    links: ParticipantDefaultTypesLinksSchema,
  }),
})
export type ParticipantDefaultTypesPost = Static<
  typeof ParticipantDefaultTypesPostSchema
>

const linkedSchema = Type.Object({
  participants: Type.Optional(Type.Array(ParticipantSchema)),
  participanttypes: Type.Array(ParticipantTypeSchema),
})

export const SingleParticipantDefaultTypesSchema = Type.Object({
  links: linksSchema,
  participantdefaulttypes: ParticipantDefaultTypesSchema,
  linked: linkedSchema,
  meta: metaSchema,
})
export type SingleParticipantDefaultTypes = Static<
  typeof SingleParticipantDefaultTypesSchema
>
export const CSingleParticipantDefaultTypes = TypeCompiler.Compile(
  SingleParticipantDefaultTypesSchema,
)

export const PagedParticipantDefaultTypesSchema = Type.Object({
  links: linksSchema,
  participantdefaulttypes: Type.Array(ParticipantDefaultTypesSchema),
  linked: linkedSchema,
  meta: metaSchema,
})
export type PagedParticipantDefaultTypes = Static<
  typeof PagedParticipantDefaultTypesSchema
>
export const CPagedParticipantDefaultTypes = TypeCompiler.Compile(
  PagedParticipantDefaultTypesSchema,
)

export const UnknownParticipantDefaultTypesSchema = Type.Object({
  links: linksSchema,
  participantdefaulttypes: Type.Union([
    ParticipantDefaultTypesSchema,
    Type.Array(ParticipantDefaultTypesSchema),
  ]),
  linked: linkedSchema,
  meta: metaSchema,
})
export type UnknownParticipantDefaultTypes = Static<
  typeof UnknownParticipantDefaultTypesSchema
>
export const CUnknownParticipantDefaultTypes = TypeCompiler.Compile(
  UnknownParticipantDefaultTypesSchema,
)
