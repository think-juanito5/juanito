import {
  AllBst,
  AllCcaPartners,
  AllPropertyType,
  AllSelectedPlans,
  AllStates,
  AllTenants,
  type AustralianState,
  type Bst,
  type CcaPartner,
  type PropertyType,
  type SelectedPlan,
  type Tenant,
} from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'

export interface Quote {
  /**
   * The tenant (brand) key
   * @type {Tenant}
   */
  tenant: Tenant

  /**
   * The unique identifier for the file
   * @type {Types.ObjectId}
   */
  fileId: Types.ObjectId

  /**
   * The unique identifier for the linked price
   * @type {Types.ObjectId}
   */
  pricingId?: Types.ObjectId

  /**
   * The state at which the price is applicable
   * @type {AustralianState}
   */
  state: AustralianState

  /**
   * The quote intent
   * @type {Bst}
   */
  bst: Bst

  /**
   * The type of property
   * @type {PropertyType}
   */
  propertyType: PropertyType

  /**
   * Fee for searches (for fixed pricing)
   * @type {number}
   */
  searchesFee?: number

  /**
   * Minimum fee for searches (range pricing)
   * @type {number}
   */
  searchesFeeMin?: number

  /**
   * Maximum fee for searches (range pricing)
   * @type {number}
   */
  searchesFeeMax?: number

  /**
   * Review fee
   * @type {number}
   */
  reviewFee?: number

  /**
   * Drafting fee
   * @type {number}
   */
  draftingFee?: number

  /**
   * Fixed fee
   * @type {number}
   */
  fixedFee?: number

  /**
   * SDS fee
   * @type {number}
   */
  sdsFee?: number

  /**
   * Set to true if the quote is valid only for conveyancing
   * @type {boolean}
   */
  conveyanceOnly?: boolean

  /**
   * Set to true if searches fees are hidden in the website
   * @type {boolean}
   */
  hideSearchesFees?: boolean

  /**
   * Set to true if pricing is unavailable for the quote criteria
   * @type {boolean}
   */
  pricingUnavailable?: boolean

  /**
   * The name of the blob file containing the contract
   * @type {string}
   */
  contractBlobFile?: string

  /**
   * The partner associated with the quote
   * @type {CcaPartner}
   */
  partner?: CcaPartner

  /**
   * The plan associated with the quote
   * @type {SelectedPlan}
   */
  selectedPlan?: SelectedPlan

  /**
   * The date when the quote was created
   * @type {Date}
   */
  createdOn: Date

  /**
   * The date when the quote was completed
   * @type {Date}
   */
  completedOn?: Date
}

export const quoteSchema = new mongoose.Schema<Quote>(
  {
    tenant: {
      type: String,
      enum: AllTenants,
      unique: false,
      required: true,
      index: false,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: false,
    },
    pricingId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: false,
      index: false,
    },
    state: {
      type: String,
      enum: AllStates,
      unique: false,
      required: true,
      index: false,
    },
    bst: {
      type: String,
      enum: AllBst,
      unique: false,
      required: true,
      index: false,
    },
    propertyType: {
      type: String,
      enum: AllPropertyType,
      unique: false,
      required: true,
      index: false,
    },
    searchesFee: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    searchesFeeMin: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    searchesFeeMax: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    reviewFee: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    draftingFee: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    fixedFee: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    sdsFee: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    conveyanceOnly: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    hideSearchesFees: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    pricingUnavailable: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    contractBlobFile: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    partner: {
      type: String,
      enum: AllCcaPartners,
      unique: false,
      required: false,
      index: false,
    },
    selectedPlan: {
      type: String,
      enum: AllSelectedPlans,
      unique: false,
      required: false,
      index: false,
    },
    // The date the Quote was created
    createdOn: {
      type: Date,
      default: Date.now,
      unique: false,
      required: true,
      index: false,
    },
    // The date the Quote was completed
    completedOn: {
      type: Date,
      unique: false,
      required: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface DbQuote extends Quote {}

export const QuoteModel = mongoose.model('Quote', quoteSchema, 'quotes')
