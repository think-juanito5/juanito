import mongoose, { type ClientSession } from 'mongoose'

export class MongoTransactionError extends Error {
  constructor(message: string, error: unknown) {
    super(message, { cause: error })
    Object.setPrototypeOf(this, Error.prototype)
  }
}

const disableTx = true // process.env.MONGODB_DISABLE_TX === 'true'

export async function mongoTx<Result>(
  run: (_: ClientSession) => Promise<Result>,
  onCommitError?: (error: unknown) => Promise<void>,
): Promise<Result> {
  const session = await mongoose.startSession()
  if (!disableTx) session.startTransaction()
  try {
    const result = await run(session)
    try {
      if (!disableTx) await session.commitTransaction()
      return result
    } catch (error) {
      if (!disableTx) session.abortTransaction() // roll back
      if (onCommitError) await onCommitError(error)
      let errMsg = 'Error committing transaction'
      if (error instanceof Error) errMsg = error.message
      throw new MongoTransactionError(errMsg, error)
    }
  } catch (error) {
    if (!disableTx) session.abortTransaction() // roll back
    throw error
  } finally {
    await session.endSession()
  }
}
