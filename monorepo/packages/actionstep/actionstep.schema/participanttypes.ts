import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { MetaPagingSchema, Nullable, Numeric, TrueFalseSchema } from './common'

export type ParticipantType = Static<typeof ParticipantTypeSchema>
export const ParticipantTypeSchema = Type.Object({
  id: Numeric(),
  name: Type.String(),
  displayName: Type.String(),
  description: Nullable(Type.String()),
  isBaseParticipantType: TrueFalseSchema,
  companyFlag: Nullable(TrueFalseSchema),
  taxNumberAlias: Nullable(Type.String()),
})

export type SingleParticipantType = Static<typeof SingleParticipantTypeSchema>
export const SingleParticipantTypeSchema = Type.Object({
  participanttypes: ParticipantTypeSchema,
  meta: Type.Object({
    paging: Type.Object({ participanttypes: MetaPagingSchema }),
  }),
})
export const CSingleParticipantType = TypeCompiler.Compile(
  SingleParticipantTypeSchema,
)

export type PagedParticipantTypes = Static<typeof PagedParticipantTypesSchema>
export const PagedParticipantTypesSchema = Type.Object({
  participanttypes: Type.Array(ParticipantTypeSchema),
  meta: Type.Object({
    paging: Type.Object({ participanttypes: MetaPagingSchema }),
  }),
})
export const CPagedParticipantTypes = TypeCompiler.Compile(
  PagedParticipantTypesSchema,
)

export type UnknownParticipantTypes = Static<
  typeof UnknownParticipantTypesSchema
>
export const UnknownParticipantTypesSchema = Type.Object({
  participanttypes: Type.Union([
    ParticipantTypeSchema,
    Type.Array(ParticipantTypeSchema),
  ]),
  meta: Type.Object({
    paging: Type.Object({ participanttypes: MetaPagingSchema }),
  }),
})
export const CUnknownParticipantTypes = TypeCompiler.Compile(
  UnknownParticipantTypesSchema,
)
