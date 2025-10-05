import {
  AllDataItemTypes,
  AllIntentTags,
  AllTenants,
  type DataItemType,
  type IntentTag,
  type Tenant,
} from '@dbc-tech/johnny5'
import mongoose from 'mongoose'

export interface RefdataContractData {
  tenant: Tenant
  name: string
  location: string
  sub_section: string
  threshold: number
  category: string
  data_type: DataItemType
  required_for_matter_creation: boolean
  friendly_name: string
  field_name: string
  section: string
  order: number
  tags: IntentTag[]
}

export interface DbRefdataContractData extends RefdataContractData {}

export const refdataContractDataSchema =
  new mongoose.Schema<RefdataContractData>(
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
      location: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      sub_section: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      threshold: {
        type: Number,
        unique: false,
        required: true,
        index: false,
      },
      category: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      data_type: {
        type: String,
        enum: AllDataItemTypes,
        unique: false,
        required: true,
        index: false,
      },
      required_for_matter_creation: {
        type: Boolean,
        unique: false,
        required: true,
        index: false,
      },
      friendly_name: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      field_name: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      section: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      order: {
        type: Number,
        unique: false,
        required: true,
        index: false,
      },
      tags: {
        type: [String],
        enum: AllIntentTags,
        unique: false,
        required: true,
        index: false,
      },
    },
    {
      versionKey: false,
    },
  )

export const RefdataContractDataModel = mongoose.model(
  'RefdataContractData',
  refdataContractDataSchema,
  'refdata_contract_data',
)
