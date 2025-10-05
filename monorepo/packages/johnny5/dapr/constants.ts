import type { DaprResponseSchema } from './dapr-subscription.schema'

export const dapr: Record<string, DaprResponseSchema> = {
  drop: { status: 'DROP' },
  retry: { status: 'RETRY' },
  success: { status: 'SUCCESS' },
} as const

export const component = {
  queues: 'j5-asb-queues',
  longQueues: 'j5-asb-long-queues',
  topics: 'j5-asb-topics',
}
