import {
  ConsoleContextLogger,
  type LoggerConfig,
} from '@dbc-tech/logger/context-logger'
import { Elysia } from 'elysia'

export const logger = (config: LoggerConfig) =>
  new Elysia().decorate('logger', ConsoleContextLogger(config))
