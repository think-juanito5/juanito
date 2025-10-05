/**
 * Returns the current date in the 'Australia/Sydney' timezone formatted as a string.
 * The date is formatted according to the ISO 8601 standard.
 *
 * @returns {string} The formatted local date.
 */
export const localDateISO = (): string =>
  Intl.DateTimeFormat('en-CA', {
    dateStyle: 'short',
    timeZone: 'Australia/Sydney',
  }).format(new Date())

/**
 * Formats a UTC date and a time string into an Actionstep-compatible Melbourne date-time string.
 *
 * @param utcDate - The UTC Date object to be formatted.
 * @param aedtTime - The time string (in AEDT, e.g., "14:30:00") to append to the date.
 * @returns A string in the format "YYYY-MM-DD HH:mm:ss" using the Melbourne timezone for the date part.
 *
 * @example
 * const date = new Date('2024-05-05T04:00:00Z');
 * const time = '14:30:00';
 * // Returns: "2024-05-05 14:30:00"
 * getActionStepDateTimeFormat(date, time);
 */
export const getActionStepDateTimeFormat = (
  utcDate: Date,
  aedtTime: string,
): string => {
  // Validate aedtTime format: "HH:mm:ss"
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(aedtTime)) {
    throw new Error('aedtTime must be in "HH:mm:ss" 24-hour format')
  }

  const melbourneDateTime = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'australia/melbourne',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(utcDate)

  const datePart = melbourneDateTime.split(',')[0]
  const fullString = `${datePart} ${aedtTime}`
  return fullString
}
