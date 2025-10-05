import {
  type Static,
  type TObject,
  type TString,
  Type,
} from '@sinclair/typebox'
import { dataItemTypeSchema, tenantSchema } from './common.schema'
import { Delete, Read } from './id.schema'

export const tagSchema = Type.Union([Type.Literal('buy'), Type.Literal('sell')])

export type RefdataContractData = Static<typeof refdataContractDataSchema>
export const refdataContractDataSchema = Type.Object({
  // The unique identifier for the Refdata
  id: Type.String(),
  tenant: tenantSchema,
  name: Type.String(),
  location: Type.String(),
  sub_section: Type.String(),
  threshold: Type.Number(),
  category: Type.String(),
  data_type: dataItemTypeSchema,
  required_for_matter_creation: Type.Boolean(),
  friendly_name: Type.String(),
  field_name: Type.String(),
  section: Type.String(),
  order: Type.Number(),
  tags: Type.Array(tagSchema),
})

const Create = <T extends TObject<{ id: TString }>>(schema: T) =>
  Type.Omit(schema, ['id', 'tenant'])
const Update = <T extends TObject<{ id: TString }>>(schema: T) =>
  Type.Omit(schema, ['id', 'tenant'])

// Create op-specific schemas
export type RefdataContractDataRead = Static<typeof RefdataContractDataRead>
export const RefdataContractDataRead = Read(refdataContractDataSchema)
export type RefdataContractDataCreate = Static<typeof RefdataContractDataCreate>
export const RefdataContractDataCreate = Create(refdataContractDataSchema)
export type RefdataContractDataDelete = Static<typeof RefdataContractDataDelete>
export const RefdataContractDataDelete = Delete(refdataContractDataSchema)
export type RefdataContractDataUpdate = Static<typeof RefdataContractDataUpdate>
export const RefdataContractDataUpdate = Update(refdataContractDataSchema)
