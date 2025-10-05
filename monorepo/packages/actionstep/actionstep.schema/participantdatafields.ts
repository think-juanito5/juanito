import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { MetaPagingSchema, Nullable, linksSchema } from './common'
import { ParticipantSchema } from './participants'
import { ParticipantTypeDataFieldSchema } from './participanttypedatafields'
import { ParticipantTypeSchema } from './participanttypes'

export type ParticipantDataFieldValueLinks = Static<
  typeof ParticipantDataFieldValueSchema
>
export const ParticipantDataFieldValueLinksSchema = Type.Object({
  participant: Type.String(),
  participantType: Type.String(),
  participantTypeDataField: Type.String(),
})

export type ParticipantDataFieldValue = Static<
  typeof ParticipantDataFieldValueSchema
>
export const ParticipantDataFieldValueSchema = Type.Object({
  id: Type.String(),
  stringValue: Nullable(Type.String()),
  links: ParticipantDataFieldValueLinksSchema,
})

export type ParticipantDataFieldValuePut = Static<
  typeof ParticipantDataFieldValuePutSchema
>
export const ParticipantDataFieldValuePutSchema = Type.Object({
  participantdatafieldvalues: Type.Object({
    id: Type.String(),
    stringValue: Nullable(Type.String()),
    links: ParticipantDataFieldValueLinksSchema,
  }),
})

const linkedSchema = Type.Object({
  participants: Type.Optional(Type.Array(ParticipantSchema)),
  participanttypes: Type.Optional(Type.Array(ParticipantTypeSchema)),
  participanttypedatafields: Type.Optional(
    Type.Array(ParticipantTypeDataFieldSchema),
  ),
})

export type SingleParticipantDataFieldValue = Static<
  typeof SingleParticipantDataFieldValueSchema
>
export const SingleParticipantDataFieldValueSchema = Type.Object({
  links: linksSchema,
  participantdatafieldvalues: ParticipantDataFieldValueSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participantdatafieldvalues: MetaPagingSchema }),
  }),
})
export const CSingleParticipantDataFieldValue = TypeCompiler.Compile(
  SingleParticipantDataFieldValueSchema,
)

export type PagedParticipantDataFieldValues = Static<
  typeof PagedParticipantDataFieldValuesSchema
>
export const PagedParticipantDataFieldValuesSchema = Type.Object({
  links: linksSchema,
  participantdatafieldvalues: Type.Array(ParticipantDataFieldValueSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participantdatafieldvalues: MetaPagingSchema }),
  }),
})
export const CPagedParticipantDataFieldValues = TypeCompiler.Compile(
  PagedParticipantDataFieldValuesSchema,
)

export type UnknownParticipantDataFieldValues = Static<
  typeof UnknownParticipantDataFieldValuesSchema
>
export const UnknownParticipantDataFieldValuesSchema = Type.Object({
  links: linksSchema,
  participantdatafieldvalues: Type.Union([
    ParticipantDataFieldValueSchema,
    Type.Array(ParticipantDataFieldValueSchema),
  ]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participantdatafieldvalues: MetaPagingSchema }),
  }),
})
export const CUnknownParticipantDataFieldValues = TypeCompiler.Compile(
  UnknownParticipantDataFieldValuesSchema,
)
