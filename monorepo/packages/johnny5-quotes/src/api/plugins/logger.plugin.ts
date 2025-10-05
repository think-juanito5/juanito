import { ConsoleLogger } from '@dbc-tech/logger'
import { Elysia } from 'elysia'

export const logger = new Elysia().decorate('logger', ConsoleLogger())
