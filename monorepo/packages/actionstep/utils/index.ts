export * from './date-utils'

import { Buffer } from 'buffer'
import { Readable } from 'stream'
import type { ActionstepWebhook } from '../webhooks'

export const toBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const buffers: Uint8Array[] = []
    stream.on('error', reject)
    stream.on('data', (data: Buffer) => {
      buffers.push(Uint8Array.from(data))
    })
    stream.on('end', () => resolve(Buffer.concat(buffers)))
  })
}

/**
 * Extracts the primary participant IDs from an Actionstep webhook.
 *
 * @param webhook The Actionstep webhook object.
 * @returns An array of primary participant IDs as numbers. Returns an empty array if no primary participants are found.
 */
export const getPrimaryParticipantIds = (webhook: ActionstepWebhook) => {
  const data = webhook.data.relationships?.primary_participants?.data
  if (!data) return []
  if (Array.isArray(data)) return data.map((participant) => +participant.id)
  return [+data.id]
}

export const mergeWithoutDupes = <T>(
  a: T[],
  b: T[],
  predicate: (aItem: T, bItem: T) => boolean = (a, b) =>
    JSON.stringify(a) === JSON.stringify(b),
): T[] => {
  const c = [...a] // copy to avoid side effects
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) =>
    c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem),
  )
  return c
}
