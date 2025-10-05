import {
  dapr,
  jobStatusCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { jobContext } from '../../../plugins/job-context.plugin'
import { emailNotifications } from './email/email-notifications'
import { teamsNotifications } from './teams/teams-notifications'

export const job_status_updated = new Elysia()
  .use(jobContext({ name: 'v1.job-status-updated' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/job-status-updated',
    async ({ body, ctx }) => {
      const { logger, correlationId, file, job, name: source } = ctx
      const { data } = body
      const { fileId, jobId, status } = data
      await logger.info(
        `Starting to process status update:${status} for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      try {
        await emailNotifications(body, job, file, logger, source, correlationId)
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error email notifications for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )
      }

      try {
        const teams = ctx.powerappTeams()
        await teamsNotifications(body, job, file, logger, teams)
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error teams notifications for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )
      }

      await logger.info(
        `Finished processing status update:${status} for File Id:${fileId}, Job Id:${jobId}`,
      )
      return dapr.success
    },
    {
      body: jobStatusCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
