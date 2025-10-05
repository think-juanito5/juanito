import { lostReason } from '../constants'
import type { PipedriveWebhookV2 } from '../types'

export const isDealStageChange = (webhook: PipedriveWebhookV2) => {
  const isTruthy = (value: unknown) => !!value
  const isStageChange =
    webhook.meta.entity === 'deal' &&
    webhook.meta.action === 'change' &&
    isTruthy(webhook.data.stage_id) &&
    isTruthy(webhook.previous?.stage_id) &&
    webhook.data.stage_id !== webhook.previous?.stage_id

  return isStageChange
}

export const isDealStatusLostUnsubscribe = (webhook: PipedriveWebhookV2) => {
  const isTruthy = (value: unknown) => !!value
  const isStatusLostUnsubscribe =
    webhook.meta.entity === 'deal' &&
    webhook.data.status === 'lost' &&
    webhook.previous?.status !== 'lost' &&
    webhook.data.lost_reason === lostReason.doNotCall &&
    isTruthy(webhook.previous?.status)

  return isStatusLostUnsubscribe
}
