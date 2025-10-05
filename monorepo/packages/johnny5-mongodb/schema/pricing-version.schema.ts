import { AllTenants, type Tenant } from '@dbc-tech/johnny5'
import mongoose from 'mongoose'

export interface PricingVersion {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  version: number
  activeOn: Date
}

export const pricingVersionSchema = new mongoose.Schema<PricingVersion>(
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
    // The date the pricing version is active
    activeOn: {
      type: Date,
      default: Date.now,
      unique: false,
      required: true,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface DbPricingVersion extends PricingVersion {}

export const PricingVersionModel = mongoose.model(
  'PricingVersion',
  pricingVersionSchema,
  'pricing_versions', // Updated collection name as the schema has changed and to support existing data & systems
)
