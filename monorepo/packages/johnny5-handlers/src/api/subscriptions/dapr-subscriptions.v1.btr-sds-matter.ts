import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'johnny5-btr-sds-matter',
    routes: {
      rules: [
        {
          match: 'event.type == "v1.btr-sds-matter.start"',
          path: '/v1/btr-sds-matter/start',
        },
        {
          match: 'event.type == "v1.btr-sds-matter.create"',
          path: '/v1/btr-sds-matter/create',
        },
        {
          match: 'event.type == "v1.btr-sds-matter.manifest-create"',
          path: '/v1/btr-sds-matter/manifest-create',
        },
        {
          match: 'event.type == "v1.btr-sds-matter.populate-participants"',
          path: '/v1/btr-sds-matter/populate-participants',
        },
        {
          match: 'event.type == "v1.btr-sds-matter.populate-data-collections"',
          path: '/v1/btr-sds-matter/populate-data-collections',
        },
        {
          match: 'event.type == "v1.btr-sds-matter.populate-filenotes"',
          path: '/v1/btr-sds-matter/populate-filenotes',
        },
        {
          match: 'event.type == "v1.btr-sds-matter.populate-files"',
          path: '/v1/btr-sds-matter/populate-files',
        },
        {
          match: 'event.type == "v1.btr-sds-matter.populate-stepchange"',
          path: '/v1/btr-sds-matter/populate-stepchange',
        },
      ],
      default: '/v1/default',
    },
    deadLetterTopic: 'johnny5-undelivered',
  },
]
export default subscriptions
