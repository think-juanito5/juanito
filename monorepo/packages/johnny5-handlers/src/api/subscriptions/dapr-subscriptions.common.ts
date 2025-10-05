import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.send-email"',
          path: '/v1/send-email',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
    metadata: { rawPayload: 'false' },
  },
  {
    pubsubname: component.topics,
    topic: 'johnny5-events',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.job-status-updated"',
          path: '/v1/job-status-updated',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-events-undelivered',
    metadata: { rawPayload: 'false' },
  },
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-undelivered',
    route: '/v1/undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
