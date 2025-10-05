import {
  AllBst,
  AllPropertyType,
  AllStates,
  AllTenants,
  type AustralianState,
  type Bst,
  type PropertyType,
  type Tenant,
} from '@dbc-tech/johnny5'
import mongoose from 'mongoose'

export interface PricingFees {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  version: number
  state: AustralianState
  bst: Bst
  propertyType: PropertyType
  searchesFee?: number
  searchesFeeMin?: number
  searchesFeeMax?: number
  reviewFee?: number
  draftingFee?: number
  fixedFee?: number
  sdsFee?: number
  conveyanceOnly?: boolean
  hideSearchesFees?: boolean
}

export const pricingFeesSchema = new mongoose.Schema<PricingFees>(
  {
    tenant: {
      type: String,
      enum: AllTenants,
      unique: false,
      required: true,
      index: false,
    },
    version: {
      type: Number,
      unique: false,
      required: true,
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
  },
  {
    versionKey: false,
  },
)

export interface DbPricingFees extends PricingFees {}

export const PricingFeesModel = mongoose.model(
  'PricingFees',
  pricingFeesSchema,
  'pricing', // Updated collection name as the schema has changed and to support existing data & systems
)
