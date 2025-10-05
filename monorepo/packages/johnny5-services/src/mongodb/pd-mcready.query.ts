import mongoose from 'mongoose'

export const mcReadyDealSchema = new mongoose.Schema({
  dealId: {
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
})

export type McReadyDeal = mongoose.InferSchemaType<typeof mcReadyDealSchema>
export const McReadyDeal = mongoose.model(
  'McReadyDeal',
  mcReadyDealSchema,
  'mcreadydeals',
)

export type McReadyDealQuery = typeof mcReadyDealQuery
/**
 * Creates a MongoDB query accessor for managing MC Ready deals.
 * @returns An object with methods for creating and counting McReady deals.
 */
export const mcReadyDealQuery = {
  /**
   * Fetches McReady deal.
   * @param dealId - The ID of the deal.
   * @returns `deal if it exists otherwise null.
   */
  get: async (dealId: number) => {
    const query = McReadyDeal.findOne({ dealId })
    return query.exec()
  },
  /**
   * Deletes McReady deal.
   * @param dealId - The ID of the deal.
   * @returns `true if deal was deleted.
   */
  delete: async (dealId: number) => {
    const query = McReadyDeal.deleteOne({ dealId })
    const response = await query.exec()
    return response.deletedCount === 1
  },
  /**
   * Creates a McReady deal if it does not already exist.
   * @param dealId - The ID of the deal.
   * @param localDate - The local date of the deal.
   * @returns `true` if the deal was created, `false` if it already exists.
   */
  createIfNotExists: async (dealId: number, localDate: string) => {
    const query = McReadyDeal.exists({ dealId })
    const result = await query.exec()
    if (result !== null) return true

    const mcReadyDeal = new McReadyDeal({
      dealId,
      localDate,
    })
    await mcReadyDeal.save()
    return false
  },
  /**
   * Counts the number of McReady deals matching the given local date.
   * @param localDate - The local date to match.
   * @returns A promise that resolves to the count of matching deals.
   */
  countOfDealsMatchingDate: async (localDate: string) => {
    const query = McReadyDeal.countDocuments({ localDate })
    return query.exec()
  },
} as const
