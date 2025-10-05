import type { Logger } from '@dbc-tech/logger'
import { serializeError } from 'serialize-error'

export const safeExecuteFn = async <T>(
  run: () => Promise<T | undefined>,
  logger: Logger,
  ignoreOn?: (error: unknown) => boolean,
) => {
  try {
    return await run()
  } catch (error) {
    const errorJson = serializeError(error)
    if (!ignoreOn) {
      logger.warn('[safeExecuteFn] Error ignored', errorJson)
      return undefined
    }
    if (ignoreOn(error)) {
      logger.error('[safeExecuteFn] Error conditionally ignored', errorJson)
      return undefined
    }
    throw error
  }
}
