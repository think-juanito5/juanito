import { type Static, Type } from '@sinclair/typebox'

export type JobStatus = Static<typeof jobStatusSchema>
export const jobStatusSchema = Type.Union([
  Type.Literal('created'),
  Type.Literal('typeform-processed'),
  Type.Literal('contract-data-extracted'),
  Type.Literal('hitl-waiting'),
  Type.Literal('hitl-validated'),
  Type.Literal('hitl-rejected'),
  Type.Literal('manifest-created'),
  Type.Literal('matter-created'),
  Type.Literal('matter-populated'),
  Type.Literal('error-processing'),
  Type.Literal('completed'),
  Type.Literal('completed-with-errors'),
  Type.Literal('in-progress'),
])

export const AllJobStatus: Array<JobStatus> = [
  'created',
  'typeform-processed',
  'contract-data-extracted',
  'hitl-waiting',
  'hitl-validated',
  'hitl-rejected',
  'manifest-created',
  'matter-created',
  'matter-populated',
  'error-processing',
  'completed',
  'completed-with-errors',
  'in-progress',
]
