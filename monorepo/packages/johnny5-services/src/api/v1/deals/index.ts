import { Elysia } from 'elysia'
import { cca_raqs } from './deals.cca-raqs'
import { cca_pipedrive_notification } from './deals.filenotes-notification'
import { deals_lost_unsubscribe } from './deals.lost-unsubscribe'
import { deals_person_marketing_status_archive } from './deals.person-marketing-status-archive'
export const deals = new Elysia({
  prefix: '/deals',
})
  .use(cca_raqs)
  .use(deals_person_marketing_status_archive)
  .use(deals_lost_unsubscribe)
  .use(cca_pipedrive_notification)
