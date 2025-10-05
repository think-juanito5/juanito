import { daprSubscriptionSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia, t } from 'elysia'
import commonSubscriptions from './dapr-subscriptions.common'
import taskSubscriptions from './dapr-subscriptions.tasks'

export const daprSubscriptions = new Elysia().get(
  '/dapr/subscribe',
  () => [...commonSubscriptions, ...taskSubscriptions],
  {
    response: {
      200: t.Array(daprSubscriptionSchema),
    },
  },
)
