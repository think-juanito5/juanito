import { AllTenants, type Tenant } from '@dbc-tech/johnny5'
import { type AnswerType } from '@dbc-tech/typeform'
import mongoose, { Schema, Types } from 'mongoose'

export const AllAnswerTypes: Array<AnswerType> = [
  'boolean',
  'choice',
  'choices',
  'date',
  'email',
  'file_url',
  'long_text',
  'number',
  'phone_number',
  'short_text',
  'text',
  'url',
]

export interface TypeFormResponseAnswer {
  type: AnswerType
  field_ref: string
  title: string
  labels: string[]
}

export const typeFormResponseAnswerSchema =
  new mongoose.Schema<TypeFormResponseAnswer>(
    {
      type: {
        type: String,
        enum: AllAnswerTypes,
        unique: false,
        required: true,
        index: false,
      },
      field_ref: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      title: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      labels: {
        type: [String],
        unique: false,
        required: true,
        index: false,
      },
    },
    {
      versionKey: false,
    },
  )

export interface TypeFormResponses {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Mongo Document Id of the File
  fileId: Types.ObjectId
  // The Mongo Document Id of the Job
  jobId: Types.ObjectId
  // The Typeform event_id
  event_id: string
  // The Typeform form_id
  form_id: string
  // The submitted_at found in the Typeform response
  submitted_at: Date
  // The title found in the Typeform response
  title: string
  // The answers found in the Typeform response
  answers: TypeFormResponseAnswer[]
  // The date the data was created
  createdOn: Date
}

export const typeFormResponsesSchema = new mongoose.Schema<TypeFormResponses>(
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
    // The Typeform event_id
    event_id: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    // The Typeform form_id
    form_id: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    // The submitted_at found in the Typeform response
    submitted_at: {
      type: Date,
      unique: false,
      required: true,
      index: false,
    },
    // The title found in the Typeform response
    title: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    // The answers found in the Typeform response
    answers: [typeFormResponseAnswerSchema],
    // The date the data was created
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

export const TypeFormResponsesModel = mongoose.model(
  'TypeFormResponses',
  typeFormResponsesSchema,
  'typeform_responses',
)
