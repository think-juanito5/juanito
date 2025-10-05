import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionSchema } from './actions'
import {
  MetaPagingSchema,
  Nullable,
  Numeric,
  TrueFalseSchema,
  linksSchema,
} from './common'
import { DataCollectionSchema } from './datacollections'
import { DocumentTemplateSchema } from './documenttemplates'
import { ParticipantSchema } from './participants'
import { RateSchema } from './rates'

export const TaskLinksSchema = Type.Object({
  triggerDataCollection: Type.Optional(Nullable(Type.String())),
  action: Type.String(),
  assignee: Type.String(),
  rate: Type.Optional(Nullable(Type.String())),
  confirmedNonBillableBy: Type.Optional(Nullable(Type.String())),
  linkedDocumentTemplate: Type.Optional(Nullable(Type.String())),
  linkedDataCollection: Type.Optional(Nullable(Type.String())),
  template: Type.Optional(Nullable(Type.String())),
})
export type TaskLinks = Static<typeof TaskLinksSchema>

export const TaskSchema = Type.Object({
  id: Numeric(),
  name: Type.String(),
  status: Type.String(),
  priority: Type.String(),
  dueTimestamp: Type.String(),
  startedTimestamp: Type.String(),
  completedTimestamp: Nullable(Type.String()),
  lastModifiedTimestamp: Type.String(),
  actualHours: Type.String(),
  billableHours: Type.String(),
  description: Nullable(Type.String()),
  assignedBy: Type.String(),
  completeDuringStep: Nullable(Numeric()),
  completeBeforeStep: Nullable(Numeric()),
  mustStartBeforeTimestamp: Nullable(Type.String()),
  expectedDurationValue: Nullable(Numeric()),
  expectedDurationUnits: Nullable(Type.String()),
  isBillingHold: Nullable(Type.String()),
  isPartBilled: TrueFalseSchema,
  confirmedNonBillable: Nullable(TrueFalseSchema),
  confirmedNonBillableTimestamp: Nullable(Type.String()),
  hasTriggerDate: TrueFalseSchema,
  triggerField: Nullable(Type.String()),
  triggerOffset: Nullable(Type.Number()),
  triggerWeekdaysOnly: TrueFalseSchema,
  links: TaskLinksSchema,
})
export type Task = Static<typeof TaskSchema>

export const taskPutPostInnerSchema = Type.Object({
  name: Type.Optional(Nullable(Type.String())),
  status: Type.Optional(Nullable(Type.String())),
  priority: Type.Optional(Nullable(Type.String())),
  dueTimestamp: Type.Optional(Nullable(Type.String())),
  startedTimestamp: Type.Optional(Nullable(Type.String())),
  completedTimestamp: Type.Optional(Nullable(Type.String())),
  lastModifiedTimestamp: Type.Optional(Nullable(Type.String())),
  actualHours: Type.Optional(Nullable(Type.String())),
  billableHours: Type.Optional(Nullable(Type.String())),
  description: Type.Optional(Nullable(Type.String())),
  assignedBy: Type.Optional(Nullable(Type.String())),
  completeDuringStep: Type.Optional(Nullable(Numeric())),
  completeBeforeStep: Type.Optional(Nullable(Numeric())),
  mustStartBeforeTimestamp: Type.Optional(Nullable(Type.String())),
  expectedDurationValue: Type.Optional(Nullable(Numeric())),
  expectedDurationUnits: Type.Optional(Nullable(Type.String())),
  isBillingHold: Type.Optional(Nullable(Type.String())),
  isPartBilled: Type.Optional(Nullable(TrueFalseSchema)),
  confirmedNonBillable: Type.Optional(Nullable(TrueFalseSchema)),
  confirmedNonBillableTimestamp: Type.Optional(Nullable(Type.String())),
  hasTriggerDate: Type.Optional(Nullable(TrueFalseSchema)),
  triggerField: Type.Optional(Nullable(Type.String())),
  triggerOffset: Type.Optional(Nullable(Numeric())),
  triggerWeekdaysOnly: Type.Optional(TrueFalseSchema),
  links: Type.Optional(TaskLinksSchema),
})
export type TaskPutPostInner = Static<typeof taskPutPostInnerSchema>

export const TaskPutSchema = Type.Object({
  tasks: taskPutPostInnerSchema,
})
export type TaskPut = Static<typeof TaskPutSchema>

