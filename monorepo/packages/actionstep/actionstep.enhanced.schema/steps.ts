import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {
  MetaPagingSchema,
  Nullable,
  Numeric,
  TrueFalseSchema,
  linksSchema,
} from './common'

export const stepNameTypeSchema = Type.Union([
  Type.Literal('Archived'),
  Type.Literal('Cancellation'),
  Type.Literal('Contract Drafted DO NOT USE'),
  Type.Literal('Contract Drafting'),
  Type.Literal('Contract Drafting (P) DO NOT USE'),
  Type.Literal('Contract Drafting (S) DO NOT USE'),
  Type.Literal('Contract Exchange & Cooling Off (P) DO NOT USE'),
  Type.Literal('Contract Exchange DO NOT USE'),
  Type.Literal('Contract Exchange (S) DO NOT USE'),
  Type.Literal('Contract Review'),
  Type.Literal('Contract Terminated'),
  Type.Literal('Contract with COP and Conditions DO NOT USE'),
  Type.Literal('Debt Recovery'),
  Type.Literal('Delayed Settlement'),
  Type.Literal('(Incorrectly Setup step) Pre-Settlement Resi (OTP)'),
  Type.Literal('Matter Preparation'),
  Type.Literal('Outstanding Invoices'),
  Type.Literal('Paper Settlement'),
  Type.Literal('Pending Drafting Webform'),
  Type.Literal('Pending Registration (OTP)'),
  Type.Literal('Pending Transfer'),
  Type.Literal('Post Settlement (P) DO NOT USE'),
  Type.Literal('Post Settlement (S) DO NOT USE'),
  Type.Literal('Pre-Contract Signing (P) DO NOT USE'),
  Type.Literal('Pre-Contract Signing (S) DO NOT USE'),
  Type.Literal('Pre-Exchange (P) DO NOT USE'),
  Type.Literal('Pre-Exchange (S) DO NOT USE'),
  Type.Literal('Pre-Settlement Resi (OTP)'),
  Type.Literal('Pre-Settlement Resi (P)'),
  Type.Literal('Pre-Settlement Resi (S)'),
  Type.Literal('Pre-Settlement Resi (T)'),
  Type.Literal('Seller Disclosure Statement'),
  Type.Literal('Settled'),
  Type.Literal('Transfer Stamping & Lodgement DO NOT USE'),
  Type.Literal('Trust Settlement'),
  Type.Literal('Unrecoverable'),
])
export type StepNameType = Static<typeof stepNameTypeSchema>

export type StepLinks = Static<typeof StepLinksSchema>
export const StepLinksSchema = Type.Object({
  actionType: Type.Optional(Type.String()),
  assignToParticipantType: Type.Optional(Nullable(Type.String())),
})

export type Step = Static<typeof StepSchema>
export const StepSchema = Type.Object({
  id: Type.String(),
  stepNumber: Type.Optional(Type.String()),
  stepName: Type.Optional(stepNameTypeSchema),
  description: Type.Optional(Nullable(Type.String())),
  actionStatus: Type.Optional(Type.String()),
  assignedToMandatory: Type.Optional(TrueFalseSchema),
  links: StepLinksSchema,
})

export const StepDataFieldsSchema = Type.Object({
  id: Numeric(),
  groupLabel: Type.String(),
  fieldLabel: Type.String(),
  fieldDescription: Nullable(Type.String()),
  defaultValue: Nullable(Type.String()),
  forceDefaultValue: TrueFalseSchema,
  displayOrder: Numeric(),
  isRequired: TrueFalseSchema,
  links: Type.Object({
    actionType: Numeric(),
    step: Type.String(),
    dataCollection: Type.Literal('data_collection_id'),
    dataField: Type.String(),
  }),
})

export const StepMessagesSchema = Type.Object({
  id: Type.String(),
  method: Type.String(),
  subject: Type.String(),
  message: Type.String(),
  messageHtml: Type.String(),
  isMandatory: TrueFalseSchema,
  links: Type.Object({
    actionType: Numeric(),
    step: Type.String(),
    fromParticipantType: Numeric(),
    toParticipantType: Numeric(),
  }),
})

export const StepParticipantTypesSchema = Type.Object({
  id: Numeric(),
  isRequired: TrueFalseSchema,
  displayOrder: Numeric(),
  links: Type.Object({
    actionType: Numeric(),
    step: Type.String(),
    participantType: Numeric(),
  }),
})

export const StepTasksSchema = Type.Object({
  id: Numeric(),
  name: Type.String(),
  priority: Type.String(),
  dueDateText: Type.String(),
  isMandatory: TrueFalseSchema,
  links: Type.Object({
    actionType: Type.String(),
    assignToParticipantType: Type.String(),
    step: Type.String(),
  }),
})

export type PagedSteps = Static<typeof PagedStepsSchema>
export const PagedStepsSchema = Type.Object({
  links: linksSchema,
  steps: Type.Array(StepSchema),
  meta: Type.Object({
    paging: Type.Object({ steps: MetaPagingSchema }),
  }),
})

export const CPagedSteps = TypeCompiler.Compile(PagedStepsSchema)

export type SingleStep = Static<typeof SingleStepSchema>
export const SingleStepSchema = Type.Object({
  links: linksSchema,
  steps: StepSchema,
  meta: Type.Object({
    paging: Type.Object({ steps: MetaPagingSchema }),
  }),
})

export const CSingleStep = TypeCompiler.Compile(SingleStepSchema)
