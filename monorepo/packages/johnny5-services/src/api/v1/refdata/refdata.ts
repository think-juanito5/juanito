import { Elysia } from 'elysia'
import { configs } from './config'
import { contractData } from './contract-data'
import { participants } from './participants'
import { typeform } from './typeform'

export const refdata = new Elysia({ prefix: '/refdata' })
  .use(participants)
  .use(contractData)
  .use(configs)
  .use(typeform)
