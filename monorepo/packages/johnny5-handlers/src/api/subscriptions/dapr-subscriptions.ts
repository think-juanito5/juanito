import { daprSubscriptionSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia, t } from 'elysia'
import batchMatterCloseSubscriptions from './dapr-subscriptions.batch-matter-close'
import ccaEmailUnsubscribeSubscriptions from './dapr-subscriptions.cca-email-unsubscribe'
import ccaRaqDealSubscriptions from './dapr-subscriptions.cca-raq-deal'
import commonSubscriptions from './dapr-subscriptions.common'
import cronSubscriptions from './dapr-subscriptions.cron'
import v1BespokeTasksSubscriptions from './dapr-subscriptions.v1.bespoke-tasks'
import v1BtrContractDropSubscriptions from './dapr-subscriptions.v1.btr-contract-drop'
import v1BtrMatterOpeningSubscriptions from './dapr-subscriptions.v1.btr-matter-opening'
import v1BtrPexaAuditSubscriptions from './dapr-subscriptions.v1.btr-pexa-audit'
import v1BtrSdsMatterSubscriptions from './dapr-subscriptions.v1.btr-sds-matter'
import v1CcaDealMatterSubscriptions from './dapr-subscriptions.v1.cca-deal-matter'
import v1CcaOnMatterArchiveSubscriptions from './dapr-subscriptions.v1.cca-on-matter-archive'

export const daprSubscriptions = new Elysia().get(
  '/dapr/subscribe',
  () => [
    ...commonSubscriptions,
    ...cronSubscriptions,
    ...v1BtrMatterOpeningSubscriptions,
    ...v1BtrContractDropSubscriptions,
    ...batchMatterCloseSubscriptions,
    ...v1CcaDealMatterSubscriptions,
    ...ccaRaqDealSubscriptions,
    ...v1CcaOnMatterArchiveSubscriptions,
    ...v1BtrPexaAuditSubscriptions,
    ...ccaEmailUnsubscribeSubscriptions,
    ...v1BtrSdsMatterSubscriptions,
    ...v1BespokeTasksSubscriptions,
  ],
  {
    response: {
      200: t.Array(daprSubscriptionSchema),
    },
  },
)
