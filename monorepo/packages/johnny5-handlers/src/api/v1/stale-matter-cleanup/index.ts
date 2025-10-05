import Elysia from 'elysia'
import { start } from './start'

export const index = new Elysia({ prefix: '/stale-matter-cleanup' }).use(start)
