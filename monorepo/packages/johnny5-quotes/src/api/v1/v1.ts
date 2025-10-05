import { Elysia } from 'elysia'
import { quotes } from './v1.quotes'

export const v1 = new Elysia({
  prefix: '/v1',
}).use(quotes)
