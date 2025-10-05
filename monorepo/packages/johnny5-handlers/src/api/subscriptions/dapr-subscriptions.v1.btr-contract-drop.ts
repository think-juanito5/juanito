import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-btr-contract-drop',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.btr-contract-drop"',
          path: '/v1/btr-contract-drop',
        },
        {
          match: 'event.type == "v1.btr-contract-drop.manifest-create"',
          path: '/v1/btr-contract-drop/manifest-create',
        },
        {
          match:
            'event.type == "v1.btr-contract-drop.matter-populate-participants"',
          path: '/v1/btr-contract-drop/matter-populate-participants',
        },
        {
          match:
            'event.type == "v1.btr-contract-drop.matter-populate-data-collections"',
          path: '/v1/btr-contract-drop/matter-populate-data-collections',
        },
        {
          match:
            'event.type == "v1.btr-contract-drop.matter-populate-filenotes"',
          path: '/v1/btr-contract-drop/matter-populate-filenotes',
        },
        {
          match: 'event.type == "v1.btr-contract-drop.matter-populate-tasks"',
          path: '/v1/btr-contract-drop/matter-populate-tasks',
        },
        {
          match: 'event.type == "v1.btr-contract-drop.matter-populate-files"',
          path: '/v1/btr-contract-drop/matter-populate-files',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
