import { type Static, Type } from '@sinclair/typebox'
import { tenantSchema } from './common.schema'

export type PricingVersion = Static<typeof pricingVersionSchema>
export const pricingVersionSchema = Type.Object({
  // The unique identifier for Version
  id: Type.String(),
  tenant: tenantSchema,
  version: Type.Number(),
  activeOn: Type.String(),
})
