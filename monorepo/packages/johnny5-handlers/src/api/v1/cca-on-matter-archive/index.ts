import Elysia from 'elysia'
import { start } from './start'

export const index = new Elysia({ prefix: '/cca-on-matter-archive' }).use(start)
