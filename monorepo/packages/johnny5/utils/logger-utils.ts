import type { Logger } from '@dbc-tech/logger'

export const errorMissingJ5Config = (logger: Logger, j5ConfigKey: string) =>
  logger.error(
    `Missing J5Config key: ${j5ConfigKey}. Please check your configuration.`,
  )
