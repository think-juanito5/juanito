import { type Tenant } from '@dbc-tech/johnny5'
import mongoose from 'mongoose'

export interface BtrConveyancer {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  area: string
  region: string
  name: string
  email: string
  templateMatterId: number
  contactNumber: string
  conveyancerName: string
  conveyancerEmail: string
  conveyancerContactNumber: string
}

export const btrConveyancerSchema = new mongoose.Schema<BtrConveyancer>(
  {
    tenant: {
      type: String,
      unique: false,
      required: true,
      index: true,
    },
    area: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    region: {
      type: String,
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
    email: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    templateMatterId: {
      type: Number,
      unique: false,
      required: true,
      index: false,
    },
    contactNumber: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    conveyancerName: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    conveyancerEmail: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    conveyancerContactNumber: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export const BtrConveyancerModel = mongoose.model<BtrConveyancer>(
  'BtrConveyancer',
  btrConveyancerSchema,
  'btr_conveyancer',
)
