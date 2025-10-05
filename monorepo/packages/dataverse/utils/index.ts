/**
 * Splits an array into chunks of a specified size.
 * @param arr The array to split.
 * @param chunkSize The maximum size of each chunk. Defaults to 999.
 * @returns An array of array chunks.
 */
export function chunkArray<T>(arr: T[], chunkSize = 999): T[][] {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize),
  )
}

/**
 * Formats a value as a string for output.
 * - Strings are wrapped in quotes.
 * - Booleans are converted to "true"/"false" strings.
 * - Numbers are converted to strings.
 * - Objects are double-JSON-stringified.
 * - Dates before 1753-01-01 are set to that date.
 * - Null/undefined returns an empty string.
 * @param val The value to format.
 * @returns The formatted string.
 */
export function formatter(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return `"${val}"`
  if (typeof val === 'boolean') return val ? `"true"` : `"false"`
  if (typeof val === 'number') return val.toString()
  if (typeof val === 'object') return JSON.stringify(JSON.stringify(val))
  if (val instanceof Date) {
    const checkDate = new Date('1753,1,1')
    if (val < checkDate) {
      return `"${checkDate.toISOString()}"`
    }
    return `"${val.toISOString()}"`
  }
  return String(val)
}

/**
 * Generates a formatted HTTP GET request string for Dataverse systemusers.
 * Using string mutation to ensure the line endings are CRLF.
 * @param baseUrl The base URL for the Dataverse API.
 * @returns The formatted HTTP GET request as a string.
 */
export function finalGet(baseUrl: string): string {
  let out: string = `Content-Type: application/http\r\n`
  out += `Content-Transfer-Encoding: binary\r\n`
  out += `\r\n`
  out += `GET ${baseUrl}/api/data/v9.2/systemusers?$top=1&$select=islicensed HTTP/1.1\r\n`
  return out
}
