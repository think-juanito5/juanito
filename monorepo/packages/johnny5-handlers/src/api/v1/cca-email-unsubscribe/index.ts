import Elysia from 'elysia'
import { actionstep_update } from './actionstep-update'
import { pipedrive_update } from './pipedrive-update'
import { start } from './start'

export const index = new Elysia({ prefix: '/cca-email-unsubscribe' })
  .use(start)
  .use(pipedrive_update)
  .use(actionstep_update)
