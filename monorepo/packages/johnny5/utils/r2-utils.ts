/**
 * Replace all '/' with ':' to conform to Cloudflare R2's requirements
 *
 * @param filename The blob filename to convert.
 * @returns The converted filename, with '/' replaced by ':'.
 */
export const convertBlobFilenameToR2 = (filename: string): string => {
  return filename.replace(/\//g, ':')
}
