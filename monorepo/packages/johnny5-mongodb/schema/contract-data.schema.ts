import { AllTenants, type Tenant } from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'

export interface ContractDataItem {
  fieldName: string
  value: string
  text: string
  displayName: string
  fieldType: string
  confidence: number
  pageNumber: number
  location_left: number
  location_top: number
  location_width: number
  location_height: number
}

export const contractDataItemSchema = new mongoose.Schema<ContractDataItem>(
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
      required: true,
      index: false,
    },
    text: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    displayName: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    fieldType: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    confidence: {
      type: Number,
      unique: false,
      required: true,
      index: false,
    },
    pageNumber: {
      type: Number,
      unique: false,
      required: true,
      index: false,
    },
    location_left: {
      type: Number,
      unique: false,
      required: true,
      index: false,
    },
    location_top: {
      type: Number,
      unique: false,
      required: true,
      index: false,
    },
    location_width: {
      type: Number,
      unique: false,
      required: true,
      index: false,
    },
    location_height: {
      type: Number,
      unique: false,
      required: true,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface ContractData {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Mongo Document Id of the File
  fileId: Types.ObjectId
  // The Mongo Document Id of the Job
  jobId: Types.ObjectId
  // The blob name of the contract document (stored in Azure)
  contractDocumentBlobName: string
  operationStatus: string
  layoutName?: string
  pageCount?: number
  layoutConfidenceScore?: number
  contractDataItems?: ContractDataItem[]
  // The date the contract data was created
  createdOn: Date
}

export interface DbContractData extends ContractData {}

export const contractDataSchema = new mongoose.Schema<ContractData>(
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
    // The blob name of the contract document (stored in Azure)
    contractDocumentBlobName: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    operationStatus: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    layoutName: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    pageCount: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    layoutConfidenceScore: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    contractDataItems: [contractDataItemSchema],
    // The date the contract data was created
    createdOn: {
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

export const ContractDataModel = mongoose.model(
  'ContractData',
  contractDataSchema,
  'contract_data',
)
