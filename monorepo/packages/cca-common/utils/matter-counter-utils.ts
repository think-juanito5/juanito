import { getTimeRangeInUtc } from '@dbc-tech/johnny5'
import { MatterCreateModel } from '@dbc-tech/johnny5-mongodb'

export const getTodayDealMatterCreatedCount = async (): Promise<
  number | undefined
> => {
  try {
    const now = new Date()
    const { startTimeUtc, endTimeUtc } = getTimeRangeInUtc(now)

    const count = await MatterCreateModel.countDocuments({
      tenant: 'CCA',
      matterId: { $exists: true, $ne: null },
      completedOn: {
        $gte: new Date(startTimeUtc),
        $lte: new Date(endTimeUtc),
      },
    })

    return count
  } catch (_) {
    return undefined
  }
}
