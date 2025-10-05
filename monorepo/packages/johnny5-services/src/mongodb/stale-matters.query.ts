import mongoose from 'mongoose'

export const staleMattersSchema = new mongoose.Schema({
  matterId: {
    type: Number,
    unique: true,
    required: true,
    index: true,
  },
  localDate: {
    type: String,
    required: true,
    index: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
    required: true,
  },
  ignoreReason: {
    type: String,
    required: false,
  },
  closureReason: {
    type: String,
    required: false,
  },
})

export type StaleMatter = mongoose.InferSchemaType<typeof staleMattersSchema>
export const StaleMatter = mongoose.model(
  'StaleMatter',
  staleMattersSchema,
  'stalematters',
)

export type StaleMattersQuery = typeof staleMattersQuery
/**
 * Creates a MongoDB query accessor for managing Stale Matters.
 * @returns An object with methods for creating and querying Stale Matters.
 */
export const staleMattersQuery = {
  /**
   * Returns true if a Stale Matter exists.
   * @param matterId - The ID of the Matter.
   * @returns `true` if the Matter exists, `false` if the Matter does not exist.
   */
  exists: async (matterId: number) => {
    const query = StaleMatter.exists({ matterId })
    const result = await query.exec()
    return result !== null
  },
  /**
   * Creates a Stale Matter if it does not already exist, and sets the ignore reason.
   * @param matterId - The ID of the Matter.
   * @param localDate - The local date of the Matter.
   * @param ignoreReason - The reason for ignoring the Matter.
   * @returns `true` if the Matter was created, `false` if it already exists.
   */
  ignoreMatterIfNotExists: async (
    matterId: number,
    localDate: string,
    ignoreReason: string,
  ) => {
    const query = StaleMatter.exists({ matterId })
    const result = await query.exec()
    if (result !== null) return true

    const staleMatter = new StaleMatter({
      matterId,
      localDate,
      ignoreReason,
    })
    await staleMatter.save()
    return false
  },
  /**
   * Creates a Stale Matter if it does not already exist, and sets the closure reason.
   * @param matterId - The ID of the Matter.
   * @param localDate - The local date of the Matter.
   * @param closureReason - The reason for closing the Matter.
   * @returns `true` if the Matter was created, `false` if it already exists.
   */
  closeMatterIfNotExists: async (
    matterId: number,
    localDate: string,
    closureReason: string,
  ) => {
    const query = StaleMatter.exists({ matterId })
    const result = await query.exec()
    if (result !== null) return true

    const staleMatter = new StaleMatter({
      matterId,
      localDate,
      closureReason,
    })
    await staleMatter.save()
    return false
  },
} as const
