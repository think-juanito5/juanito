import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import {
  connectDBForTesting,
  disconnectDBForTesting,
} from '../../utils/test-mongo-db'

import { type Participant, ParticipantQuery } from '@dbc-tech/johnny5-mongodb'

describe('Participant', () => {
  beforeAll(async () => {
    await connectDBForTesting('test-johnny5-participant')
  })
  8
  afterAll(async () => {
    //await clearDBForTesting();
    await disconnectDBForTesting()
  })

  it('should create a participant', async () => {
    // Arrange
    const participantData: Participant = {
      tenant: 'CCA',
      category: 'test',
      participant_id: 1,
      participant_type_id: 1,
    }

    // Act
    const createdParticipant =
      await ParticipantQuery.createParticipant(participantData)

    // Assert
    expect(createdParticipant).toBeDefined()
    expect(createdParticipant).toHaveProperty('id')
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
})
