import type { DaprResponseSchema } from '@dbc-tech/johnny5/dapr'

export const publish = <T extends Record<string, unknown>>(
  pubsub: string,
  topicOrQueue: string,
  message: T,
  rawPayload: boolean = true,
) => {
  return fetch(
    `http://localhost:3500/v1.0/publish/${pubsub}/${topicOrQueue}${rawPayload ? '?metadata.rawPayload=true' : ''}`,
    {
      method: 'POST',
      body: JSON.stringify(message),
    },
  )
}

export const daprSuccess: DaprResponseSchema = { status: 'SUCCESS' }
