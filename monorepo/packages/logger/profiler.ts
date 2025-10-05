import type { Logger } from './logger'

export const profileFn = async <T>(
  run: () => Promise<T>,
  logger: Logger,
  name?: string,
) => {
  const start = performance.now()
  const result = await run()
  const profileName = name || run.name
  await logger.debug(
    `${profileName ? profileName : 'function'} took ${(performance.now() - start).toFixed(3)}ms`,
  )
  return result
}
