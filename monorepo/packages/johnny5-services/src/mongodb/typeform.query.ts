import mongoose from 'mongoose'

export const matterResponsesSchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  matterId: {
    type: String,
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
    index: true,
  },
})

export type MatterResponses = mongoose.InferSchemaType<
  typeof matterResponsesSchema
>
export const MatterResponses = mongoose.model(
  'TypeFormMatterResponses',
  matterResponsesSchema,
  'typeform-matter-responses',
)

export type TypeformQuery = typeof typeformQuery
export const typeformQuery = {
  createIfNotExists: async (
    eventId: string,
    matterId: string,
    localDate: string,
  ) => {
    const query = MatterResponses.exists({ eventId })
    const result = await query.exec()
    if (result !== null) return true

    const response = new MatterResponses({
      eventId,
      matterId,
      localDate,
    })
    await response.save()
    return false
  },
  findResponseByMatterId: async (matterId: string) => {
    const query = MatterResponses.find({ matterId })
    return query.exec()
  },
  countOfResponsesMatchingDate: async (localDate: string) => {
    const query = MatterResponses.countDocuments({ localDate })
    return query.exec()
  },
  findResponsesByDateRange: async (startDate: Date, endDate: Date) => {
    const query = MatterResponses.find({
      createdOn: {
        $gte: startDate,
        $lt: endDate,
      },
    })
    return query.exec()
  },
} as const
