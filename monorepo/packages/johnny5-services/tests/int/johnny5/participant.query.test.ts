import { beforeAll, describe, expect, it } from 'bun:test'
import {
  ParticipantQuery,
  createMongoDbConnection,
} from '@dbc-tech/johnny5-mongodb'
import { type Participant } from '@dbc-tech/johnny5-mongodb'

describe('Participant Model', () => {
  beforeAll(async () => {
    await createMongoDbConnection()
  })

  it('should return participants', async () => {
    const participants = await ParticipantQuery.getAll('CCA')
    expect(participants).toBeDefined()
    expect(participants).toBeInstanceOf(Array)
    expect(participants.length).toBeGreaterThan(0)
    participants.forEach((participant) => {
      expect(participant).toHaveProperty('id')
      expect(participant).toHaveProperty('tenant')
      expect(participant).toHaveProperty('category')
      expect(participant).toHaveProperty('participant_id')
      expect(participant).toHaveProperty('participant_type_id')
    })
  })

  it('should create a participant', async () => {
    const participantData: Participant = {
      tenant: 'CCA',
      category: 'TestCategory',
      participant_id: 123,
      participant_type_id: 456,
    }
    const createdParticipant =
      await ParticipantQuery.createParticipant(participantData)
    expect(createdParticipant).toBeDefined()
    expect(createdParticipant).toHaveProperty('id')
  })

  it('should count participants', async () => {
    const count = await ParticipantQuery.countParticipants('CCA')
    expect(count).toBeDefined()
    expect(count).toBeGreaterThan(0)
  })

  it('should retrieve a participant by ID', async () => {
    const participants = await ParticipantQuery.getAll('CCA')
    const participantId = participants[0]._id.toString()
    const participant = await ParticipantQuery.getParticipantById(
      participantId,
      'CCA',
    )
    expect(participant).toBeDefined()
    expect(participant).toHaveProperty('id', participantId)
  })

  it('should delete a participant by ID', async () => {
    const participants = await ParticipantQuery.getAll('CCA')
    const participantId = participants[0]._id.toString()
    const deletedParticipant = await ParticipantQuery.deleteParticipantById(
      participantId,
      'CCA',
    )
    expect(deletedParticipant).toBeDefined()
    expect(deletedParticipant).toHaveProperty('_id', participantId)
  })

  it('should update a participant by ID', async () => {
    const participants = await ParticipantQuery.getAll('CCA')
    const participantId = participants[0]._id.toString()
    const updatedData = { participant_type_id: 789 }
    const modifiedCount = await ParticipantQuery.updateParticipantById(
      participantId,
      'CCA',
      updatedData,
    )
    expect(modifiedCount).toBeDefined()
    expect(modifiedCount).toBeGreaterThan(0)
  })
})
