import {
  AllLogLevels,
  AllTenants,
  type LogLevel,
  type Tenant,
} from '@dbc-tech/johnny5'
import mongoose, { Schema, Types } from 'mongoose'

export interface AuditLog {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Document Id of the File
  fileId?: Types.ObjectId
  // The Document Id of the Job
  jobId?: Types.ObjectId
  // The Document Id of the Task
  taskId?: Types.ObjectId
  logLevel: LogLevel
  message: string
  tags?: string[]
  createdOn: Date
}

export interface DbAuditLog extends AuditLog {}

export const auditLogSchema = new mongoose.Schema<AuditLog>(
  {
    // Tenant Key: CCA, BTR, FCL etc.
    tenant: {
      type: String,
      enum: AllTenants,
      unique: false,
      required: true,
      index: false,
    },
    // The Document Id of the File
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      unique: false,
      required: false,
      index: false,
    },
    // The Document Id of the Job
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      unique: false,
      required: false,
      index: false,
    },
    // The Document Id of the Job
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      unique: false,
      required: false,
      index: false,
    },
    logLevel: {
      type: String,
      enum: AllLogLevels,
      unique: false,
      required: true,
      index: false,
    },
    message: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    tags: {
      type: [String],
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
  },
  {
    versionKey: false,
  },
)

export const AuditLogModel = mongoose.model(
  'AuditLog',
  auditLogSchema,
  'audit_log',
)
