import mongoose from 'mongoose'

export const createMongoDbConnection = async (dbName?: string) => {
  const autoIndex = process.env.MONGODB_AUTOINDEX === 'true'
  return mongoose.connect(<string>process.env.MONGODB_DSN, {
    dbName: dbName || <string>process.env.MONGODB_DB,
    autoIndex,
  })
}
