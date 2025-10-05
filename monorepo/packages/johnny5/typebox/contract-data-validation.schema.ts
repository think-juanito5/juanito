import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from 'elysia/type-system'
import { tenantSchema } from './common.schema'

export type CorrectionDataItem = Static<typeof correctionDataItemSchema>
export const correctionDataItemSchema = Type.Object({
  fieldName: Type.String(),
  value: Type.Optional(Type.String()),
})

export type ContractDataValidation = Static<typeof contractDataValidationSchema>
export const contractDataValidationSchema = Type.Object({
  // The unique identifier for the record
  id: Type.String(),
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: tenantSchema,
  // File Id
  fileId: Type.String(),
  // Job Id
  jobId: Type.String(),
  // A note which can be passed to ActionStep
  note: Type.Optional(Type.String()),
  // The key/values of the items that were corrected
  correctionDataItems: Type.Optional(Type.Array(correctionDataItemSchema)),
  // The name of the person who created the correction data
  createdBy: Type.String(),
  // The date the correction data was created
  createdOn: Type.Date(),
  // Set to true if the contract is rejected
  isRejected: Type.Optional(Type.Boolean()),
  // The date the correction data was created
  rejectedOn: Type.Optional(Type.Date()),
})

export const CContractDataValidation = TypeCompiler.Compile(
  contractDataValidationSchema,
)

// Create op-specific schemas
export type ContractDataValidationCreate = Static<
  typeof contractDataValidationCreateSchema
>
export const contractDataValidationCreateSchema = Type.Composite([
  Type.Pick(contractDataValidationSchema, ['correctionDataItems']),
  Type.Pick(contractDataValidationSchema, ['note']),
  Type.Pick(contractDataValidationSchema, ['createdBy']),
  Type.Pick(contractDataValidationSchema, ['isRejected']),
])
