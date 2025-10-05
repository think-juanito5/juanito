import type { Logger } from '@dbc-tech/logger'
import type { AustralianState, DataItem } from '../typebox'
import {
  type CustomHoliday,
  dateCalculator,
  yearEndShutdown,
} from './date-calculator'
import { formatDate } from './date-utils'
import { type DateOrDays, extractDateOrDays } from './string-utils'

export const extractDateOrNumberOfDays = async (
  item: DataItem,
  logger: Logger,
): Promise<DateOrDays> => extractDateOrDays(item.value!, logger)

export const calculateDateOrOffsetDate = async (
  item: DataItem,
  logger: Logger,
  state: AustralianState,
  contractDateItem: DataItem,
  customHolidays: CustomHoliday[] = yearEndShutdown,
  includeReferenceDayInOffsets = true,
) => {
  const result = await extractDateOrNumberOfDays(item, logger)
  if (!result) {
    return { ...item, value: undefined }
  }

  const cal = dateCalculator(state, customHolidays)
  if (result instanceof Date) {
    const nextWorkingDay = cal.getNextWorkingDay(result)
    return { ...item, value: formatDate(nextWorkingDay) }
  }

  const { numberOfDays, type } = result

  const actualNumberOfDays =
    includeReferenceDayInOffsets && numberOfDays > 0
      ? numberOfDays - 1
      : numberOfDays
  if (!contractDateItem.value) {
    await logger.debug(
      'Contract date not found. Unable to calculate relative date. Returning undefined',
      { item },
    )
    return { ...item, value: undefined }
  }
  const contractDate = new Date(contractDateItem.value)

  if (type === 'calendar') {
    const offsetDate = cal.offsetCaldendarDays(contractDate, actualNumberOfDays)
    const nextWorkingDay = cal.getNextWorkingDay(offsetDate)
    return { ...item, value: formatDate(nextWorkingDay) }
  } else {
    const effectiveContractDate = cal.getNextWorkingDay(contractDate)
    const offsetDate = cal.offsetWorkingDays(
      effectiveContractDate,
      actualNumberOfDays,
    )
    return { ...item, value: formatDate(offsetDate) }
  }
}