export const taskPutPostMultipleSchema = Type.Object({
  tasks: Type.Array(taskPutPostInnerSchema),
})
export type TaskPutPostMultiple = Static<typeof taskPutPostMultipleSchema>

export const TaskPostSchema = Type.Object({
  tasks: Type.Object({
    name: Type.String(),
    status: Type.String(),
    priority: Type.Optional(Type.String()),
    dueTimestamp: Type.Optional(Type.String()),
    startedTimestamp: Type.Optional(Type.String()),
    completedTimestamp: Type.Optional(Type.String()),
    lastModifiedTimestamp: Type.Optional(Type.String()),
    actualHours: Type.Optional(Type.String()),
    billableHours: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    assignedBy: Type.Optional(Type.String()),
    completeDuringStep: Type.Optional(Numeric()),
    completeBeforeStep: Type.Optional(Numeric()),
    mustStartBeforeTimestamp: Type.Optional(Type.String()),
    expectedDurationValue: Type.Optional(Numeric()),
    expectedDurationUnits: Type.Optional(Type.String()),
    isBillingHold: Type.Optional(Type.String()),
    isPartBilled: Type.Optional(TrueFalseSchema),
    confirmedNonBillable: Type.Optional(TrueFalseSchema),
    confirmedNonBillableTimestamp: Type.Optional(Type.String()),
    hasTriggerDate: Type.Optional(TrueFalseSchema),
    triggerField: Type.Optional(Type.String()),
    triggerOffset: Type.Optional(Numeric()),
    triggerWeekdaysOnly: Type.Optional(TrueFalseSchema),
    links: TaskLinksSchema,
  }),
})
export type TaskPost = Static<typeof TaskPostSchema>

export const TaskTemplateSchema = Type.Object({
  id: Numeric(),
  stepNumber: Numeric(),
  taskName: Type.String(),
  costRate: Type.Optional(Type.String()),
  priority: Type.Optional(Type.String()),
  dueDaysAhead: Type.Optional(Numeric()),
  estimatedHours: Type.Optional(Type.String()),
  expectedDuration: Type.Optional(Type.String()),
  expectedDurationUnits: Type.Optional(Type.String()),
  showOnGanttChart: Type.Optional(Type.String()),
  isDueDateAheadWeekDays: Type.Optional(TrueFalseSchema),
  dueDateTrigger: Type.Optional(TrueFalseSchema),
  generatedCount: Type.Optional(TrueFalseSchema),
  links: Type.Object({
    actionType: Type.String(),
    participantType: Type.Optional(Type.String()),
    activity: Type.Optional(Type.String()),
    tag: Type.Optional(Type.String()),
  }),
})
export type TaskTemplate = Static<typeof TaskTemplateSchema>

const linkedSchema = Type.Object({
  datacollections: Type.Optional(Type.Array(DataCollectionSchema)),
  actions: Type.Optional(Type.Array(ActionSchema)),
  participants: Type.Optional(Type.Array(ParticipantSchema)),
  rates: Type.Optional(Type.Array(RateSchema)),
  documenttemplates: Type.Optional(Type.Array(DocumentTemplateSchema)),
  tasktemplates: Type.Optional(Type.Array(TaskTemplateSchema)),
})

export const SingleTaskSchema = Type.Object({
  links: linksSchema,
  tasks: TaskSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ tasks: MetaPagingSchema }),
  }),
})
export type SingleTask = Static<typeof SingleTaskSchema>
export const CSingleTask = TypeCompiler.Compile(SingleTaskSchema)

export const PagedTasksSchema = Type.Object({
  links: linksSchema,
  tasks: Type.Array(TaskSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ tasks: MetaPagingSchema }),
  }),
})
export type PagedTasks = Static<typeof PagedTasksSchema>
export const CPagedTasks = TypeCompiler.Compile(PagedTasksSchema)

export const UnknownTasksSchema = Type.Object({
  links: linksSchema,
  tasks: Type.Union([TaskSchema, Type.Array(TaskSchema)]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ tasks: MetaPagingSchema }),
  }),
})
export type UnknownTasks = Static<typeof UnknownTasksSchema>
export const CUnknownTasks = TypeCompiler.Compile(UnknownTasksSchema)
