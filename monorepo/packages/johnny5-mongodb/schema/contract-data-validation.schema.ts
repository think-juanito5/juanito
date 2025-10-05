import { AllTenants, type Tenant } from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'

export interface CorrectionDataItem {
  fieldName: string
  value?: string
}

export const correctionDataItemSchema = new mongoose.Schema<CorrectionDataItem>(
  {
    fieldName: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    value: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface ContractDataValidation {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Mongo Document Id of the File
  fileId: Types.ObjectId
  // The Mongo Document Id of the Job
  jobId: Types.ObjectId
  // A note which can be passed to ActionStep
  note?: string
  // The key/values of the items that were corrected
  correctionDataItems?: CorrectionDataItem[]
  // The name of the person who created the correction data
  createdBy: string
  // The date the correction data was created
  createdOn: Date
  // Set to true if the contract is rejected
  isRejected?: boolean
  // The date the correction data was created
  rejectedOn?: Date
}

export interface DbContractDataValidation extends ContractDataValidation {}

export const contractDataValidationSchema =
  new mongoose.Schema<ContractDataValidation>(
    {
      // Tenant Key: CCA, BTR, FCL etc.
      tenant: {
        type: String,
        enum: AllTenants,
        unique: false,
        required: true,
        index: false,
      },
      // The Mongo Document Id of the File
      fileId: {
        type: Schema.Types.ObjectId,
        ref: 'File',
        unique: false,
        required: true,
        index: false,
      },
      // The Mongo Document Id of the Job
      jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        unique: false,
        required: true,
        index: false,
      },
      createdBy: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      // The key/values of the items that were corrected
      correctionDataItems: [correctionDataItemSchema],
      // A note which can be passed to ActionStep
      note: {
        type: String,
        unique: false,
        required: false,
        index: false,
      },
      // The date the correction data was created
      createdOn: {
        type: Date,
        default: Date.now,
        unique: false,
        required: true,
        index: false,
      },
      // Set to true if the contract is rejected
      isRejected: {
        type: Boolean,
        unique: false,
        required: false,
        index: false,
      },
      // The date the correction data was created
      rejectedOn: {
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

export const ContractDataValidationModel = mongoose.model(
  'CorrectionData',
  contractDataValidationSchema,
  'contract_data_validation',
)
