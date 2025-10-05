import { AllTenants, type Tenant } from '@dbc-tech/johnny5/typebox'
import mongoose from 'mongoose'

export interface BtrAgent {
  tenant: Tenant
  sdsAgentId?: string
  fullName: string
  agencyName: string
  agentPhone: string
  agentEmail: string
  sdsWebsiteUrl?: string
  participantId?: number
  createdOn: Date
  updatedOn?: Date
}

export interface DbBtrAgent extends BtrAgent {}

export const btrAgentSchema = new mongoose.Schema<BtrAgent>(
  {
    // Tenant Key: CCA, BTR, FCL etc.
    tenant: {
      type: String,
      enum: AllTenants,
      unique: false,
      required: true,
      index: true,
    },
    sdsAgentId: {
      type: String,
      required: false,
      unique: true,
      maxlength: 50,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    agencyName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    agentPhone: {
      type: String,
      required: true,
      maxlength: 20,
    },
    agentEmail: {
      type: String,
      required: true,
      maxlength: 100,
    },
    sdsWebsiteUrl: {
      type: String,
      required: false,
      maxlength: 255,
    },
    participantId: {
      type: Number,
      required: false,
      unique: true,
      maxlength: 10,
      index: true,
    },
    createdOn: {
      type: Date,
      default: Date.now,
      required: true,
    },
    updatedOn: {
      type: Date,
      required: false,
    },
  },
  {
    versionKey: false,
  },
)

export const BtrAgentModel = mongoose.model<DbBtrAgent>(
  'BtrAgent',
  btrAgentSchema,
  'btr_agents',
)
