import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-btr-matter-opening',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.btr-matter-opening"',
          path: '/v1/btr-matter-opening',
        },
        {
          match: 'event.type == "v1.btr-matter-opening.update"',
          path: '/v1/btr-matter-opening/update',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
