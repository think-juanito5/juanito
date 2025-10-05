import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {
  MetaPagingSchema,
  Nullable,
  Numeric,
  TrueFalseSchema,
  linksSchema,
} from './common'

export type StepLinks = Static<typeof StepLinksSchema>
export const StepLinksSchema = Type.Object({
  actionType: Type.Optional(Type.String()),
  assignToParticipantType: Type.Optional(Nullable(Type.String())),
})

export type Step = Static<typeof StepSchema>
export const StepSchema = Type.Object({
  id: Type.String(),
  stepNumber: Type.Optional(Type.String()),
  stepName: Type.Optional(Type.String()),
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
