import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ccaRaqSchema } from './cca-raq.schema'
import {
  australianStateSchema,
  bstSchema,
  ccaPartnerSchema,
  propertyTypeSchema,
  selectedPlanSchema,
  tenantSchema,
} from './common.schema'

export type Quote = Static<typeof quoteSchema>
export const quoteSchema = Type.Object({
  /**
   * The unique identifier for the quote
   * @type {string}
   */
  id: Type.String(),

  /**
   * The tenant (brand) key
   * @type {Tenant}
   */
  tenant: tenantSchema,

  /**
   * The unique identifier for the file
   * @type {string}
   */
  fileId: Type.String(),

  /**
   * The unique identifier for the linked price
   * @type {string}
   */
  pricingId: Type.Optional(Type.String()),

  /**
   * The state at which the price is applicable
   * @type {AustralianState}
   */
  state: australianStateSchema,

  /**
   * The quote intent
   * @type {Bst}
   */
  bst: bstSchema,

  /**
   * The type of property
   * @type {PropertyType}
   */
  propertyType: propertyTypeSchema,

  /**
   * Fee for searches (for fixed pricing)
   * @type {number}
   */
  searchesFee: Type.Optional(Type.Number()),

  /**
   * Minimum fee for searches (range pricing)
   * @type {number}
   */
  searchesFeeMin: Type.Optional(Type.Number()),

  /**
   * Maximum fee for searches (for range pricing)
   * @type {number}
   */
  searchesFeeMax: Type.Optional(Type.Number()),

  /**
   * Review fee
   * @type {number}
   */
  reviewFee: Type.Optional(Type.Number()),

  /**
   * Drafting fee
   * @type {number}
   */
  draftingFee: Type.Optional(Type.Number()),

  /**
   * Fixed conveyancing fee
   * @type {number}
   */
  fixedFee: Type.Optional(Type.Number()),

  /**
   * SDS fee
   * @type {number}
   */
  sdsFee: Type.Optional(Type.Number()),

  /**
   * Set to true if the quote is valid only for conveyancing
   * @type {number}
   */
  conveyanceOnly: Type.Optional(Type.Boolean()),

  /**
   * Set to true if searches fees are hidden in the website
   * @type {number}
   */
  hideSearchesFees: Type.Optional(Type.Boolean()),

  /**
   * Set to true if pricing is unavailable for the quote criteria
   * @type {number}
   */
  pricingUnavailable: Type.Optional(Type.Boolean()),

  /**
   * The name of the blob file containing the contract
   * @type {string}
   */
  contractBlobFile: Type.Optional(Type.String()),

  /**
   * The partner associated with the quote
   * @type {CcaPartner}
   */
  partner: Type.Optional(ccaPartnerSchema),

  /**
   * The selected plan associated with the quote
   * @type {SelectedPlan}
   */
  selectedPlan: Type.Optional(selectedPlanSchema),

  /**
   * The date when the quote was created
   * @type {string}
   */
  createdOn: Type.String(),

  /**
   * The date when the quote was completed
   * @type {string}
   */
  completedOn: Type.Optional(Type.String()),

  /**
   * The submitted RAQ form data
   * @type {CcaRaq}
   */
  raq: Type.Optional(ccaRaqSchema),
})

export const CQuote = TypeCompiler.Compile(quoteSchema)
