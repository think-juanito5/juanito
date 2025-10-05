import Elysia from 'elysia'
import { default_handler } from './default'
import { job_status_updated } from './job-status-updated/job-status-updated'
import { send_email } from './send-email'
import { undelivered_handler } from './undelivered'

export const common = new Elysia()
  .use(default_handler)
  .use(job_status_updated)
  .use(send_email)
  .use(undelivered_handler)
