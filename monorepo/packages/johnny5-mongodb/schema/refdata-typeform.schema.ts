import {
  AllTenants,
  AllTypeFormClasses,
  type Tenant,
  type TypeFormClass,
  type TypeFormTask,
} from '@dbc-tech/johnny5'
import type { AnswerType } from '@dbc-tech/typeform'
import mongoose from 'mongoose'
import { AllAnswerTypes } from './typeform-response.schema'

export const AllTypeFormTasks: Array<TypeFormTask> = [
  'create-task',
  'complete-task',
  'close-matter',
  'update-datafield',
  'add-to-hypercare',
  'register-movinghub',
]

export interface RefdataTypeFormFieldRef {
  // The Typeform field_id
  field_id: string
  // Friendly name of the field
  name: string
  // Unique field reference eg. name, email, phone, suburb
  code: string
  // The answer data type
  type: AnswerType
  // Tasks to be performed
  tasks: TypeFormTask[]
}

export const refdataTypeFormFieldRefSchema =
  new mongoose.Schema<RefdataTypeFormFieldRef>(
    {
      // The Typeform field_id
      field_id: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      // Friendly name of the field
      name: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      // Unique field reference eg. name, email, phone, suburb
      code: {
        type: String,
        unique: false,
        required: true,
        index: false,
      },
      // The answer data type
      type: {
        type: String,
        enum: AllAnswerTypes,
        unique: false,
        required: true,
        index: false,
      },
      // Tasks to be performed
      tasks: {
        type: [String],
        enum: AllTypeFormTasks,
        unique: false,
        required: true,
        index: false,
      },
    },
    {
      versionKey: false,
    },
  )

export interface RefdataTypeForm {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // Friendly name of the form
  name: string
  // The Typeform form_id
  form_id: string
  // The TypeForm purpose
  class: TypeFormClass
  // Field refs
  field_refs?: RefdataTypeFormFieldRef[]
}

export interface DbRefdataTypeForm extends RefdataTypeForm {}

export const refdataTypeFormSchema = new mongoose.Schema<RefdataTypeForm>(
  {
    // Tenant Key: CCA, BTR, FCL etc.
    tenant: {
      type: String,
      enum: AllTenants,
      unique: false,
      required: true,
      index: false,
    },
    // Friendly name of the form
    name: {
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
    // The TypeForm purpose
    class: {
      type: String,
      enum: AllTypeFormClasses,
      unique: false,
      required: true,
      index: false,
    },
    // Field refs
    field_refs: [refdataTypeFormFieldRefSchema],
  },
  {
    versionKey: false,
  },
)

export const RefdataTypeFormModel = mongoose.model(
  'RefdataTypeForm',
  refdataTypeFormSchema,
  'refdata_typeform',
)
