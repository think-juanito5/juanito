import { ParticipantModel } from '@dbc-tech/johnny5-mongodb'

/**
 * Retrieves Typeform participants based on selected franchise and conveyancer.
 * @returns An array of all fixed participants.
 */
export const getParticipantsByFranchiseConveyancer = async (
  tenant: string,
  franchise: string,
  conveyancer: string,
) => {
  const categoryPattern = new RegExp(
    `^\\d+_-_Franchise [-–] ${franchise} \\(${conveyancer}\\)`,
    'i',
  )

  return await ParticipantModel.find({
    tenant,
    category: { $regex: categoryPattern },
  })
    .lean()
    .exec()
}
