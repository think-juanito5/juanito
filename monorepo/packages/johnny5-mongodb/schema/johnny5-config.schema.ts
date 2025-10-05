import { AllTenants, type Tenant } from '@dbc-tech/johnny5'
import mongoose from 'mongoose'

export interface Johnny5Config {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  name: string
  data_type: string
  value: string
  tags?: string[]
  createdOn: Date
  updatedOn?: Date
}

export interface DbJohnny5Config extends Johnny5Config {}

export const johnny5ConfigSchema = new mongoose.Schema<Johnny5Config>(
  {
    // Tenant Key: CCA, BTR, FCL etc.
    tenant: {
      type: String,
      enum: AllTenants,
      unique: false,
      required: true,
      index: false,
    },
    name: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    data_type: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    value: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    tags: {
      type: [String],
      unique: false,
      required: false,
      index: false,
    },
    createdOn: {
      type: Date,
      default: Date.now,
      unique: false,
      required: true,
      index: false,
    },
    updatedOn: {
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

export const Johnny5ConfigModel = mongoose.model(
  'Johnny5Config',
  johnny5ConfigSchema,
  'johnny5_config',
)
