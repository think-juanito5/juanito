import {
  type Static,
  type TObject,
  type TString,
  Type,
} from '@sinclair/typebox'
import { tenantSchema } from './common.schema'
import { Delete, Read } from './id.schema'

export type RefdataConfig = Static<typeof refdataConfigSchema>
export const refdataConfigSchema = Type.Object({
  // The unique identifier for the Refdata
  id: Type.String(),
  tenant: tenantSchema,
  name: Type.String(),
  data_type: Type.String(),
  value: Type.String(),
  tags: Type.Optional(Type.Array(Type.String())),
  createdOn: Type.Date(),
  updatedOn: Type.Optional(Type.Date()),
})

const Create = <T extends TObject<{ id: TString }>>(schema: T) =>
  Type.Omit(schema, ['id', 'tenant', 'createdOn'])
const Update = <T extends TObject<{ id: TString }>>(schema: T) =>
  Type.Omit(schema, ['id', 'tenant', 'createdOn'])

// Create op-specific schemas
export type RefdataConfigRead = Static<typeof RefdataConfigRead>
export const RefdataConfigRead = Read(refdataConfigSchema)
export type RefdataConfigCreate = Static<typeof RefdataConfigCreate>
export const RefdataConfigCreate = Create(refdataConfigSchema)
export type RefdataConfigDelete = Static<typeof RefdataConfigDelete>
export const RefdataConfigDelete = Delete(refdataConfigSchema)
export type RefdataConfigUpdate = Static<typeof RefdataConfigUpdate>
export const RefdataConfigUpdate = Update(refdataConfigSchema)
