import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-bespoke-tasks',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.bespoke-tasks"',
          path: '/v1/bespoke-tasks',
        },
        {
          match: 'event.type == "v1.bespoke-tasks.manifest-create"',
          path: '/v1/bespoke-tasks/manifest-create',
        },
        {
          match: 'event.type == "v1.bespoke-tasks.matter-complete-tasks"',
          path: '/v1/bespoke-tasks/matter-complete-tasks',
        },
        {
          match: 'event.type == "v1.bespoke-tasks.matter-populate-data-fields"',
          path: '/v1/bespoke-tasks/matter-populate-data-fields',
        },
        {
          match: 'event.type == "v1.bespoke-tasks.matter-upload-files"',
          path: '/v1/bespoke-tasks/matter-upload-files',
        },
        {
          match: 'event.type == "v1.bespoke-tasks.matter-create-tasks"',
          path: '/v1/bespoke-tasks/matter-create-tasks',
        },
        {
          match: 'event.type == "v1.bespoke-tasks.matter-populate-filenotes"',
          path: '/v1/bespoke-tasks/matter-populate-filenotes',
        },
        {
          match: 'event.type == "v1.bespoke-tasks.matter-send-emails"',
          path: '/v1/bespoke-tasks/matter-send-emails',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
    metadata: { rawPayload: 'false' },
  },
]

export default subscriptions
