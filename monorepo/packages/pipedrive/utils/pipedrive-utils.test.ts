import { describe, expect, it } from 'bun:test'
import type { PipedriveWebhookV2 } from '@dbc-tech/pipedrive'
import { isDealStageChange } from './pipedrive-utils'

describe('pipedrive-utils', () => {
  describe('isDealStageChange', () => {
    it('should return false if meta.action is not "change"', () => {
      const webhook = {
        meta: { action: 'add', entity: 'deal' },
        data: { stage_id: 2 },
        previous: { stage_id: 1 },
      } as unknown as PipedriveWebhookV2
      expect(isDealStageChange(webhook)).toBe(false)
    })

    it('should return false if data.stage_id is missing', () => {
      const webhook = {
        meta: { action: 'change', entity: 'deal' },
        data: {},
        previous: { stage_id: 1 },
      } as unknown as PipedriveWebhookV2
      expect(isDealStageChange(webhook)).toBe(false)
    })

    it('should return false if previous is missing', () => {
      const webhook = {
        meta: { action: 'change', entity: 'deal' },
        data: { stage_id: 2 },
      } as unknown as PipedriveWebhookV2
      expect(isDealStageChange(webhook)).toBe(false)
    })

    it('should return false if previous.stage_id is missing', () => {
      const webhook = {
        meta: { action: 'change', entity: 'deal' },
        data: { stage_id: 2 },
        previous: {},
      } as unknown as PipedriveWebhookV2
      expect(isDealStageChange(webhook)).toBe(false)
    })

    it('should return false if previous.stage_id is null', () => {
      const webhook = {
        meta: { action: 'change', entity: 'deal' },
        data: { stage_id: 2 },
        previous: { stage_id: null },
      } as unknown as PipedriveWebhookV2
      expect(isDealStageChange(webhook)).toBe(false)
    })

    it('should return false if data.stage_id is the same as previous.stage_id', () => {
      const webhook = {
        meta: { action: 'change', entity: 'deal' },
        data: { stage_id: 1 },
        previous: { stage_id: 1 },
      } as unknown as PipedriveWebhookV2
      expect(isDealStageChange(webhook)).toBe(false)
    })

    it('should return true if action is "change" and stage_id differs', () => {
      const webhook = {
        meta: { action: 'change', entity: 'deal' },
        data: { stage_id: 2 },
        previous: { stage_id: 1 },
      } as unknown as PipedriveWebhookV2
      expect(isDealStageChange(webhook)).toBe(true)
    })
  })
})
