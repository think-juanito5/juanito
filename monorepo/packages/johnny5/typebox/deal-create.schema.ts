import { type Static, Type } from '@sinclair/typebox'
import { tenantSchema } from './common.schema'

export type DealCreateStatus = Static<typeof dealCreateStatusSchema>
export const dealCreateStatusSchema = Type.Union([
  Type.Literal('created'),
  Type.Literal('lead'),
  Type.Literal('additional-tables'),
  Type.Literal('deal'),
  Type.Literal('completed'),
])

export const AllDealCreateStatus: Array<DealCreateStatus> = [
  'created',
  'lead',
  'additional-tables',
  'deal',
  'completed',
]

export type DealCreate = Static<typeof dealCreateSchema>
export const dealCreateSchema = Type.Object({
  // The unique identifier for Deal Create
  id: Type.String(),
  tenant: tenantSchema,
  fileId: Type.String(),
  jobId: Type.String(),
  status: dealCreateStatusSchema,
  datainputId: Type.Optional(Type.Number()),
  leadId: Type.Optional(Type.Number()),
  personId: Type.Optional(Type.Number()),
  dealId: Type.Optional(Type.Number()),
  errorReason: Type.Optional(Type.String()),
  createdOn: Type.Date(),
  completedOn: Type.Optional(Type.Date()),
  erroredOn: Type.Optional(Type.Date()),
})
