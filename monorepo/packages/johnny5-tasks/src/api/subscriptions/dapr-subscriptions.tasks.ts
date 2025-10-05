import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.queues,
    topic: 'johnny5-tasks',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.actionstep-matter-activations"',
          path: '/v1/actionstep-matter-activations',
        },
        {
          match: 'event.type == "v1.actionstep-matter-name-refresh"',
          path: '/v1/actionstep-matter-name-refresh',
        },
        {
          match: 'event.type == "v1.actionstep-matter-trustpilot-link"',
          path: '/v1/actionstep-matter-trustpilot-link',
        },
        {
          match: 'event.type == "v1.btr-pexa-audit"',
          path: '/v1/btr-pexa-audit',
        },
        {
          match: 'event.type == "v1.process-btr-pexa-audit"',
          path: '/v1/process-btr-pexa-audit',
        },
        {
          match: 'event.type == "v1.send-email"',
          path: '/v1/send-email',
        },
        {
          match: 'event.type == "v1.quote-contract-updated"',
          path: '/v1/quote-contract-updated',
        },
        {
          match: 'event.type == "v1.quote-plan-selected"',
          path: '/v1/quote-plan-selected',
        },
        {
          match: 'event.type == "v1.pipedrive-marketing-status-archive"',
          path: '/v1/pipedrive-marketing-status-archive',
        },
        {
          match: 'event.type == "v1.quote-completed"',
          path: '/v1/quote-completed',
        },
        {
          match: 'event.type == "v1.pipedrive-lost-unsubscribe"',
          path: '/v1/pipedrive-lost-unsubscribe',
        },
        {
          match: 'event.type == "v1.btr-sds-agent-register"',
          path: '/v1/btr-sds-agent-register',
        },
        {
          match: 'event.type == "v1.actionstep-matter-payment"',
          path: '/v1/actionstep-matter-payment',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
