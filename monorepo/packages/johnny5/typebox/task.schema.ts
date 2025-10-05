import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from 'elysia/type-system'
import { tenantSchema } from './common.schema'
import { emailSubscriberSchema } from './email-subscriber.schema'
import { metaSchema } from './meta.schema'
import { taskStatusSchema } from './task-status.schema'
import { taskTestModeSchema } from './task-test-mode.schema'
import { taskTypeSchema } from './task-type.schema'
import { teamsSubscriberSchema } from './teams-subscriber.schema'

export type Task = Static<typeof taskSchema>
export const taskSchema = Type.Object({
  // The unique identifier for the Task
  id: Type.String(),
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: tenantSchema,
  // File Id
  fileId: Type.String(),
  // The type of Task
  type: taskTypeSchema,
  // Additional metadata (key / value pairs)
  meta: Type.Optional(Type.Array(metaSchema)),
  // Task status: created, error-processing etc.
  status: taskStatusSchema,
  // The date the Task was created
  createdOn: Type.Date(),
  // The date the Task was updated
  updatedOn: Type.Optional(Type.Date()),
  // The date the Task was completed
  completedOn: Type.Optional(Type.Date()),
  // The date the Task moved to error status
  erroredOn: Type.Optional(Type.Date()),
  // The reason for the error
  errorReason: Type.Optional(Type.String()),
  // The email subscribers for this task
  emailSubscribers: Type.Optional(Type.Array(emailSubscriberSchema)),
  // The teams subscribers for this task
  teamsSubscribers: Type.Optional(Type.Array(teamsSubscriberSchema)),
  // Test mode
  testMode: Type.Optional(taskTestModeSchema),
})

export const CTask = TypeCompiler.Compile(taskSchema)
