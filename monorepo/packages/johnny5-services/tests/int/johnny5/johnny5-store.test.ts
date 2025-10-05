import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { type Participant, ParticipantQuery } from '@dbc-tech/johnny5-mongodb'
import mongoose from 'mongoose'
import { testJohnny5Pool } from '../../utils/test-johnny5-db'

describe('Participant Model', () => {
  let conn: mongoose.Connection
  //let testDb: TestJohnny5Db
  //let seeder: TestJohnny5Seeder

  beforeAll(async () => {
    const mongoConn = testJohnny5Pool()
    conn = await mongoConn.connect()
    //testDb = testJohnny5Db(conn)
  })

  beforeEach(async () => {
    await conn.dropDatabase()
  })

  afterAll(async () => {
    await conn.close()
  })

  it('should connect to the database', async () => {
    expect(conn).toBeDefined()
  })

  it('should create a participant', async () => {
    // Arrange
    const data: Participant = {
      tenant: 'CCA',
      category: 'test',
      participant_id: 1,
      participant_type_id: 1,
    }
    // Act
    const result = await ParticipantQuery.createParticipant(data)

    // Assert
    expect(result).toBeDefined()
  })
})
