import { IsEmail, IsMobileNumber } from '@dbc-tech/johnny5'
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { FormatRegistry } from 'elysia/type-system'
import { serializeError } from 'serialize-error'
import { health } from './api/health'
import { logger } from './api/plugins/logger.plugin'
import { v1 } from './api/v1/v1'

// Load TypeBox formats into the registry to support string format validation eg. email: t.String({ format: 'email' }),
FormatRegistry.Set('email', (value) => IsEmail(value))
FormatRegistry.Set('mobile', (value) => IsMobileNumber(value))

const app = new Elysia({
  prefix: '/pac',
  serve: {
    idleTimeout: 60, // set idle timeout to 60 seconds
  },
})
  .use(logger)
  .onError(async ({ code, set, error, logger, path }) => {
    await logger.error('Unhandled error', {
      status: set.status,
      code,
      message: serializeError(error),
      path,
    })
  })
  .use(
    swagger({
      provider: 'scalar',
      documentation: {
        info: {
          title: 'PowerApps Connector',
          description:
            'This connector is used by Power Apps for integration with CCA Integration Services.',
          version: process.env.APP_VERSION || '1.0.0',
        },
      },
    }),
  )
  .use(health)
  .use(v1)
  .listen(process.env.PORT || 3000)

console.log(
  `🦊 Elysia is running Power Apps Connector version: ${process.env.APP_VERSION} at ${app.server?.hostname}:${app.server?.port}`,
)
