import { type Tenant } from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'

export interface BtrPostcodeConveyancer {
  tenant: Tenant
  conveyancerId: Types.ObjectId
  postcode: number
}

export const btrPostcodeConveyancerSchema =
  new mongoose.Schema<BtrPostcodeConveyancer>(
    {
      tenant: {
        type: String,
        unique: false,
        required: true,
        index: true,
      },
      conveyancerId: {
        type: Schema.Types.ObjectId,
        ref: 'BtrConveyancer',
        unique: false,
        required: true,
        index: true,
      },
      postcode: {
        type: Number,
        unique: false,
        required: true,
        index: true,
      },
    },
    {
      versionKey: false,
    },
  )

export const BtrPostcodeConveyancerModel =
  mongoose.model<BtrPostcodeConveyancer>(
    'BtrPostcodeConveyancer',
    btrPostcodeConveyancerSchema,
    'btr_postcode_conveyancer',
  )
