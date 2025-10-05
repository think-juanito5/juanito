import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-cca-deal-matter',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.cca-deal-matter.start"',
          path: '/v1/cca-deal-matter/start',
        },
        {
          match: 'event.type == "v1.cca-deal-matter.create"',
          path: '/v1/cca-deal-matter/create',
        },
        {
          match: 'event.type == "v1.cca-deal-matter.manifest-create"',
          path: '/v1/cca-deal-matter/manifest-create',
        },
        {
          match: 'event.type == "v1.cca-deal-matter.populate-participants"',
          path: '/v1/cca-deal-matter/populate-participants',
        },
        {
          match: 'event.type == "v1.cca-deal-matter.populate-data-collections"',
          path: '/v1/cca-deal-matter/populate-data-collections',
        },
        {
          match: 'event.type == "v1.cca-deal-matter.populate-filenotes"',
          path: '/v1/cca-deal-matter/populate-filenotes',
        },
        {
          match: 'event.type == "v1.cca-deal-matter.populate-files"',
          path: '/v1/cca-deal-matter/populate-files',
        },
        {
          match: 'event.type == "v1.cca-deal-matter.populate-stepchange"',
          path: '/v1/cca-deal-matter/populate-stepchange',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
  },
]

export default subscriptions
