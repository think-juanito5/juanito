import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'btr-pexa-audit-processing',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.btr-pexa-audit"',
          path: '/v1/btr-pexa-audit',
        },
        {
          match: 'event.type == "v1.btr-pexa-audit.audit-passed"',
          path: '/v1/btr-pexa-audit/audit-passed',
        },
        {
          match: 'event.type == "v1.btr-pexa-audit.audit-failed"',
          path: '/v1/btr-pexa-audit/audit-failed',
        },
        {
          match: 'event.type == "v1.btr-pexa-audit.subsequent-audit-start"',
          path: '/v1/btr-pexa-audit/subsequent-audit-start',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'btr-bad-message-queue',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
