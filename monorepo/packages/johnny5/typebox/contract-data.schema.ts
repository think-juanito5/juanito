import { type Static, t } from 'elysia'
import { tenantSchema } from './common.schema'

export const contractDataItem = t.Object({
  fieldName: t.String(),
  value: t.String(),
  text: t.String(),
  displayName: t.String(),
  fieldType: t.String(),
  confidence: t.Number(),
  pageNumber: t.Number(),
  location_left: t.Number(),
  location_top: t.Number(),
  location_width: t.Number(),
  location_height: t.Number(),
})

export type ContractData = Static<typeof contractDataSchema>
export const contractDataSchema = t.Object({
  // The unique identifier for the Contract Data
  id: t.String(),
  tenant: tenantSchema,
  fileId: t.String(),
  jobId: t.String(),
  contractDocumentBlobName: t.String(),
  operationStatus: t.String(),
  layoutName: t.Optional(t.String()),
  pageCount: t.Optional(t.Number()),
  layoutConfidenceScore: t.Optional(t.Number()),
  contractDataItems: t.Optional(t.Array(contractDataItem)),
  createdOn: t.Date(),
})
