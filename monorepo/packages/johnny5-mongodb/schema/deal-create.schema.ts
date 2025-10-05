import {
  AllDealCreateStatus,
  AllTenants,
  type DealCreateStatus,
  type Tenant,
} from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'

export interface LeadDetails {
  userId: number
  correctionUserId: number
  correctionLeadId: number
  racvOnlyProcFlag: boolean
  userOnlyProcFlag: boolean
  existingPropTran: boolean
  updateTransSvcPdData: boolean
}
export const leadDetailsSchema = new mongoose.Schema<LeadDetails>(
  {
    userId: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    correctionUserId: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    correctionLeadId: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    racvOnlyProcFlag: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    userOnlyProcFlag: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    existingPropTran: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    updateTransSvcPdData: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
  },
  {
    _id: false,
  },
)

export interface DealCreate {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Mongo Document Id of the File
  fileId: Types.ObjectId
  // The Mongo Document Id of the Job
  jobId: Types.ObjectId
  status: DealCreateStatus
  datainputId?: number
  leadId?: number
  personId?: number
  dealId?: number
  leadDetails?: LeadDetails[]
  errorReason?: string
  createdOn: Date
  completedOn?: Date
  erroredOn?: Date
}

export const dealCreateSchema = new mongoose.Schema<DealCreate>(
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
      unique: false,
      required: true,
      index: false,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      unique: false,
      required: true,
      index: false,
    },
    status: {
      type: String,
      enum: AllDealCreateStatus,
      default: 'created',
      unique: false,
      required: true,
      index: false,
    },
    datainputId: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    leadId: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    personId: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    dealId: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    leadDetails: [leadDetailsSchema],
    errorReason: {
      type: String,
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
    completedOn: {
      type: Date,
      unique: false,
      required: false,
      index: false,
    },
    erroredOn: {
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

export const DealCreateModel = mongoose.model(
  'DealCreate',
  dealCreateSchema,
  'deal_create',
)
