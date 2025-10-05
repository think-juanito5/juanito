import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {
  MetaPagingSchema,
  Nullable,
  TrueFalseSchema,
  linksSchema,
} from './common'
import { ParticipantTypeSchema } from './participanttypes'

export type ActionTypes = Static<typeof ActionTypesSchema>
export const ActionTypesSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  description: Nullable(Type.String()),
  copyrightHolder: Nullable(Type.String()),
  copyrightContact: Nullable(Type.String()),
  copyrightEmail: Nullable(Type.String()),
  trackActualTime: TrueFalseSchema,
  trackBillableTime: TrueFalseSchema,
  isForMarketingCampaigns: TrueFalseSchema,
  isForMarketingEvents: TrueFalseSchema,
  isForEmployees: TrueFalseSchema,
  isForCrm: TrueFalseSchema,
  isForDebtCollection: TrueFalseSchema,
  isDisabled: TrueFalseSchema,
  isBillable: TrueFalseSchema,
  enableActionImage: TrueFalseSchema,
  defaultEmailSubject: Nullable(Type.String()),
  logoFilename: Nullable(Type.String()),
  customLogoFilename: Nullable(Type.String()),
  customLogoDirectory: Nullable(Type.String()),
  customLogoFilesize: Nullable(Type.String()),
  customLogoModifiedTimestamp: Nullable(Type.String()),
  templateIdentifier: Nullable(Type.String()),
  allowCloseWithOpenInvoice: Nullable(TrueFalseSchema),
  allowInlineCustomizing: TrueFalseSchema,
  canCreate: TrueFalseSchema,
  links: Type.Object({
    primaryParticipantType: Nullable(Type.String()),
    billingPreference: Type.Optional(Type.String()),
  }),
})

const linkedSchema = Type.Object({
  participanttypes: Type.Optional(Type.Array(ParticipantTypeSchema)),
})

export const SingleActionTypeSchema = Type.Object({
  links: linksSchema,
  actiontypes: ActionTypesSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({ paging: Type.Object({ actiontypes: MetaPagingSchema }) }),
})
export type SingleActionType = Static<typeof SingleActionTypeSchema>
export const CSingleActionType = TypeCompiler.Compile(SingleActionTypeSchema)

export const PagedActionTypesSchema = Type.Object({
  links: linksSchema,
  actiontypes: Type.Array(ActionTypesSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({ paging: Type.Object({ actiontypes: MetaPagingSchema }) }),
})
export type PagedActionTypes = Static<typeof PagedActionTypesSchema>

export const UnknownActionTypesSchema = Type.Object({
  links: linksSchema,
  actiontypes: Type.Union([ActionTypesSchema, Type.Array(ActionTypesSchema)]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({ paging: Type.Object({ actiontypes: MetaPagingSchema }) }),
})
export type UnknownActionTypes = Static<typeof UnknownActionTypesSchema>
export const CUnknownActionTypes = TypeCompiler.Compile(
  UnknownActionTypesSchema,
)
