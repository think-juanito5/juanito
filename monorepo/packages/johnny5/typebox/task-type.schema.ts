import { type Static, Type } from '@sinclair/typebox'

export type TaskType = Static<typeof taskTypeSchema>
export const taskTypeSchema = Type.Union([
  Type.Literal('create-pexa-audit-record'),
  Type.Literal('matter-close'),
  Type.Literal('matter-deactivation'),
  Type.Literal('matter-reactivation'),
  Type.Literal('matter-update'),
  Type.Literal('process-pexa-audit-record'),
  Type.Literal('matter-name-refresh'),
  Type.Literal('matter-trustpilot-link'),
  Type.Literal('quote-contract-updated'),
  Type.Literal('quote-plan-selected'),
  Type.Literal('quote-completed'),
  Type.Literal('pipedrive-marketing-status-archive'),
  Type.Literal('pipedrive-lost-unsubscribe'),
  Type.Literal('sds-agent-register'),
  Type.Literal('matter-payment'),
])
export const AllTaskTypes: Array<TaskType> = [
  'create-pexa-audit-record',
  'matter-close',
  'matter-deactivation',
  'matter-reactivation',
  'matter-update',
  'process-pexa-audit-record',
  'matter-name-refresh',
  'matter-trustpilot-link',
  'quote-contract-updated',
  'quote-plan-selected',
  'quote-completed',
  'pipedrive-marketing-status-archive',
  'pipedrive-lost-unsubscribe',
  'sds-agent-register',
  'matter-payment',
]
