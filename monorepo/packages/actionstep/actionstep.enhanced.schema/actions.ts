import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionTypesSchema } from './actiontypes'
import {
  MetaPagingSchema,
  Nullable,
  TrueFalseSchema,
  linksSchema,
} from './common'
import { DivisionSchema } from './divisions'
import { ParticipantSchema } from './participants'
import { StepSchema } from './steps'

export type ActionLinks = Static<typeof ActionLinksSchema>
export const ActionLinksSchema = Type.Object({
  assignedTo: Nullable(Type.String()),
  division: Nullable(Type.String()),
  actionType: Nullable(Type.String()),
  primaryParticipants: Nullable(Type.Array(Type.String())),
  step: Nullable(Type.String()),
  billSettings: Nullable(Type.String()),
  relatedActions: Nullable(Type.Array(Type.String())),
})

export type Action = Static<typeof ActionSchema>
export const ActionSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  reference: Nullable(Type.String()),
  priority: Type.Number(),
  status: Nullable(Type.String()),
  statusTimestamp: Nullable(Type.String()),
  isBillableOverride: Nullable(Type.String()),
  createdTimestamp: Nullable(Type.String()),
  modifiedTimestamp: Nullable(Type.String()),
  isDeleted: TrueFalseSchema,
  deletedBy: Nullable(Type.String()),
  deletedTimestamp: Nullable(Type.String()),
  isFavorite: TrueFalseSchema,
  overrideBillingStatus: Nullable(
    Type.Union([Type.Literal('Active'), Type.Literal('Closed')]),
  ),
  lastAccessTimestamp: Nullable(Type.String()),
  importExternalReference: Nullable(Type.String()),
  amlReviewStatus: Nullable(Type.String()),
  bannerText: Nullable(Type.String()),
  links: ActionLinksSchema,
})

const ActionPutSchemaDetails = Type.Object({
  name: Type.Optional(Type.String()),
  reference: Type.Optional(Type.String()),
  priority: Type.Optional(Type.Number()),
  status: Type.Optional(
    Type.Union([
      Type.Literal('Active'),
      Type.Literal('Inactive'),
      Type.Literal('Closed'),
      Type.Literal('Template'),
    ]),
  ),
  isBillableOverride: Type.Optional(Type.String()),
  isFavorite: Type.Optional(TrueFalseSchema),
  overrideBillingStatus: Type.Optional(
    Type.Union([Type.Literal('Active'), Type.Literal('Closed')]),
  ),
  importExternalReference: Type.Optional(Type.String()),
  amlReviewStatus: Type.Optional(Type.String()),
  bannerText: Type.Optional(Type.String()),
  links: Type.Optional(
    Type.Object({
      assignedTo: Type.Optional(Type.String()),
      division: Type.Optional(Type.String()),
      actionType: Type.Optional(Type.String()),
      primaryParticipants: Type.Optional(Type.Array(Type.String())),
    }),
  ),
})

const actionLinkedSchema = Type.Object({
  participants: Type.Optional(Type.Array(ParticipantSchema)),
  divisions: Type.Optional(Type.Array(DivisionSchema)),
  actiontypes: Type.Optional(Type.Array(ActionTypesSchema)),
  steps: Type.Optional(Type.Array(StepSchema)),
})

export type ActionPut = Static<typeof ActionPutSchema>
export const ActionPutSchema = Type.Object({
  actions: ActionPutSchemaDetails,
})

export type SingleAction = Static<typeof SingleActionSchema>
export const SingleActionSchema = Type.Object({
  links: linksSchema,
  actions: ActionSchema,
  linked: Type.Optional(actionLinkedSchema),
  meta: Type.Object({
    paging: Type.Object({ actions: MetaPagingSchema }),
  }),
})
export const CSingleAction = TypeCompiler.Compile(SingleActionSchema)

export type PagedActions = Static<typeof PagedActionsSchema>
export const PagedActionsSchema = Type.Object({
  links: linksSchema,
  actions: Type.Array(ActionSchema),
  linked: Type.Optional(actionLinkedSchema),
  meta: Type.Object({
    paging: Type.Object({ actions: MetaPagingSchema }),
  }),
})
export const CPagedActions = TypeCompiler.Compile(PagedActionsSchema)

export type UnknownActions = Static<typeof UnknownActionsSchema>
export const UnknownActionsSchema = Type.Object({
  links: linksSchema,
  actions: Type.Union([ActionSchema, Type.Array(ActionSchema)]),
  linked: Type.Optional(actionLinkedSchema),
  meta: Type.Object({
    paging: Type.Object({ actions: MetaPagingSchema }),
  }),
})
export const CUnknownActions = TypeCompiler.Compile(UnknownActionsSchema)
