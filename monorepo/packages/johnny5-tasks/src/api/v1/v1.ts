import Elysia from 'elysia'
import { common } from './common/common'
import { v1_actionstep_matter_activations } from './v1.actionstep-matter-activations'
import { v1_actionstep_matter_name_refresh } from './v1.actionstep-matter-name-refresh'
import { v1_actionstep_matter_payment } from './v1.actionstep-matter-payment'
import { v1_actionstep_matter_trustpilot_link } from './v1.actionstep-matter-trustpilot-link'
import { v1_btr_sds_agent_register } from './v1.btr-sds-agent-register'
import { v1_pipedrive_lost_unsubscribe } from './v1.pipedrive-lost-unsubscribe'
import { v1_pipedrive_marketing_status_archive } from './v1.pipedrive-marketing-status'
import { v1_quote_completed } from './v1.quote-completed'

export const v1 = new Elysia({ prefix: '/v1' })
  .use(common)
  .use(v1_actionstep_matter_activations)
  .use(v1_actionstep_matter_name_refresh)
  .use(v1_actionstep_matter_trustpilot_link)
  .use(v1_btr_sds_agent_register)
  .use(v1_quote_completed)
  .use(v1_pipedrive_marketing_status_archive)
  .use(v1_pipedrive_lost_unsubscribe)
  .use(v1_actionstep_matter_payment)
