import type { Tenant } from '@dbc-tech/johnny5'
import { type Participant, ParticipantModel } from '../schema'

export interface ParticipantWithId extends Participant {
  id: string
}

export interface ParticipantTypeId {
  participant_type_id: number
}

export interface ParticipantId {
  id: string
}

export type ParticipantQuery = typeof ParticipantQuery
/**
 * Creates a MongoDB query accessor for managing Actionstep participants.
 * @returns An object with methods for creating and counting Actionstep participants.
 */
export const ParticipantQuery = {
  /**
   * Creates a new Actionstep participant.
   * @param participantData The data for the participant.
   * @returns The created participant.
   */
  createParticipant: async (participantData: Participant) => {
    try {
      const participant = new ParticipantModel(participantData)
      return await participant.save()
    } catch (error) {
      throw new Error(`Failed to create participant: ${error}`)
    }
  },
  /**
   * Counts the number of Actionstep participants in the Tenancy.
   * @returns The count of participants.
   */
  countParticipants: async (tenant: Tenant): Promise<number> => {
    return await ParticipantModel.countDocuments({ tenant })
  },
  /**
   * Retrieves all Actionstep participants.
   * @returns An array of all participants.
   */
  getAll: async (
    tenant: string,
    category?: string,
    participant_id?: number,
  ) => {
    const query = ParticipantModel.find({ tenant })
    if (category) query.where('category', category)
    if (participant_id) query.where('participant_id', participant_id)
    return await query.lean().exec()
  },
  /**
   * Retrieves an Actionstep participant by ID.
   * @param participantId The ID of the participant.
   * @returns The retrieved participant.
   */
  getParticipantById: async (id: string, tenant: string) => {
    return await ParticipantModel.findOne({
      _id: id,
      tenant: tenant,
    })
      .lean()
      .exec()
  },
  /**
   * Deletes an Actionstep participant by ID.
   * @param id The mongo ID of the participant to delete.
   * @returns The deleted participant.
   */
  deleteParticipantById: async (id: string, tenant: string) => {
    return await ParticipantModel.deleteOne({
      _id: id,
      tenant: tenant,
    }).exec()
  },
  /**
   * Updates an Actionstep participant by mongo ID.
   * @param id The ID of the participant to update.
   * @param participantData The updated data for the participant.
   * @returns The updated participant.
   */
  updateParticipantById: async (
    id: string,
    tenant: string,
    participantData: ParticipantTypeId,
  ) => {
    return await ParticipantModel.updateOne(
      { _id: id, tenant: tenant },
      participantData,
    ).exec()
  },
}
