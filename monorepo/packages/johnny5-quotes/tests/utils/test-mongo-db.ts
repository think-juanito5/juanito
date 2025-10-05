import mongoose from 'mongoose'

export async function connectDBForTesting(databaseName: string) {
  try {
    const dbUri = 'mongodb://localhost:27017'
    const dbName = databaseName
    await mongoose.connect(dbUri, {
      dbName,
      autoCreate: true,
    })
  } catch (_error) {
    console.log('DB connect error')
  }
}

export async function disconnectDBForTesting() {
  try {
    await mongoose.connection.close()
  } catch (_error) {
    console.log('DB disconnect error')
  }
}

export async function clearDBForTesting() {
  try {
    await mongoose.connection.dropCollection
  } catch (_error) {
    console.log('DB clear error')
  }
}
