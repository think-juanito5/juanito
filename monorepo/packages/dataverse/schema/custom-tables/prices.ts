import {
  australianStateSchema,
  propertyTypeSchema,
  tenantSchema,
} from '@dbc-tech/johnny5/typebox/common.schema'
import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Nullable, commonFields } from '../common'

export const bstSchema = Type.Union([
  Type.Literal('Purchasing'),
  Type.Literal('Selling'),
  // Type.Literal('Transferring') // Commented out as not currently a product offered by CCA
])
export type Bst = Static<typeof bstSchema>
export const CBst = TypeCompiler.Compile(bstSchema)

export const priceIdSchema = Type.Object({
  dbc_priceid: Type.String(),
})

export const priceSchema = Type.Object({
  dbc_brand: tenantSchema,
  dbc_bst: bstSchema,
  dbc_conveyancing_fee: Type.Optional(Nullable(Type.Number())),
  dbc_date_effective_from: Type.Optional(Type.String()),
  dbc_drafting_fee: Type.Optional(Nullable(Type.Number())),
  dbc_enabled: Type.Optional(Type.Boolean()),
  dbc_name: propertyTypeSchema,
  dbc_property_type: Type.Optional(Type.String()),
  dbc_review_fee: Type.Optional(Nullable(Type.Number())),
  dbc_searches_fee_max: Type.Optional(Nullable(Type.Number())),
  dbc_searches_fee_min: Type.Optional(Nullable(Type.Number())),
  dbc_searchesfee: Type.Optional(Nullable(Type.Number())),
  dbc_show_on_website: Type.Optional(Type.Boolean()),
  dbc_state: australianStateSchema,
  dbc_sds_fee: Type.Optional(Nullable(Type.Number())),
})
export type Price = Static<typeof priceSchema>
export const CPrice = TypeCompiler.Compile(priceSchema)

export const pricingSchema = Type.Intersect([priceIdSchema, priceSchema])
export type Pricing = Static<typeof pricingSchema>
export const CPricing = TypeCompiler.Compile(pricingSchema)

export const pricesSchema = Type.Object({
  '@odata.context': Type.String(),
  value: Type.Array(Type.Intersect([commonFields, pricingSchema])),
  '@odata.nextLink': Type.Optional(Type.String()),
})
export type Prices = Static<typeof pricesSchema>
export const CPrices = TypeCompiler.Compile(pricesSchema)
