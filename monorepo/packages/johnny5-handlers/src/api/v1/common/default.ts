import {
  component,
  dapr,
  publish,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const default_handler = new Elysia()
  .use(appContext({ name: 'v1.default' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/default',
    async ({ body, ctx }) => {
      const { logger } = ctx

      await logger.debug(`Publishing message to undelivered queue`, body)

      await publish({
        pubsub: component.longQueues,
        topicOrQueue: 'johnny5-undelivered',
        message: body,
        logger,
        correlationId: ctx.correlationId,
      })

      return dapr.success
    },
    {
      body: t.Object({}, { additionalProperties: true }),
      response: {
        200: daprResponseSchema,
      },
    },
  )
