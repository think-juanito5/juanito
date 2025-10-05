import { IsEmail, IsMobileNumber } from '@dbc-tech/johnny5/utils/formats'
import swagger from '@elysiajs/swagger'
import { FormatRegistry } from '@sinclair/typebox'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { health } from './api/health'
import { logger } from './api/plugins/logger.plugin'
import { mongodb } from './api/plugins/mongodb.plugin'
import { v1 } from './api/v1/v1'
import { v2 } from './api/v2/v2'

// Load TypeBox formats into the registry to support string format validation eg. email: t.String({ format: 'email' }),
FormatRegistry.Set('email', (value) => IsEmail(value))
FormatRegistry.Set('mobile', (value) => IsMobileNumber(value))

const app = new Elysia({
  prefix: '/johnny5',
  serve: {
    idleTimeout: 60, // set idle timeout to 60 seconds
  },
})
  .use(logger)
  .onError(async ({ code, set, error, logger }) => {
    await logger.error('Unhandled error', {
      status: set.status,
      code,
      error: serializeError(error),
    })
  })
  .use(
    swagger({
      provider: 'scalar',
      documentation: {
        info: {
          title: 'Johnny5 Services',
          description: 'Johnny5 Services API endpoints.',
          version: process.env.APP_VERSION || '1.0.0',
        },
      },
    }),
  )
  .use(health)
  .use(mongodb)
  .use(v1)
  .use(v2)
  .listen(process.env.PORT || 3000)

console.log(
  `🦊 Elysia is running Johnny5 Services version: ${process.env.APP_VERSION} at ${app.server?.hostname}:${app.server?.port}`,
)

export type App = typeof app
