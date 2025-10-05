import { describe, expect, it } from 'bun:test'
import type { ActionstepWebhook } from '../webhooks'
import { getPrimaryParticipantIds } from './index'

describe('getPrimaryParticipantIds', () => {
  it('should return an empty array when primary_participants data is missing', () => {
    const webhook: ActionstepWebhook = {
      data: {
        relationships: {},
        type: 'actions',
        id: '123456',
      },
      jsonapi: { version: '1.0' },
      meta: {},
    }
    expect(getPrimaryParticipantIds(webhook)).toEqual([])
  })

  it('should return an array of primary participant IDs when data is an array', () => {
    const webhook: ActionstepWebhook = {
      data: {
        relationships: {
          primary_participants: {
            data: [
              { type: 'participants', id: '1' },
              { type: 'participants', id: '2' },
              { type: 'participants', id: '3' },
            ],
          },
        },
        type: 'actions',
        id: '123456',
      },
      jsonapi: { version: '1.0' },
      meta: {},
    }
    expect(getPrimaryParticipantIds(webhook)).toEqual([1, 2, 3])
  })

  it('should return an array with a single primary participant ID when data is not an array', () => {
    const webhook: ActionstepWebhook = {
      data: {
        relationships: {
          primary_participants: {
            data: { type: 'participants', id: '4' },
          },
        },
        type: 'actions',
        id: '123456',
      },
      jsonapi: { version: '1.0' },
      meta: {},
    }
    expect(getPrimaryParticipantIds(webhook)).toEqual([4])
  })
})
