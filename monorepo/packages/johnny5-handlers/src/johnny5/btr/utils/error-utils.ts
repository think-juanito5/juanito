import { HttpError } from '@dbc-tech/http'
import type { Logger } from '@dbc-tech/logger/logger'
import { serializeError } from 'serialize-error'
import { type SdsErrorCode, SdsErrorMessages } from '../constants'

interface JsonApiError {
  id?: string
  status?: number | string
  code?: string
  title?: string
  detail?: string
  source?: {
    pointer?: string
    parameter?: string
  }
}

export function isJsonApiError(obj: unknown): obj is JsonApiError {
  if (typeof obj !== 'object' || obj === null) return false
  const maybe = obj as Record<string, unknown>
  return (
    'detail' in maybe ||
    'title' in maybe ||
    'code' in maybe ||
    'status' in maybe
  )
}

export class NormalizedError {
  isHttpError: boolean
  status?: number
  code?: string
  title?: string
  detail?: string
  message: string
  displayMessage: string
  logMessage: string
  stack?: string
  raw: unknown

  private constructor(params: {
    isHttpError: boolean
    status?: number
    code?: string
    title?: string
    detail?: string
    message: string
    displayMessage: string
    logMessage: string
    stack?: string
    raw: unknown
  }) {
    this.isHttpError = params.isHttpError
    this.status = params.status
    this.code = params.code
    this.title = params.title
    this.detail = params.detail
    this.message = params.message
    this.displayMessage = params.displayMessage
    this.logMessage = params.logMessage
    this.stack = params.stack
    this.raw = params.raw
  }

  static from(err: unknown): NormalizedError {
    const tryParse = (text: string): unknown => {
      try {
        return JSON.parse(text)
      } catch {
        return null
      }
    }

    // Case 1: HttpError-like
    if (err instanceof HttpError && 'status' in err) {
      const parsed = tryParse(err.message)
      let structuredMessage: string

      if (parsed) {
        structuredMessage = this.formatStructured(parsed)
      } else {
        structuredMessage = err.message
      }

      return new NormalizedError({
        isHttpError: true,
        status: (err as { status?: number }).status,
        message: structuredMessage,
        displayMessage: structuredMessage,
        logMessage: `[${(err as { status?: number }).status ?? '?'}] ${structuredMessage}\nStack: ${
          err.stack ?? 'No stack'
        }`,
        stack: err.stack,
        raw: err,
      })
    }

    // Case 2: Generic Error
    if (err instanceof Error) {
      const parsed = tryParse(err.message)
      const structuredMessage = parsed
        ? this.formatStructured(parsed)
        : err.message

      return new NormalizedError({
        isHttpError: false,
        message: structuredMessage,
        displayMessage: structuredMessage,
        logMessage: `${err.name}: ${structuredMessage}\nStack: ${
          err.stack ?? 'No stack'
        }`,
        stack: err.stack,
        raw: err,
      })
    }

    // Case 3: Non-Error throw
    let message: string
    if (typeof err === 'string') {
      const parsed = tryParse(err)
      message = parsed ? this.formatStructured(parsed) : err
    } else if (err && typeof err === 'object') {
      message = this.formatStructured(err)
    } else {
      message = String(err)
    }

    return new NormalizedError({
      isHttpError: false,
      message,
      displayMessage: message,
      logMessage: message,
      raw: err,
    })
  }

  private static formatStructured(obj: unknown, indent = 0): string {
    if (obj === null || typeof obj !== 'object') {
      return String(obj)
    }

    const spaces = '  '.repeat(indent)

    return Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          return `${spaces}${k}:\n${this.formatStructured(v, indent + 1)}`
        }
        if (Array.isArray(v)) {
          return `${spaces}${k}:\n${v
            .map((item) => this.formatStructured(item, indent + 1))
            .join('\n')}`
        }
        return `${spaces}- ${k}: ${String(v)}`
      })
      .join('\n')
  }
}

export class BaseAppError extends Error {
  constructor(
    public message: string,
    public errorCode: string,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// Specific error
export class SdsAppError extends BaseAppError {}

// Type guard: checks for any app error
export function isSdsAppError(error: unknown): error is SdsAppError {
  return error instanceof SdsAppError
}

export function getErrorConfig(code: SdsErrorCode) {
  return SdsErrorMessages[code] || SdsErrorMessages.INTERNAL_ERROR
}

export function generateSdsFilenote(
  error: BaseAppError,
  timestamp: Date = new Date(),
): string {
  const auDateTime = new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric', // → yyyy
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Australia/Sydney',
  }).format(timestamp)

  const config = getErrorConfig(error.errorCode as SdsErrorCode)

  return (
    `Website Submission Update — ${auDateTime}\n` +
    `Issue: ${config.userMessage}\n` +
    `Reference Code: ${error.errorCode}`
  )
}

export async function handleSdsAppError(
  msg: string,
  error: unknown,
  fileId: string,
  jobId: string,
  logger: Logger,
): Promise<{ filenoteMessage: string }> {
  let logMessage: string
  let filenoteMessage: string

  if (isSdsAppError(error)) {
    logMessage = `SDS App Error: ${error.message} Code: ${error.errorCode}`
    filenoteMessage = generateSdsFilenote(error)
  } else {
    logMessage = `Unexpected ${msg} for File Id: ${fileId}, Job Id: ${jobId}`
    await logger.error(logMessage, serializeError(error))

    const normalized = NormalizedError.from(error)
    filenoteMessage = `${msg}: ${normalized.displayMessage}`
    if (normalized.stack) {
      filenoteMessage += `\n\nStack: ${normalized.stack}`
    }
    logMessage += ` | ${normalized.displayMessage}`
  }
  await logger.error(logMessage)
  return { filenoteMessage }
}
