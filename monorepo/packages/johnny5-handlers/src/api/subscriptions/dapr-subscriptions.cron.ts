import { type DaprSubscription, component } from '@dbc-tech/johnny5/dapr'

const subscriptions: DaprSubscription[] = [
  {
    pubsubname: component.longQueues,
    topic: 'cca-actionstep-stale-matter-cleanup',
    route: '/v1/stale-matter-cleanup',
  },
]

export default subscriptions
