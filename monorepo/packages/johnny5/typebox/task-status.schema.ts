import { type Static, Type } from '@sinclair/typebox'

export type TaskStatus = Static<typeof taskStatusSchema>
export const taskStatusSchema = Type.Union([
  Type.Literal('started'),
  Type.Literal('completed'),
  Type.Literal('completed-with-errors'),
  Type.Literal('abandoned'),
  Type.Literal('failed'),
])

export const AllTaskStatus: Array<TaskStatus> = [
  'started',
  'completed',
  'completed-with-errors',
  'abandoned',
  'failed',
]
