/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Logger {
  log: (message: string, ...args: unknown[]) => Promise<void>
  error: (message: string, ...args: unknown[]) => Promise<void>
  warn: (message: string, ...args: unknown[]) => Promise<void>
  info: (message: string, ...args: unknown[]) => Promise<void>
  debug: (message: string, ...args: unknown[]) => Promise<void>
  trace: (message: string, ...args: unknown[]) => Promise<void>
}

export const ConsoleLogger = (
  logLevel: string = process.env.LOG_LEVEL || 'info',
): Logger => {
  return {
    log: async (message: string, ...args: unknown[]) => {
      if (['info', 'debug', 'trace'].includes(logLevel)) {
        console.info(buildMessage(message, ...args))
      }
    },
    trace: async (message: string, ...args: unknown[]) => {
      if (['trace'].includes(logLevel)) {
        console.trace(buildMessage(message, ...args))
      }
    },
    debug: async (message: string, ...args: unknown[]) => {
      if (['debug', 'trace'].includes(logLevel)) {
        console.debug(buildMessage(message, ...args))
      }
    },
    info: async (message: string, ...args: unknown[]) => {
      if (['info', 'debug', 'trace'].includes(logLevel)) {
        console.info(buildMessage(message, ...args))
      }
    },
    warn: async (message: string, ...args: unknown[]) => {
      if (['warn', 'info', 'debug', 'trace'].includes(logLevel)) {
        console.warn(buildMessage(message, ...args))
      }
    },
    error: async (message: string, ...args: unknown[]) => {
      console.error(buildMessage(message, ...args))
    },
  }
}

export const buildMessage = (message: string, ...args: unknown[]): string => {
  if (!args) return message

  let log = message
  for (const arg of args) {
    log += ` ${JSON.stringify(arg)}`
  }
  return log
}

export const NullLogger = (): Logger => {
  return {
    log: (message: string, ...args: unknown[]) => nop(message, ...args),
    error: (message: string, ...args: unknown[]) => nop(message, ...args),
    warn: (message: string, ...args: unknown[]) => nop(message, ...args),
    info: (message: string, ...args: unknown[]) => nop(message, ...args),
    debug: (message: string, ...args: unknown[]) => nop(message, ...args),
    trace: (message: string, ...args: unknown[]) => nop(message, ...args),
  }
}

const nop = (_message: string, ..._args: unknown[]): Promise<void> => {
  return Promise.resolve()
}
