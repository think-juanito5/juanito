import {
  AllMatterCreateStatus,
  AllTenants,
  type MatterCreateStatus,
  type Tenant,
} from '@dbc-tech/johnny5'
import {
  AllManifestMetaTypes,
  type ManifestMetaType,
} from '@dbc-tech/johnny5/typebox/manifest-meta.schema'
import mongoose, { Schema, Types } from 'mongoose'

export interface manifestExistingParticipant {
  id: number
  type_id: number
  description: string
}

export const manifestExistingParticipantSchema =
  new mongoose.Schema<manifestExistingParticipant>(
    {
      id: {
        type: Number,
        unique: false,
        required: true,
        index: false,
      },
      type_id: {
        type: Number,
        unique: false,
        required: true,
        index: false,
      },
      description: {
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

export interface participantCreateAddress {
  type: 'physical' | 'mailing'
  line1?: string
  line2?: string
  suburb?: string
  state?: string
  postcode?: string
}

export const participantCreateAddressSchema =
  new mongoose.Schema<participantCreateAddress>(
    {
      type: {
        type: String,
        enum: ['physical', 'mailing'],
        unique: false,
        required: true,
        index: false,
      },
      line1: {
        type: String,
        unique: false,
        required: false,
        index: false,
      },
      line2: {
        type: String,
        unique: false,
        required: false,
        index: false,
      },
      suburb: {
        type: String,
        unique: false,
        required: false,
        index: false,
      },
      state: {
        type: String,
        unique: false,
        required: false,
        index: false,
      },
      postcode: {
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

export interface participantCreatePhone {
  number: string
  label?: string
}

export const participantCreatePhoneSchema =
  new mongoose.Schema<participantCreatePhone>(
    {
      number: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      label: {
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

export interface ManifestNewParticipant {
  type_id: number
  description?: string
  details: {
    is_company: boolean
    company_name?: string
    salutation?: string
    first_name?: string
    middle_name?: string
    last_name?: string
    suffix?: string
    preffered_name?: string
    addresses?: participantCreateAddress[]
    phones_numbers?: participantCreatePhone[]
    email_address?: string
  }
}

export interface manifestLinkParticipant {
  target_type_id: number
  source_type_id?: number
  participant_id?: number
}

export const manifestLinkParticipantSchema =
  new mongoose.Schema<manifestLinkParticipant>(
    {
      target_type_id: {
        type: Number,
        unique: false,
        required: true,
        index: false,
      },
      source_type_id: {
        type: Number,
        unique: false,
        required: false,
        index: false,
      },
      participant_id: {
        type: Number,
        unique: false,
        required: false,
        index: false,
      },
    },
    {
      versionKey: false,
    },
  )

export interface manifestParticipant {
  existing?: manifestExistingParticipant[]
  new?: ManifestNewParticipant[]
  link_matter?: manifestLinkParticipant[]
}

export const manifestParticipantSchema =
  new mongoose.Schema<manifestParticipant>(
    {
      existing: {
        type: Schema.Types.Mixed,
        unique: false,
        required: true,
        index: false,
      },
      new: {
        type: Schema.Types.Mixed,
        unique: false,
        required: true,
        index: false,
      },
      link_matter: {
        type: Schema.Types.Mixed,
        unique: false,
        required: true,
        index: false,
      },
    },
    {
      versionKey: false,
    },
  )

export interface createDataCollection {
  field_name: string
  description?: string
  value: string
}

export const createDataCollectionSchema =
  new mongoose.Schema<createDataCollection>(
    {
      field_name: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      description: {
        type: String,
        unique: false,
        required: false,
        index: false,
      },
      value: {
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

export interface manifestDataCollection {
  prepare: Record<string, number>
  create: createDataCollection[]
}

export const manifestDataCollectionSchema =
  new mongoose.Schema<manifestDataCollection>(
    {
      prepare: {
        type: Schema.Types.Mixed,
        unique: false,
        required: true,
        index: false,
      },
      create: {
        type: Schema.Types.Mixed,
        unique: false,
        required: true,
        index: false,
      },
    },
    {
      versionKey: false,
    },
  )

export interface manifestFileNote {
  note: string
}

export const manifestFileNoteSchema = new mongoose.Schema<manifestFileNote>(
  {
    note: {
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

export interface manifestTask {
  assignee_id: number
  name: string
  description: string
}

export const manifestTaskSchema = new mongoose.Schema<manifestTask>(
  {
    assignee_id: {
      type: Number,
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
    description: {
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

export interface manifestFile {
  filename: string
  url: string
}

export const manifestFileSchema = new mongoose.Schema<manifestFile>(
  {
    filename: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    url: {
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

export interface Manifest {
  participants: manifestParticipant
  data_collections: manifestDataCollection
  filenotes?: manifestFileNote[]
  tasks?: manifestTask[]
  files?: manifestFile[]
  steps?: unknown
  meta?: ManifestMeta[]
}

export interface Issues {
  description: string
  log?: string
  meta?: string[]
}

export const issuesSchema = new mongoose.Schema<Issues>(
  {
    description: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    log: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    meta: {
      type: [String],
      unique: false,
      required: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface ManifestMeta {
  // The key
  key: ManifestMetaType
  // The value
  value: string
}

export const manifestMetaSchema = new mongoose.Schema<ManifestMeta>(
  {
    // The meta key
    key: {
      type: String,
      enum: AllManifestMetaTypes,
      required: true,
      unique: false,
      index: false,
    },
    // The meta value
    value: {
      type: String,
      required: true,
      unique: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export const manifestSchema = new mongoose.Schema<Manifest>(
  {
    participants: {
      type: Schema.Types.Mixed,
      unique: false,
      required: true,
      index: false,
    },
    data_collections: {
      type: Schema.Types.Mixed,
      unique: false,
      required: true,
      index: false,
    },
    filenotes: {
      type: Schema.Types.Mixed,
      unique: false,
      required: true,
      index: false,
    },
    tasks: {
      type: Schema.Types.Mixed,
      unique: false,
      required: true,
      index: false,
    },
    files: {
      type: Schema.Types.Mixed,
      unique: false,
      required: true,
      index: false,
    },
    steps: {
      type: Schema.Types.Mixed,
      unique: false,
      required: true,
      index: false,
    },
    meta: {
      type: [manifestMetaSchema],
      required: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface MatterCreate {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Mongo Document Id of the File
  fileId: Types.ObjectId
  // The Mongo Document Id of the Job
  jobId: Types.ObjectId
  // The status of the matter creation
  status: MatterCreateStatus
  // The Actionstep Matter ID
  matterId?: number
  // The matter creation manifest
  manifest: Manifest
  // The list of issues encountered during the matter creation
  issues?: Issues[]
  // The reason for the error
  errorReason?: string
  // The date the matter creation was started
  createdOn: Date
  // The date the matter creation was completed
  completedOn?: Date
  // The date the matter creation was errored
  erroredOn?: Date
}

export interface DbMatterCreate extends MatterCreate {}

export const matterCreateSchema = new mongoose.Schema<MatterCreate>(
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
      ref: 'File',
      unique: false,
      required: true,
      index: false,
    },
    // The status of the matter creation
    status: {
      type: String,
      enum: AllMatterCreateStatus,
      default: 'participants',
      unique: false,
      required: true,
      index: false,
    },
    // The Actionstep Matter ID
    matterId: {
      type: Number,
      unique: false,
      required: false,
      index: false,
    },
    manifest: manifestSchema,
    // The list of issues encountered during the matter creation
    issues: {
      type: Schema.Types.Mixed,
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
    // The date the matter creation was started
    createdOn: {
      type: Date,
      default: Date.now,
      unique: false,
      required: true,
      index: false,
    },
    // The date the matter creation was completed
    completedOn: {
      type: Date,
      unique: false,
      required: false,
      index: false,
    },
    // The date the matter creation was errored
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

export const MatterCreateModel = mongoose.model(
  'MatterCreate',
  matterCreateSchema,
  'matter_create',
)
