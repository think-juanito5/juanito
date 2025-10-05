import { AllTenants, type Tenant } from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'

export interface EmailData {
  email: string
  name: string
}

export const emailDataSchema = new mongoose.Schema<EmailData>(
  {
    email: {
      type: String,
      required: true,
      unique: false,
      index: false,
    },
    name: {
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

export interface EmailLog {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Document Id of the File
  fileId: Types.ObjectId
  // The Document Id of the Job
  jobId?: Types.ObjectId
  // The Document Id of the Task
  taskId?: Types.ObjectId
  recipients: EmailData[]
  subject: string
  message: string
  sender: EmailData
  email_id: string
  email_status: string
  createdOn: Date
}

export interface DbEmailLog extends EmailLog {}

export const emailLogSchema = new mongoose.Schema<EmailLog>(
  {
    tenant: {
      type: String,
      enum: AllTenants,
      required: true,
      index: false,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: false,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: false,
      index: false,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: false,
      index: false,
    },
    recipients: {
      type: [emailDataSchema],
      required: true,
      index: false,
    },
    subject: {
      type: String,
      required: true,
      index: false,
    },
    message: {
      type: String,
      required: true,
      index: false,
    },
    sender: {
      type: emailDataSchema,
      required: true,
      index: false,
    },
    email_id: {
      type: String,
      required: true,
      index: false,
    },
    email_status: {
      type: String,
      required: true,
      index: false,
    },
    createdOn: {
      type: Date,
      default: Date.now,
      required: true,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export const EmailLogModel = mongoose.model(
  'EmailLog',
  emailLogSchema,
  'email_log',
)
