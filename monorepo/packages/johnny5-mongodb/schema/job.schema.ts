import {
  AllBlobTypes,
  AllJobStatus,
  AllJobTestModes,
  AllJobTypes,
  AllMatterStatus,
  AllServiceTypes,
  AllTenants,
  type BlobType,
  type JobStatus,
  type JobTestMode,
  type JobType,
  type MatterStatus,
  type ServiceType,
  type Tenant,
} from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'
import {
  type EmailSubscriber,
  emailSubscriberSchema,
} from './email-subscriber.schema'
import { type Meta, metaSchema } from './meta.schema'
import {
  type TeamsSubscriber,
  teamsSubscriberSchema,
} from './teams-subscriber.schema'

export interface Blob {
  // The blob name
  name: string
  // The blob type (should be union / enum)
  type: BlobType
}

export const blobSchema = new mongoose.Schema<Blob>(
  {
    // The blob name
    name: {
      type: String,
      required: true,
      unique: false,
      index: false,
    },
    // The blob type (should be union / enum)
    type: {
      type: String,
      enum: AllBlobTypes,
      required: true,
      unique: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface MatterId {
  // The Matter Id
  number: number
  // The Matter status
  status: MatterStatus
}

export const matterIdSchema = new mongoose.Schema<MatterId>(
  {
    // The Matter Id
    number: {
      type: Number,
      required: true,
      unique: false,
      index: false,
    },
    // The Matter status
    status: {
      type: String,
      enum: AllMatterStatus,
      required: true,
      unique: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface Job {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Mongo Document Id of the File
  fileId: Types.ObjectId
  // The type of service being offered or quoted
  serviceType: ServiceType
  // The client provided unique identifier
  clientId?: string
  // The type of Job
  type: JobType
  // The attached blobs (stored in Azure)
  blobs?: Blob[]
  // Additional metadata (key / value pairs)
  meta?: Meta[]
  // The matters to be processed
  matterIds?: MatterId[]
  // Job status: created, extraction, hitl-waiting, hitl-in-progress, hitl-completed, hitl-rejected, matter-created, error-processing etc.
  status: JobStatus
  // The date the Job was created
  createdOn: Date
  // The date the Job was completed
  completedOn?: Date
  // The date the Job moved to error status
  erroredOn?: Date
  // The reason for the error
  errorReason?: string
  // The email subscribers for this job
  emailSubscribers?: EmailSubscriber[]
  // The teams subscribers for this job
  teamsSubscribers?: TeamsSubscriber[]
  // Test mode
  testMode?: JobTestMode
}

export interface DbJob extends Job {}

export const jobSchema = new mongoose.Schema<Job>(
  {
    // Tenant Key: CCA, BTR, FCL etc.
    tenant: {
      type: String,
      enum: AllTenants,
      unique: false,
      required: true,
      index: false,
    },
    // File Id
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: false,
    },
    // The type of service being offered or quoted
    serviceType: {
      type: String,
      enum: AllServiceTypes,
      unique: false,
      required: true,
      index: false,
    },
    // The client provided unique identifier
    clientId: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    // The type of job (should be union / enum)
    type: {
      type: String,
      enum: AllJobTypes,
      unique: false,
      required: true,
      index: false,
    },
    // The attached blobs (stored in Azure)
    blobs: {
      type: [blobSchema],
      required: false,
      index: false,
    },
    // Additional metadata (key / value pairs)
    meta: {
      type: [metaSchema],
      required: false,
      index: false,
    },
    // The matters to be processed
    matterIds: {
      type: [matterIdSchema],
      required: false,
      index: false,
    },
    // Job status: created, extraction, hitl-waiting, hitl-in-progress, hitl-completed, hitl-rejected, matter-created, error-processing etc.
    status: {
      type: String,
      enum: AllJobStatus,
      default: 'created',
      unique: false,
      required: true,
      index: false,
    },
    // The date the Job was created
    createdOn: {
      type: Date,
      default: Date.now,
      unique: false,
      required: true,
      index: false,
    },
    // The date the Job was completed
    completedOn: {
      type: Date,
      unique: false,
      required: false,
      index: false,
    },
    // The date the Job moved to error status
    erroredOn: {
      type: Date,
      unique: false,
      required: false,
      index: false,
    },
    // The reason for the error
    errorReason: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    // The email subscribers for this Job
    emailSubscribers: [emailSubscriberSchema],
    // The teams subscribers for this Job
    teamsSubscribers: [teamsSubscriberSchema],
    // Test mode
    testMode: {
      type: String,
      enum: AllJobTestModes,
      required: false,
      unique: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface DbJob extends Job {}

export const JobModel = mongoose.model('Job', jobSchema, 'jobs')
