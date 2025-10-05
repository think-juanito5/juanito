import Elysia from 'elysia'
import { create } from './create'
import { update } from './update'

export const index = new Elysia({ prefix: '/btr-matter-opening' })
  .use(create)
  .use(update)
