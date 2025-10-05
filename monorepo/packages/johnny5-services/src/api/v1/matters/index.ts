import { Elysia } from 'elysia'
import { btr_matter_payment } from './btr-payments'
import {
  close_matter,
  deactivate_matter,
  reactivate_matter,
} from './matter-activations'
import { cca_matter_name_refresh } from './matter-name-refresh'
import { cca_matter_payment } from './matter-payment'
import { cca_matter_trustpilot_link } from './matter-trustpilot-link'
import { cca_conveyancing_payment } from './matter.conveyancing-payment'
import { cca_raqs } from './matters.cca-raqs'
import { tasks } from './tasks'

export const matters = new Elysia({
  prefix: '/matters',
})
  .use(close_matter)
  .use(cca_raqs)
  .use(deactivate_matter)
  .use(reactivate_matter)
  .use(tasks)
  .use(cca_matter_name_refresh)
  .use(cca_matter_trustpilot_link)
  .use(cca_matter_payment)
  .use(cca_conveyancing_payment)
  .use(btr_matter_payment)
