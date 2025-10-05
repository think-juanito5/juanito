import { createMongoDbConnection } from '@dbc-tech/johnny5-mongodb'
import { Elysia } from 'elysia'

export const mongodb = new Elysia().onBeforeHandle(
  { as: 'global' },
  async () => {
    await createMongoDbConnection()
  },
)
