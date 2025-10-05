import { type Static, Type } from '@sinclair/typebox'
import { tenantSchema } from './common.schema'
import { Delete, Read } from './id.schema'
import { serviceTypeSchema } from './service-type.schema'

// Define main participant schema including id
export type File = Static<typeof fileSchema>
export const fileSchema = Type.Object({
  // The unique identifier for the File
  id: Type.String(),
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: tenantSchema,
  // The type of service being offered or quoted
  serviceType: Type.Optional(serviceTypeSchema),
  // The reason the file was created
  sourceReason: Type.Optional(Type.String()),
  // The Pipedrive Deal ID
  pipedriveDealId: Type.Optional(Type.Number()),
  // The Actionstep Matter ID
  actionStepMatterId: Type.Optional(Type.Number()),
  // The date the file was created
  createdOn: Type.Date(),
})

// Create op-specific schemas
export type FileRead = Static<typeof FileRead>
export const FileRead = Read(fileSchema)
export type FileDelete = Static<typeof FileDelete>
export const FileDelete = Delete(fileSchema)
