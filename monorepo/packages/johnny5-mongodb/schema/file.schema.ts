import {
  AllServiceTypes,
  AllTenants,
  type ServiceType,
  type Tenant,
} from '@dbc-tech/johnny5'
import mongoose from 'mongoose'

export interface File {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The type of service being offered or quoted
  serviceType?: ServiceType
  // The reason the file was created
  sourceReason?: string
  // The Pipedrive Deal ID
  pipedriveDealId?: number
  // The Actionstep Matter ID
  actionStepMatterId?: number
  // The date the file was created
  createdOn: Date
}

export const fileSchema = new mongoose.Schema<File>(
  {
    // Tenant Key: CCA, BTR, FCL etc.
    tenant: {
      type: String,
      enum: AllTenants,
      unique: false,
      required: true,
      index: false,
    },
    // The type of service being offered or quoted
    serviceType: {
      type: String,
      enum: AllServiceTypes,
      unique: false,
      required: false,
      index: false,
    },
    // The reason the file was created
    sourceReason: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    // The Pipedrive Deal ID
    pipedriveDealId: {
      type: Number,
      unique: false,
      required: false,
      index: true,
    },
    // The Actionstep Matter ID
    actionStepMatterId: {
      type: Number,
      unique: false,
      required: false,
      index: true,
    },
    // The date the file was created
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

export interface DbFile extends File {}

export const FileModel = mongoose.model('File', fileSchema, 'files')
