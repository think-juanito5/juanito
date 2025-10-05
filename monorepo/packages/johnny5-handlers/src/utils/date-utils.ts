import { format, formatInTimeZone } from 'date-fns-tz'

/**
 * Returns the current local date formatted as a string.
 * The date is formatted according to the 'en-AU' locale and the 'Australia/Sydney' timezone.
 *
 * @returns {string} The formatted local date.
 */
export const localDate = (): string =>
  new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
  }).format(new Date())

/**
 * Formats the current date in the 'en-CA' locale and returns it as a string.
 * The date is formatted using the 'Australia/Sydney' time zone.
 *
 * @returns The formatted date as a string.
 */
export const localDateCAFmt = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
  }).format(new Date())

/**
 * Returns the current date, advanced to the given timezone, formatted as an ISO8601 string.
 *
 * @returns {string} The formatted local date.
 */
export const isoTimestamp = (timezone: string): string =>
  formatInTimeZone(new Date(), timezone, `yyyy-MM-dd'T'HH:mm:ssxxx`)

/**
 * Returns the current date, advanced to the Melbourne timezone, suitable for storing as a db timestamp
 * Note: This should only be used in Data Lake queries. All other dates should be stored in UTC
 *
 * @returns {string} The formatted local date.
 */
export const dbTimestampMelbourne = (): string =>
  isoTimestamp('Australia/Melbourne')

/**
 * Converts a date to a string and returns in ISO 8601 format with Sydney AU timezone offset.
 * @param date - The date to format.
 * @returns The date as a string in ISO 8601 format with Sydney AU timezone offset.
 */
export const formatIsoWithSydneyAuTimezone = (date: Date): string => {
  return format(date, `yyyy-MM-dd'T'HH:mm:ssxxx`, {
    timeZone: 'Australia/Sydney',
  })
}

/**
 * Formats a given date in ISO format with the Melbourne, Australia timezone.
 * @param date - The date to be formatted.
 * @returns The formatted date string.
 */
export const formatIsoWithMelbourneAuTimezone = (date: Date): string => {
  return format(date, `yyyy-MM-dd'T'HH:mm:ssxxx`, {
    timeZone: 'Australia/Melbourne',
  })
}

/**
 * Delays the execution for a specified number of milliseconds.
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 */
export const delay = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
