import { Elysia } from 'elysia'
import { pricing } from './pricing/pricing'

export const v2 = new Elysia({
  prefix: '/v2',
}).use(pricing)
