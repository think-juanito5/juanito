import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.topics,
    topic: 'johnny5-task-events',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.task-status-updated"',
          path: '/v1/task-status-updated',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-task-events-undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
