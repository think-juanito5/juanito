import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-cca-email-unsubscribe',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.cca-email-unsubscribe"',
          path: '/v1/cca-email-unsubscribe',
        },
        {
          match: 'event.type == "v1.cca-email-unsubscribe.pipedrive-update"',
          path: '/v1/cca-email-unsubscribe/pipedrive-update',
        },
        {
          match: 'event.type == "v1.cca-email-unsubscribe.actionstep-update"',
          path: '/v1/cca-email-unsubscribe/actionstep-update',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
