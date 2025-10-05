import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { MetaPagingSchema, TrueFalseSchema, linksSchema } from './common'
import { ParticipantTypeSchema } from './participanttypes'

export const actionTypeParticipantTypeSchema = Type.Object({
  id: Type.String(),
  required: TrueFalseSchema,
  isPrimaryParticipantType: TrueFalseSchema,
  actionType: Type.Number(),
  links: Type.Object({
    participantType: Type.String(),
  }),
})
export type ActionTypeParticipantType = Static<
  typeof actionTypeParticipantTypeSchema
>

const linkedSchema = Type.Object({
  participanttypes: Type.Optional(Type.Array(ParticipantTypeSchema)),
})

export const singleActionTypeParticipantTypeSchema = Type.Object({
  links: linksSchema,
  actiontypeparticipanttypes: actionTypeParticipantTypeSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({
      actiontypeparticipanttypes: MetaPagingSchema,
    }),
  }),
})
export type SingleActionTypeParticipantType = Static<
  typeof singleActionTypeParticipantTypeSchema
>
export const CSingleActionTypeParticipantType = TypeCompiler.Compile(
  singleActionTypeParticipantTypeSchema,
)

export const pagedActionTypeParticipantTypesSchema = Type.Object({
  links: linksSchema,
  actiontypeparticipanttypes: Type.Array(actionTypeParticipantTypeSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({
      actiontypeparticipanttypes: MetaPagingSchema,
    }),
  }),
})
export type PagedActionTypeParticipantTypes = Static<
  typeof pagedActionTypeParticipantTypesSchema
>
export const CPagedActionTypeParticipantTypes = TypeCompiler.Compile(
  pagedActionTypeParticipantTypesSchema,
)

export const unknownActionTypeParticipantTypesSchema = Type.Object({
  links: linksSchema,
  actiontypeparticipanttypes: Type.Union([
    actionTypeParticipantTypeSchema,
    Type.Array(actionTypeParticipantTypeSchema),
  ]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({
      actiontypeparticipanttypes: MetaPagingSchema,
    }),
  }),
})
export type UnknownActionTypeParticipantTypes = Static<
  typeof unknownActionTypeParticipantTypesSchema
>
export const CUnknownActionTypeParticipantTypes = TypeCompiler.Compile(
  unknownActionTypeParticipantTypesSchema,
)
