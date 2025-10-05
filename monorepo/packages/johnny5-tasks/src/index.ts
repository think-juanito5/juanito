import { IsEmail, IsMobileNumber } from '@dbc-tech/johnny5/utils'
import { FormatRegistry } from '@sinclair/typebox'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { health } from './api/health'
import { logger } from './api/plugins/logger.plugin'
import { mongodb } from './api/plugins/mongodb.plugin'
import { daprSubscriptions } from './api/subscriptions/dapr-subscriptions'
import { v1 } from './api/v1/v1'

// Load TypeBox formats into the registry to support string format validation eg. email: t.String({ format: 'email' }),
FormatRegistry.Set('email', (value) => IsEmail(value))
FormatRegistry.Set('mobile', (value) => IsMobileNumber(value))

const app = new Elysia()
  .use(logger)
  .onError(async ({ code, set, error, request, logger }) => {
    const status = 'status' in error ? error.status : set.status
    await logger.error('Unhandled error', {
      url: request.url,
      status,
      code,
      error: serializeError(error),
    })
  })
  .use(health)
  .use(daprSubscriptions)
  .use(mongodb)
  .use(v1)
  .listen(3000)

console.log(
  `🦊 Elysia is running Johnny5 Tasks version: ${process.env.APP_VERSION} at ${app.server?.hostname}:${app.server?.port}`,
)
