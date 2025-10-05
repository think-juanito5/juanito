import { type Static, Type } from '@sinclair/typebox'
import {
  australianStateSchema,
  bstSchema,
  propertyTypeSchema,
  tenantSchema,
} from './common.schema'

export type PricingFees = Static<typeof pricingFeesSchema>
export const pricingFeesSchema = Type.Object({
  // The unique identifier for Fee
  id: Type.String(),
  tenant: tenantSchema,
  version: Type.Number(),
  state: australianStateSchema,
  bst: bstSchema,
  propertyType: propertyTypeSchema,
  searchesFee: Type.Optional(Type.Number()),
  searchesFeeMin: Type.Optional(Type.Number()),
  searchesFeeMax: Type.Optional(Type.Number()),
  reviewFee: Type.Optional(Type.Number()),
  draftingFee: Type.Optional(Type.Number()),
  fixedFee: Type.Optional(Type.Number()),
  sdsFee: Type.Optional(Type.Number()),
  conveyanceOnly: Type.Optional(Type.Boolean()),
  hideSearchesFees: Type.Optional(Type.Boolean()),
})
