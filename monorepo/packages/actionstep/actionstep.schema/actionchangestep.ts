import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { MetaPagingSchema, Nullable, Numeric, linksSchema } from './common'
import { NodeSchema } from './nodes'
import { ParticipantTypeSchema } from './participanttypes'
import {
  StepDataFieldsSchema,
  StepMessagesSchema,
  StepParticipantTypesSchema,
  StepSchema,
  StepTasksSchema,
} from './steps'

export type ActionChangeStep = Static<typeof ActionChangeStepSchema>
export const ActionChangeStepSchema = Type.Object({
  id: Type.String(),
  links: Type.Object({
    mustCompleteTasks: Type.Array(Numeric()),
    mustHaveEmailAddresses: Type.Array(Numeric()),
    step: Type.String(), //verified
    node: Type.String(), //verified
    stepTasks: Type.Array(Numeric()), //verified
    stepMessages: Type.Optional(Nullable(Type.Array(Type.String()))), //verified
    documentTemplates: Type.Array(Numeric()),
    stepParticipantTypes: Type.Array(Type.String()), //verified
    otherParticipantTypes: Type.Array(Numeric()), //verified
    stepDataFields: Type.Array(Type.String()), //verified
    stepRelatedActionTypes: Type.Array(Numeric()),
  }),
})

export type ActionChangeStepPost = Static<typeof ActionChangeStepPostSchema>
export const ActionChangeStepPostSchema = Type.Object({
  actionchangestep: Type.Object({
    actionName: Type.Optional(Type.String()),
    fileReference: Type.Optional(Type.String()),
    priority: Type.Optional(Type.String()),
    assignedToParticipant: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    timestamp: Type.Optional(Type.String()),
    filenote: Type.Optional(Type.String()),
    links: Type.Object({
      action: Numeric(),
      step: Type.String(),
      node: Type.String(),
      stepTasks: Type.Optional(Type.Array(Numeric())),
      documentTemplates: Type.Optional(Type.Array(Numeric())),
      stepMessages: Type.Optional(Type.Array(Numeric())),
      participantType151: Type.Optional(Type.Array(Numeric())),
    }),
  }),
})

export type PagedActionChangeStep = Static<typeof PagedActionChangeStepSchema>
export const PagedActionChangeStepSchema = Type.Object({
  links: linksSchema,
  actionchangestep: Type.Array(ActionChangeStepSchema),
  linked: Type.Optional(
    Type.Object({
      steps: Type.Array(StepSchema),
      nodes: Type.Array(NodeSchema),
      steptasks: Type.Array(StepTasksSchema),
      stepmessages: Type.Optional(Nullable(Type.Array(StepMessagesSchema))),
      stepparticipanttypes: Type.Optional(
        Nullable(Type.Array(StepParticipantTypesSchema)),
      ),
      participanttypes: Type.Array(ParticipantTypeSchema),
      stepdatafields: Type.Optional(Type.Array(StepDataFieldsSchema)),
    }),
  ),
  meta: Type.Object({
    paging: Type.Object({ actionchangestep: MetaPagingSchema }),
  }),
})

export const CActionChangeStep = TypeCompiler.Compile(
  PagedActionChangeStepSchema,
)
export type LinkedStepDataFieldsSchema = Static<typeof StepDataFieldsSchema>

const ActionChangeStepPutResponseSchema = Type.Object({
  actionchangestep: Type.Object({
    assignedToParticipant: Type.Number(),
    links: Type.Object({
      action: Type.String(),
      node: Type.String(),
      step: Type.String(),
      stepMessages: Type.Array(Type.String()),
      stepTasks: Type.Array(Type.Number()),
    }),
  }),
})

const StepDataFieldEntrySchema = Type.Record(
  Type.RegExp(/^stepDataField\d+$/),
  Type.String(),
)

const ActionChangeStepPutSchema = Type.Object({
  actionchangestep: Type.Object({
    ...StepDataFieldEntrySchema.properties,
    assignedToParticipant: Type.Number(),
    links: Type.Object({
      action: Type.String(),
      node: Type.String(),
      step: Type.String(),
      stepMessages: Type.Array(Type.String()),
      stepTasks: Type.Array(Type.Number()),
    }),
  }),
})

export const CActionChangeStepPut = TypeCompiler.Compile(
  ActionChangeStepPutSchema,
)
export type ActionChangeStepPut = Static<typeof ActionChangeStepPutSchema>

export const CActionChangeStepPutResponse = TypeCompiler.Compile(
  ActionChangeStepPutResponseSchema,
)
export type ActionChangeStepPutResponse = Static<
  typeof ActionChangeStepPutResponseSchema
>
