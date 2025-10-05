import {
  addBusinessDays,
  addDays,
  format,
  isValid,
  parse,
  parseISO,
} from 'date-fns'
import { formatInTimeZone, getTimezoneOffset, toZonedTime } from 'date-fns-tz'
import { enAU } from 'date-fns/locale'

export function parseDateOnly(date: string): Date | undefined {
  if (!date) return undefined

  const formats = [
    { re: /(\d{1,2}-\d{1,2}-\d{4})/, format: 'd-M-yyyy' },
    { re: /(\d{4}-\d{1,2}-\d{1,2})\s*$/gi, format: 'yyyy-MM-d' },
    { re: /(\d{1,2}-\d{1,2}-\d{2})\s*$/, format: 'd-M-yy' },
    { re: /(\d{1,2}\/\d{1,2}\/\d{4})/, format: 'd/M/yyyy' },
    { re: /(\d{1,2} \/ \d{1,2} \/ \d{4})\s*$/, format: 'dd / MM / yyyy' },
    { re: /(\d{1,2}\/\d{1,2}\/\d{2})\s*$/, format: 'd/M/yy' },
    { re: /(\d{1,2} \/ \d{1,2} \/ \d{2})\s*$/, format: 'dd / MM / yy' },
    { re: /(\d{1,2}\.\d{1,2}\.\d{2})\s*$/, format: 'd.M.yy' },
    { re: /(\d{1,2}\.\d{1,2}\.\d{4})/, format: 'd.M.yyyy' },
    { re: /(\d{1,2}\s+\d{1,2}\s+\d{2})\s*$/, format: 'd M yy' },
    { re: /(\d{1,2}\s+\d{1,2}\s+\d{4})/, format: 'd M yyyy' },
    {
      re: /(\d{1,2}(?:st|nd|rd|th)?\s(?:january|february|march|april|may|june|july|august|september|october|november|december)\s\d{4})/gi,
      format: 'do MMMM yyyy',
    },
    {
      re: /(\d{1,2}(?:st|nd|rd|th)?\s(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s\d{4})/gi,
      format: 'do MMM yyyy',
    },
    {
      re: /(\d{1,2}(?:st|nd|rd|th)?\s(?:january|february|march|april|may|june|july|august|september|october|november|december)\s\d{2})\s*$/gi,
      format: 'do MMMM yy',
    },
    {
      re: /(\d{1,2}(?:st|nd|rd|th)?\s(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s\d{2})\s*$/gi,
      format: 'do MMM yy',
    },
    {
      re: /(\d{1,2}\s(?:january|february|march|april|may|june|july|august|september|october|november|december)\s\d{4})/gi,
      format: 'd MMMM yyyy',
    },
    {
      re: /(\d{1,2}\s(?:january|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s\d{4})/gi,
      format: 'd MMM yyyy',
    },
    {
      re: /(\d{1,2}\s(?:january|february|march|april|may|june|july|august|september|october|november|december)\s\d{2})/gi,
      format: 'd MMMM yy',
    },
    {
      re: /(\d{1,2}\s(?:january|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s\d{2})\s*$/gi,
      format: 'd MMM yy',
    },
    {
      re: /(\d{1,2}-(?:january|february|march|april|may|june|july|august|september|october|november|december)-\d{4})/gi,
      format: 'd-MMMM-yyyy',
    },
    {
      re: /(\d{1,2}-(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oc|nov|dec)-\d{4})/gi,
      format: 'd-MMM-yyyy',
    },
    {
      re: /(\d{1,2}-(?:january|february|march|april|may|june|july|august|september|october|november|december)-\d{2})\s*$/gi,
      format: 'd-MMMM-yy',
    },
    {
      re: /(\d{1,2}-(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oc|nov|dec)-\d{2})\s*$/gi,
      format: 'd-MMM-yy',
    },
    {
      re: /^(?:january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2} \d{4}$/gi,
      format: 'MMMM d yyyy',
    },
    {
      re: /^(?:january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2}, \d{4}$/gi,
      format: 'MMMM d, yyyy',
    },
  ]

  for (const { re, format: dateFormat } of formats) {
    const match = date.match(re)
    if (match) return parseDateAsDayOnly(match[0], dateFormat)
  }

  const parsedDate = parseISO(date)
  return isValid(parsedDate)
    ? new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
      )
    : undefined
}

export function parseDate(date: string, fmt: string): Date {
  return parse(date, fmt, new Date(), { locale: enAU })
}

export function parseDateAsDayOnly(date: string, fmt: string): Date {
  const parsedDate = parseDate(date, fmt)
  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
  )
}

export function formatDate(date: Date | string): string {
  return format(date, 'yyyy-MM-dd')
}

export function getLatestDate(
  kDates: (string | undefined)[],
): string | undefined {
  const validDates = kDates
    .filter((date): date is string => !!date)
    .map((date) => date.trim())
    .filter((date) => Date.parse(date))

  if (validDates.length === 0) {
    return undefined
  }

  return validDates.reduce((latest, current) =>
    new Date(current) > new Date(latest) ? current : latest,
  )
}

/**
 * Calculates the start and end times in UTC for a given UTC date, based on the
 * Australia/Sydney timezone. The function determines the local start and end
 * of the day in the specified timezone and converts them back to UTC.
 *
 * @param dateUtc - The input date in UTC.
 * @returns An object containing the start and end times in UTC:
 *          - `startTimeUtc`: The start of the day in UTC.
 *          - `endTimeUtc`: The end of the day in UTC.
 */
export function getTimeRangeInUtc(dateUtc: Date): {
  startTimeUtc: Date
  endTimeUtc: Date
} {
  const timeZone = 'Australia/Sydney'

  // Convert the input UTC date to Australia/Sydney local time
  const zonedDate = toZonedTime(dateUtc, timeZone)

  const year = zonedDate.getFullYear()
  const month = zonedDate.getMonth()
  const day = zonedDate.getDate()

  const startLocal = new Date(Date.UTC(year, month, day, 0, 0, 0))
  const endLocal = new Date(Date.UTC(year, month, day, 23, 59, 0))

  const offsetStart = getTimezoneOffset(timeZone, startLocal)
  const offsetEnd = getTimezoneOffset(timeZone, endLocal)

  const startTimeUtc = new Date(startLocal.getTime() - offsetStart)
  const endTimeUtc = new Date(endLocal.getTime() - offsetEnd)

  return { startTimeUtc, endTimeUtc }
}

export function isIsoDateString(value: string): boolean {
  // Check for ISO 8601 format (covers formats like '2025-07-03T01:05:39Z')
  const isoDatePattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/

  if (!isoDatePattern.test(value)) {
    return false
  }

  // Additional validation: make sure it's actually parsable as a date
  const timestamp = Date.parse(value)
  return !isNaN(timestamp)
}

/**
 * Returns a new Date offset by a given number of days from the base date.
 * If businessDays is true, only business days (Mon-Fri) are counted; weekends are skipped.
 * If businessDays is false, all days are counted.
 *
 * @param baseDate - The starting Date
 * @param offsetDays - The number of days to offset (can be negative)
 * @param businessDays - Whether to count only business days (true) or all days (false)
 * @returns A new Date object offset by the specified number of days
 */
export function dateOffsetter(
  baseDate: Date,
  offsetDays: number,
  businessDays: boolean,
): Date {
  // Create a new date object to avoid mutating the original
  const newDate = new Date(baseDate.getTime())
  if (!businessDays) {
    // If not business days, simply add the offset
    return addDays(newDate, offsetDays)
  }
  // If business days, we need to adjust for week
  return addBusinessDays(newDate, offsetDays)
}

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
