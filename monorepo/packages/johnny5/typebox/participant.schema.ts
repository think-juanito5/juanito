import { Delete, Read } from '@dbc-tech/johnny5/typebox/id.schema'
import {
  type Static,
  type TObject,
  type TString,
  Type,
} from '@sinclair/typebox'

// Define main participant schema including id
export type Participant = Static<typeof participantSchema>
export const participantSchema = Type.Object({
  id: Type.String(),
  tenant: Type.String(),
  category: Type.String(),
  participant_id: Type.Number(),
  participant_type_id: Type.Number(),
})

// Create omits id
const Create = <T extends TObject<{ id: TString }>>(schema: T) =>
  Type.Omit(schema, ['id', 'tenant'])
// Update picks id and participant_type_id only
const Update = <T extends TObject<{ id: TString }>>(schema: T) =>
  Type.Composite([Type.Pick(schema, ['participant_type_id'])])

// Create op-specific schemas
export type ParticipantRead = Static<typeof ParticipantRead>
export const ParticipantRead = Read(participantSchema)
export type ParticipantCreate = Static<typeof ParticipantCreate>
export const ParticipantCreate = Create(participantSchema)
export type ParticipantDelete = Static<typeof ParticipantDelete>
export const ParticipantDelete = Delete(participantSchema)
export type ParticipantUpdate = Static<typeof ParticipantUpdate>
export const ParticipantUpdate = Update(participantSchema)
