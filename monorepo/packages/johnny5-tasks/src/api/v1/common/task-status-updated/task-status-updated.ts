import {
  dapr,
  setJsonContentHeader,
  taskStatusCloudEventSchema,
} from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { taskContext } from '../../../plugins/task-context.plugin'
import { emailNotifications } from './email/email-notifications'
import { teamsNotifications } from './teams/teams-notifications'

export const task_status_updated = new Elysia()
  .use(taskContext({}))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/task-status-updated',
    async ({ body, ctx }) => {
      const { logger, correlationId, file, task, name: source } = ctx
      const { data } = body
      const { fileId, taskId, status } = data
      await logger.info(
        `Starting to process status update:${status} for File Id:${fileId}, Task Id:${taskId}`,
      )
      await logger.debug('Event payload', body)

      try {
        await emailNotifications(
          body,
          task,
          file,
          logger,
          source,
          correlationId,
        )
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error email notifications for File Id:${fileId}, Task Id:${taskId}`,
          errJson,
        )
      }

      try {
        const teams = ctx.powerappTeams()
        await teamsNotifications(body, task, file, logger, teams)
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error teams notifications for File Id:${fileId}, Task Id:${taskId}`,
          errJson,
        )
      }

      await logger.info(
        `Finished processing status update:${status} for File Id:${fileId}, Task Id:${taskId}`,
      )
      return dapr.success
    },
    {
      body: taskStatusCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
