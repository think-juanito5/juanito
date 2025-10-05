import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-cca-raq-deal',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.cca-raq-deal"',
          path: '/v1/cca-raq-deal',
        },
        {
          match: 'event.type == "v1.cca-raq-deal.process-lead"',
          path: '/v1/cca-raq-deal/process-lead',
        },
        {
          match: 'event.type == "v1.cca-raq-deal.process-additional-tables"',
          path: '/v1/cca-raq-deal/process-additional-tables',
        },
        {
          match: 'event.type == "v1.cca-raq-deal.publish-pipedrive"',
          path: '/v1/cca-raq-deal/publish-pipedrive',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
