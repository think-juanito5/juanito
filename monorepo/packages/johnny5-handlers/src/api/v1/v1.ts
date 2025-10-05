import Elysia from 'elysia'
import { index as batch_matter_close } from './batch-matter-close'
import { index as bespoke_tasks } from './bespoke-tasks'
import { index as btr_contract_drop } from './btr-contract-drop'
import { index as btr_matter_opening } from './btr-matter-opening'
import { index as btr_pexa_audit } from './btr-pexa-audit'
import { index as btr_sds_matter } from './btr-sds-matter'
import { index as cca_deal_matter } from './cca-deal-matter'
import { index as cca_email_unsubscribe } from './cca-email-unsubscribe'
import { index as cca_on_matter_archive } from './cca-on-matter-archive'
import { index as cca_raq_deal } from './cca-raq-deal'
import { common } from './common/common'
import { index as stale_matter_cleanup } from './stale-matter-cleanup'

export const v1 = new Elysia({ prefix: '/v1' })
  .use(btr_contract_drop)
  .use(btr_matter_opening)
  .use(batch_matter_close)
  .use(cca_deal_matter)
  .use(common)
  .use(stale_matter_cleanup)
  .use(cca_raq_deal)
  .use(cca_on_matter_archive)
  .use(btr_pexa_audit)
  .use(cca_email_unsubscribe)
  .use(btr_sds_matter)
  .use(bespoke_tasks)
