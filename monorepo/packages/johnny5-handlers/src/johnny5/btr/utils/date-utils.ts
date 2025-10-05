/**
 * Retrieves the office closure days for the current year.
 *
 * @returns {Date[]} An array of dates representing the office closure days for the current year.
 */
export const getOfficeClosureDays = (): Date[] =>
  getOfficeClosureDaysByYear(new Date().getFullYear())

/**
 * Returns an array of Date objects representing the office closure days for a given year.
 *
 * @param {number} year - The year for which to get the office closure days.
 * @returns {Date[]} An array of Date objects for the office closure days.
 */
export const getOfficeClosureDaysByYear = (year: number): Date[] => [
  new Date(year, 12, 27, 0, 0, 0, 0),
  new Date(year, 12, 28, 0, 0, 0, 0),
  new Date(year, 12, 29, 0, 0, 0, 0),
  new Date(year, 12, 30, 0, 0, 0, 0),
  new Date(year, 12, 31, 0, 0, 0, 0),
]
