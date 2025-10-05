import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {
  MetaPagingSchema,
  Nullable,
  TrueFalseSchema,
  linksSchema,
} from './common'
import { ParticipantTypeSchema } from './participanttypes'
import { TagSchema } from './tags'

export type ParticipantTypeDataFieldLinks = Static<
  typeof ParticipantTypeDataFieldLinksSchema
>
export const ParticipantTypeDataFieldLinksSchema = Type.Object({
  participantType: Type.String(),
  tag: Nullable(Type.String()),
})

export type ParticipantTypeDataField = Static<
  typeof ParticipantTypeDataFieldSchema
>
export const ParticipantTypeDataFieldSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  dataType: Type.String(),
  label: Type.String(),
  formOrder: Type.Number(),
  listOrder: Type.String(),
  required: TrueFalseSchema,
  description: Type.String(),
  synchronizeValues: TrueFalseSchema,
  links: ParticipantTypeDataFieldLinksSchema,
})

const linkedSchema = Type.Object({
  participanttypes: Type.Optional(Type.Array(ParticipantTypeSchema)),
  tags: Type.Optional(Type.Array(TagSchema)),
})

export type SingleParticipantTypeDataField = Static<
  typeof SingleParticipantTypeDataFieldSchema
>
export const SingleParticipantTypeDataFieldSchema = Type.Object({
  links: linksSchema,
  participanttypedatafields: ParticipantTypeDataFieldSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participanttypedatafields: MetaPagingSchema }),
  }),
})
export const CSingleParticipantTypeDataField = TypeCompiler.Compile(
  SingleParticipantTypeDataFieldSchema,
)

export type PagedParticipantTypeDataFields = Static<
  typeof PagedParticipantTypeDataFieldsSchema
>
export const PagedParticipantTypeDataFieldsSchema = Type.Object({
  links: linksSchema,
  participanttypedatafields: Type.Array(ParticipantTypeDataFieldSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participanttypedatafields: MetaPagingSchema }),
  }),
})
export const CPagedParticipantTypeDataFields = TypeCompiler.Compile(
  PagedParticipantTypeDataFieldsSchema,
)

export type UnknownParticipantTypeDataFields = Static<
  typeof UnknownParticipantTypeDataFieldsSchema
>
export const UnknownParticipantTypeDataFieldsSchema = Type.Object({
  links: linksSchema,
  participanttypedatafields: Type.Union([
    ParticipantTypeDataFieldSchema,
    Type.Array(ParticipantTypeDataFieldSchema),
  ]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participanttypedatafields: MetaPagingSchema }),
  }),
})
export const CUnknownParticipantTypeDataFields = TypeCompiler.Compile(
  UnknownParticipantTypeDataFieldsSchema,
)
