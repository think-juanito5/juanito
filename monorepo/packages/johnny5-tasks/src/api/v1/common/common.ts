import Elysia from 'elysia'
import { default_handler } from './default'
import { send_email } from './send-email'
import { task_status_updated } from './task-status-updated/task-status-updated'

export const common = new Elysia()
  .use(default_handler)
  .use(task_status_updated)
  .use(send_email)
