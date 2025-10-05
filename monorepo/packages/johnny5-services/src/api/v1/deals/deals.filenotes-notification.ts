import { ccaPipedriveNotificationSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { serializeError } from 'serialize-error'
import { appContext } from '../../plugins/app-context.plugin'
import { filenotePipedriveSvc } from '../../plugins/filenotes-pipedrive.plugin'

export const cca_pipedrive_notification = new Elysia()
  .use(
    appContext({
      allowedTenants: ['CCA'],
    }),
  )
  .use(filenotePipedriveSvc)

  .post(
    '/:dealId/prepared-notification',
    async ({ body, params: { dealId }, ctx, status, filenotePipedrive }) => {
      const { logger } = ctx

      await logger.info(
        `Starting CCA Pipedrive Notification for Deal:${dealId}`,
      )
      await logger.debug(`Request payload`, body)

      try {
        await filenotePipedrive
          .deal(dealId)
          .notify(body.type)
          .handleErrorProperty()
          .exec()

        await logger.info(
          `Finished CCA Pipedrive Notification for Deal:${dealId}`,
        )
        return status(204, null)
      } catch (e) {
        const errMsg = serializeError(e)
        await logger.error(
          `Error processing CCA Pipedrive Notification for Deal:${dealId}. Error: `,
          errMsg,
        )
        return status(400, JSON.stringify(errMsg, null, 2))
      }
    },
    {
      body: ccaPipedriveNotificationSchema,
      headers: authHeaderSchema,
      params: t.Object({
        dealId: t.Number(),
      }),
      response: {
        204: t.Unknown(),
        400: t.String(),
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'CCA Pipedrive Notification',
        tags: ['Johnny5', 'CCA', 'Deal', 'Matter'],
      },
    },
  )
