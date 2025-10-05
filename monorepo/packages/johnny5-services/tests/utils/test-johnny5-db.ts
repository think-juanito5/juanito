import { ParticipantQuery } from '@dbc-tech/johnny5-mongodb'
import type { Participant } from '@dbc-tech/johnny5-mongodb'
import mongoose from 'mongoose'

export type TestJohnny5Data = typeof testJohnny5Data
export const testJohnny5Data = {
  participant: (cb?: (e: Participant) => void): Participant => {
    const entity: Participant = {
      tenant: 'CCA',
      category: 'test',
      participant_id: 1,
      participant_type_id: 1,
    }

    if (cb) cb(entity as Participant)
    return entity
  },
}

export type TestJohnny5Seeder = ReturnType<typeof testJohnny5Seeder>
export const testJohnny5Seeder = (
  db: ParticipantQuery,
  data: TestJohnny5Data,
) => {
  return {
    data,
    db,
    participant: {
      insert: async (cb?: (e: Participant) => void): Promise<Participant> => {
        const entity = data.participant(cb)
        await db.createParticipant(entity)
        return entity
      },
    },
  }
}

export type TestJohnny5Pool = ReturnType<typeof testJohnny5Pool>
export const testJohnny5Pool = () => {
  let mongoClient: mongoose.Connection
  return {
    connect: async () => {
      mongoClient = mongoose.createConnection(
        'mongodb://localhost:27017/test-johnny5',
      )
      return mongoClient
    },
    release: async () => {
      await mongoClient.close()
    },
    dropDatabase: async () => {
      await mongoClient.dropDatabase()
    },
  }
}

export type TestJohnny5Db = ReturnType<typeof testJohnny5Db>
export const testJohnny5Db = async (client: TestJohnny5Pool) => {
  const pool = testJohnny5Pool()
  const db = client
  const seeder = testJohnny5Seeder(ParticipantQuery, testJohnny5Data)
  return {
    pool,
    db,
    seeder,
    clear: async () => {
      await db.dropDatabase()
    },
    data: testJohnny5Data,
  }
}
