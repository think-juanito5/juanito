import {
  AllTaskStatus,
  AllTaskTestModes,
  AllTaskTypes,
  AllTenants,
  type TaskStatus,
  type TaskTestMode,
  type TaskType,
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

export interface Task {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // The Mongo Document Id of the File
  fileId: Types.ObjectId
  // The type of Task
  type: TaskType
  // The client provided unique identifier
  clientId?: string
  // Additional metadata (key / value pairs)
  meta?: Meta[]
  // Task status: created, error-processing etc.
  status: TaskStatus
  // The date the Task was created
  createdOn: Date
  // The date the Task was completed
  completedOn?: Date
  // The date the Task was updated
  updatedOn?: Date
  // The date the Task moved to error status
  erroredOn?: Date
  // The reason for the error
  errorReason?: string
  // The email subscribers for this task
  emailSubscribers?: EmailSubscriber[]
  // The teams subscribers for this task
  teamsSubscribers?: TeamsSubscriber[]
  // Test mode
  testMode?: TaskTestMode
}

export interface DbTask extends Task {}

export const taskSchema = new mongoose.Schema<Task>(
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
    // The type of task (should be union / enum)
    type: {
      type: String,
      enum: AllTaskTypes,
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
    // Additional metadata (key / value pairs)
    meta: {
      type: [metaSchema],
      required: false,
      index: false,
    },
    // Task status: created, error-processing etc.
    status: {
      type: String,
      enum: AllTaskStatus,
      default: 'started',
      unique: false,
      required: true,
      index: false,
    },
    // The date the Task was created
    createdOn: {
      type: Date,
      default: Date.now,
      unique: false,
      required: true,
      index: false,
    },
    // The date the Task was completed
    completedOn: {
      type: Date,
      unique: false,
      required: false,
      index: false,
    },
    // The date the Task was updated
    updatedOn: {
      type: Date,
      unique: false,
      required: false,
      index: false,
    },
    // The date the Task moved to error status
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
    // The email subscribers for this Task
    emailSubscribers: [emailSubscriberSchema],
    // The teams subscribers for this Task
    teamsSubscribers: [teamsSubscriberSchema],
    // Test mode
    testMode: {
      type: String,
      enum: AllTaskTestModes,
      required: false,
      unique: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)

export interface DbTask extends Task {}

export const TaskModel = mongoose.model('task', taskSchema, 'tasks')
