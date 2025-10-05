import { datalakeQuery } from '@dbc-tech/datalake'
import { component, getString, jobCloudEventSchema } from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5'
import { setJsonContentHeader } from '@dbc-tech/johnny5'
import { dapr } from '@dbc-tech/johnny5'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { dbTimestampMelbourne } from '../../../utils/date-utils'
import { datalakeDb } from '../../plugins/db.datalake.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'cca-email-unsubscribe' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .use(datalakeDb)
  .post(
    '',
    async ({ body, ctx, datalakeDb }) => {
      const { logger, next, status, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to process CCA Unsubscribe - Datalake for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const clientDL = await datalakeDb.connect()
      const dlQuery = datalakeQuery(clientDL)

      try {
        const { meta } = job

        if (!meta) {
          throw new Error(
            `Meta is undefined for File Id:${fileId}, Job Id:${jobId}`,
          )
        }
        const email = getString(meta, 'unsubscribeEmail', false)

        if (!email) {
          throw new Error(
            `Email not found in meta for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        const userSubData =
          await dlQuery.userSubscription.findByUserEmail(email)

        if (!userSubData || userSubData.length === 0) {
          await logger.warn(
            `No UserSubscription found for File Id:${fileId}, Job Id:${jobId}, Email: ${email}`,
          )
        } else {
          await logger.info(
            `Found ${userSubData.length} UserSubscription records for email: ${email}`,
          )

          for (const sub of userSubData) {
            await logger.info(
              `Processing UserSubscription for email: ${email}, Subscription Id: ${sub.id}, User Id: ${sub.userId}`,
            )
            if (!sub.userId) {
              await logger.warn(
                `UserId is undefined for UserSubscription Id: ${sub.id}, Email: ${email}`,
              )
              continue
            }
            const userId = sub.userId
            await dlQuery.userSubscription.update(userId, {
              emailUnsubscribed: dbTimestampMelbourne(),
              smsUnsubscribed: dbTimestampMelbourne(),
              phoneUnsubscribed: dbTimestampMelbourne(),
            })

            await logger.info(
              `Updated UserSubscription for User Id: ${userId}, Email: ${email}`,
            )
          }
        }

        await status('in-progress')
        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-email-unsubscribe',
          path: 'v1.cca-email-unsubscribe.pipedrive-update',
        })

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error processing unsubscribe datalake update for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await status(
          'error-processing',
          `Error processing unsubscribe datalake update: ${JSON.stringify(errJson)}`,
        )

        return dapr.drop
      } finally {
        clientDL.release()
      }
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
