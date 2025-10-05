import { nanoid } from 'nanoid'
import type { Logger } from './logger'

export type LoggerConfig = {
  logLevel?: string
  correlationId?: string
  name?: string
  tenant?: string
}

export interface ContextLogger extends Logger {
  correlationId: string
  name: string
  tenant?: string
}

export const ConsoleContextLogger = (config: LoggerConfig): ContextLogger => {
  const logLevel = config.logLevel || process.env.LOG_LEVEL || 'info'
  const correlationId = config.correlationId || nanoid(10)
  const name = config.name || ''
  const tenant = config.tenant || ''

  return {
    log: (message: string, ...args: unknown[]) => {
      if (['info', 'debug', 'trace'].includes(logLevel!)) {
        console.info(
          buildContextMessage(
            correlationId,
            name,
            tenant,
            'INF',
            message,
            ...args,
          ),
        )
      }
      return Promise.resolve()
    },
    trace: (message: string, ...args: unknown[]) => {
      if (['trace'].includes(logLevel)) {
        console.trace(
          buildContextMessage(
            correlationId,
            name,
            tenant,
            'TRA',
            message,
            ...args,
          ),
        )
      }
      return Promise.resolve()
    },
    debug: (message: string, ...args: unknown[]) => {
      if (['debug', 'trace'].includes(logLevel)) {
        console.debug(
          buildContextMessage(
            correlationId,
            name,
            tenant,
            'DBG',
            message,
            ...args,
          ),
        )
      }
      return Promise.resolve()
    },
    info: (message: string, ...args: unknown[]) => {
      if (['info', 'debug', 'trace'].includes(logLevel)) {
        console.info(
          buildContextMessage(
            correlationId,
            name,
            tenant,
            'INF',
            message,
            ...args,
          ),
        )
      }
      return Promise.resolve()
    },
    warn: (message: string, ...args: unknown[]) => {
      if (['warn', 'info', 'debug', 'trace'].includes(logLevel)) {
        console.warn(
          buildContextMessage(
            correlationId,
            name,
            tenant,
            'WRN',
            message,
            ...args,
          ),
        )
      }
      return Promise.resolve()
    },
    error: (message: string, ...args: unknown[]) => {
      console.error(
        buildContextMessage(
          correlationId,
          name,
          tenant,
          'ERR',
          message,
          ...args,
        ),
      )
      return Promise.resolve()
    },
    correlationId,
    name,
  }
}

export const buildContextMessage = (
  correlationId: string,
  name: string | undefined,
  tenant: string | undefined,
  level: 'TRA' | 'DBG' | 'INF' | 'WRN' | 'ERR',
  message: string,
  ...args: unknown[]
): string => {
  let template = `${correlationId} ${tenant ? `${tenant} ` : ''}${name ? `${name} ` : ''}${level} ${message}`
  if (!args) return template

  for (const arg of args) {
    template += ` ${JSON.stringify(arg)}`
  }
  return template
}
