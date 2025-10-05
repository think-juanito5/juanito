import Holidays from 'date-holidays'
import type { AustralianState } from '../typebox'

export type CustomHoliday = {
  day: number
  month: number
}

export const yearEndShutdown: CustomHoliday[] = [
  {
    day: 27,
    month: 12,
  },
  {
    day: 28,
    month: 12,
  },
  {
    day: 29,
    month: 12,
  },
  {
    day: 30,
    month: 12,
  },
  {
    day: 31,
    month: 12,
  },
]

export const dateCalculator = (
  state: AustralianState,
  customHolidays: CustomHoliday[] = [],
) => {
  const hd = new Holidays('AU', state)
  customHolidays.forEach((holiday) => {
    hd.setHoliday(`${holiday.month}-${holiday.day}`, 'Custom')
  })
  const removeTime = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }
  const isWeekDay = (date: Date) => {
    const today = removeTime(date)
    return today.getDay() !== 0 && today.getDay() !== 6
  }
  //const isWeekend = (date: Date) => !isWeekDay(date)
  const isWorkingDay = (date: Date) => {
    const today = removeTime(date)
    return isWeekDay(today) && hd.isHoliday(today) === false
  }
  const isHoliday = (date: Date) => !isWorkingDay(date)
  const getNextWorkingDay = (date: Date) => {
    const today = removeTime(date)
    if (isWorkingDay(today)) return today

    // Find the next day
    today.setDate(today.getDate() + 1)

    while (!isWorkingDay(today)) {
      today.setDate(today.getDate() + 1)
    }
    return today
  }
  const offsetWorkingDays = (date: Date, days: number) => {
    const currentDate = removeTime(date)
    let workingDaysOffset = days

    while (workingDaysOffset > 0) {
      currentDate.setDate(currentDate.getDate() + 1)
      if (isWorkingDay(currentDate)) {
        workingDaysOffset--
      }
    }
    return currentDate
  }
  const offsetCaldendarDays = (date: Date, days: number) => {
    const today = removeTime(date)
    today.setDate(today.getDate() + days)
    return today
  }

  return {
    /**
     * Opposite of `isHoliday`. Returns true if the given day is a working day (Monday to Friday excluding public and custom holidays)
     *
     * @param date - The date to be evaluated.
     * @returns The true if the date is a working day.
     */
    isWorkingDay: (date: Date) => isWorkingDay(date),

    /**
     * Opposite of `isWorkingDay` Returns true if the given day is a holiday or non-working day (Saturday or Sunday or public or custom holiday)
     *
     * @param date - The date to be evaluated.
     * @returns The true if the date is a non-working day.
     */
    isHoliday: (date: Date) => isHoliday(date),

    /**
     * Returns next day (or same day) that the date falls on a working day (Monday to Friday excluding public and custom holidays)
     *
     * @param date - The date to be evaluated.
     * @returns The date of the next working day, which could be the same day.
     */
    getNextWorkingDay: (date: Date) => getNextWorkingDay(date),

    /**
     * Offsets a date by the given number of working days (Monday to Friday excluding public and custom holidays)
     *
     * @param date - The date to be evaluated.
     * @param days - The number of working offset days to be factored.
     * @returns The date of the next offseted working day.
     */
    offsetWorkingDays: (date: Date, days: number) =>
      offsetWorkingDays(date, days),

    /**
     * Offsets a date by the given number of calendar days (note: this includes weekends, public and custom holidays)
     *
     * @param date - The date to be evaluated.
     * @param days - The number of offset days to be factored.
     * @returns The offseted date.
     */
    offsetCaldendarDays: (date: Date, days: number) =>
      offsetCaldendarDays(date, days),
  }
}
