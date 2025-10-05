/**
 * Generates a hash for the given string data.
 *
 * @param data - The string to be hashed.
 * @returns The hash of the string as a string.
 */
export const hashString = (data: string): string => {
  return Bun.hash(data).toString()
}
