import { answerTypeSchema } from '@dbc-tech/typeform'
import { type Static, Type } from '@sinclair/typebox'
import {
  tenantSchema,
  typeFormClassSchema,
  typeFormTaskSchema,
} from './common.schema'

export const refdataTypeFormFieldRefSchema = Type.Object({
  // The unique identifier for the Refdata
  field_id: Type.String(),
  name: Type.String(),
  code: Type.String(),
  type: answerTypeSchema,
  tasks: Type.Array(typeFormTaskSchema),
})
export type RefdataTypeFormFieldRef = Static<
  typeof refdataTypeFormFieldRefSchema
>

export const refdataTypeFormSchema = Type.Object({
  // The unique identifier for the Refdata
  tenant: tenantSchema,
  name: Type.String(),
  form_id: Type.String(),
  class: typeFormClassSchema,
  field_refs: Type.Optional(Type.Array(refdataTypeFormFieldRefSchema)),
})
export type RefdataTypeForm = Static<typeof refdataTypeFormFieldRefSchema>

// Update op-specific schemas

export const RefdataTypeFormFieldRefUpdate = Type.Omit(
  refdataTypeFormFieldRefSchema,
  ['field_id'],
)
export type RefdataTypeFormFieldRefUpdate = Static<
  typeof RefdataTypeFormFieldRefUpdate
>

// Update op-specific schemas
export const RefdataTypeFormCreate = Type.Omit(refdataTypeFormSchema, [
  'tenant',
  'field_refs',
])
export type RefdataTypeFormCreate = Static<typeof RefdataTypeFormCreate>

export const RefdataTypeFormUpdate = Type.Omit(refdataTypeFormSchema, [
  'form_id',
  'tenant',
  'field_refs',
])
export type RefdataTypeFormUpdate = Static<typeof RefdataTypeFormUpdate>
