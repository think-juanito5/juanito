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
