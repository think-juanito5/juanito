import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-cca-on-matter-archive',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.cca-on-matter-archive"',
          path: '/v1/cca-on-matter-archive',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
