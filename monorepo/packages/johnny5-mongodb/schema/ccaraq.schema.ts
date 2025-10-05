import {
  AllBst,
  AllPropertyType,
  AllStates,
  AllTenants,
  AllTimeToTransact,
  type AustralianState,
  type Bst,
  type PropertyType,
  type Tenant,
  type TimeToTransact,
} from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'

export interface DbCcaRaq {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Mongo Document Id of the File
  fileId: Types.ObjectId
  // The Mongo Document Id of the Job
  jobId: Types.ObjectId
  firstName: string
  lastName: string
  email: string
  phone: string
  propertyType: PropertyType
  timeToTransact: TimeToTransact
  bst: Bst
  state: AustralianState
  cid?: string
  sendEmailQuote?: boolean
  referralPage?: string
  channel?: string
  optIn?: boolean
  utm_id?: string
  utm_source?: string
  utm_campaign?: string
  utm_medium?: string
  utm_content?: string
  acceptPartnerTerms?: boolean
  membershipNo?: string
  offerCode?: string
  source: string
  sub: string
  hash: string
  // The date the document was created
  createdOn: Date
  testMode?: boolean
  notes?: string
  preferredContactTime?: string
  agent?: string
  referralID?: string
  referralPartnerEmail?: string
  referralFranchiseeEmail?: string
  conveyancingFirm?: string
  conveyancingName?: string
  experiment_id?: string
  experiment_variation?: string
  otoProductType?: string
  otoBuyerIdHash?: string
  otoOfferIdHash?: string
  otoListingIdHash?: string
  sdsRequired?: boolean
  webhook_id?: string
}

export const ccaRaqSchema = new mongoose.Schema<DbCcaRaq>(
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
    firstName: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    lastName: {
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
    phone: {
      type: String,
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
    timeToTransact: {
      type: String,
      enum: AllTimeToTransact,
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
    state: {
      type: String,
      enum: AllStates,
      unique: false,
      required: true,
      index: false,
    },
    cid: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    sendEmailQuote: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    referralPage: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    channel: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    optIn: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    utm_id: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    utm_source: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    utm_campaign: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    utm_medium: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    utm_content: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    acceptPartnerTerms: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    membershipNo: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    offerCode: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    source: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    sub: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    hash: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    // The date the file was created
    createdOn: {
      type: Date,
      default: Date.now,
      unique: false,
      required: true,
      index: false,
    },
    testMode: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    notes: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    preferredContactTime: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    agent: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    referralID: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    referralPartnerEmail: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    referralFranchiseeEmail: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    conveyancingFirm: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    conveyancingName: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    experiment_id: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    experiment_variation: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    otoProductType: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    otoBuyerIdHash: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    otoOfferIdHash: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    otoListingIdHash: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    sdsRequired: {
      type: Boolean,
      unique: false,
      required: false,
      index: false,
    },
    webhook_id: {
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

export const CcaRaqModel = mongoose.model('CCARAQ', ccaRaqSchema, 'cca_raqs')
