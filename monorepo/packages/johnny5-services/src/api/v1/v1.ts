import { Elysia } from 'elysia'
import { cca_raqs } from './cca-raqs'
import { deals } from './deals'
import { files } from './files/files'
import { jobs } from './jobs/jobs'
import { matters } from './matters'
import { cca_matter_name_refresh } from './matters/matter-name-refresh'
import { pricing } from './pricing/pricing'
import { quotes } from './quotes/quotes'
import { refdata } from './refdata/refdata'
import { tasks } from './tasks/tasks'
import { batch_matter_close } from './v1.batch-matter-close'
import { bespoke_tasks } from './v1.bespoke-tasks'
import { btr_contract_drop } from './v1.btr-contract-drop'
import { btr_matter_opening } from './v1.btr-matter-opening'
import { btr_sds_agent_register } from './v1.btr-sds-agent-register'
import { btr_sds_matter_create } from './v1.btr-sds-matter-create'
import { cca_deal_matter } from './v1.cca-deal-matter'
import { cca_email_unsubscribe } from './v1.cca-email-unsubscribe'
import { cca_on_matter_archive } from './v1.cca-on-matter-archive'
import { stale_matter_cleanup } from './v1.stale-matter-cleanup'

export const v1 = new Elysia({
  prefix: '/v1',
})
  .use(deals)
  .use(files)
  .use(jobs)
  .use(matters)
  .use(refdata)
  .use(batch_matter_close)
  .use(btr_matter_opening)
  .use(btr_sds_agent_register)
  .use(btr_sds_matter_create)
  .use(btr_contract_drop)
  .use(cca_raqs)
  .use(cca_deal_matter)
  .use(cca_on_matter_archive)
  .use(stale_matter_cleanup)
  .use(cca_matter_name_refresh)
  .use(pricing)
  .use(quotes)
  .use(tasks)
  .use(cca_email_unsubscribe)
  .use(bespoke_tasks)
  .use(btr_sds_matter_create)
