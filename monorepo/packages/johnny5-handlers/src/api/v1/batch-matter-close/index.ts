import Elysia from 'elysia'
import { start } from './start'

export const index = new Elysia({ prefix: '/batch-matter-close' }).use(start)
