import Elysia from 'elysia'
import { process_additional_tables } from './process-additional-tables'
import { process_lead } from './process-lead'
import { publish_pipedrive } from './publish-pipedrive'
import { start } from './start'

export const index = new Elysia({ prefix: '/cca-raq-deal' })
  .use(start)
  .use(process_lead)
  .use(process_additional_tables)
  .use(publish_pipedrive)
