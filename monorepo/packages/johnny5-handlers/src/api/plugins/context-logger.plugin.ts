import {
  ConsoleContextLogger,
  type LoggerConfig,
} from '@dbc-tech/logger/context-logger'
import { Elysia } from 'elysia'

export const contextLogger = (config: LoggerConfig) =>
  new Elysia({}).derive(
    {
      as: 'global',
    },
    () => {
      const contextLogger = ConsoleContextLogger(config)
      return {
        contextLogger,
      }
    },
  )
