import { type Tenant } from '@dbc-tech/johnny5'
import mongoose from 'mongoose'

export interface Participant {
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: Tenant
  // AU state or franchisee name
  category: string
  // The ActionStep Id of the participant
  participant_id: number
  // The ActionStep Id of the participant type
  participant_type_id: number
}

export interface DbParticipant extends Participant {}

export const participantSchema = new mongoose.Schema<Participant>(
  {
    tenant: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    participant_id: {
      type: Number,
      required: true,
    },
    participant_type_id: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  },
)

export const ParticipantModel = mongoose.model<Participant>(
  'Participant',
  participantSchema,
  'refdata_participants',
)
