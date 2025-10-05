import type { TaskPutPostInner } from '@dbc-tech/actionstep'
import {
  bespokeTasksManifestSchema,
  component,
  dapr,
  daprResponseSchema,
  getValue,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'
import { bespokeError } from './common'

export const matter_create_tasks = new Elysia()
  .use(jobContext({ name: 'v1.bespoke-tasks.matter-create-tasks' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-create-tasks',
    async ({ body, ctx }) => {
      const { logger, next, job, file } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to populate Matter (Tasks) for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      if (!file.actionStepMatterId) {
        await logger.error(
          `File Id:${fileId} does not have an ActionStep Matter Id`,
        )
        return dapr.drop
      }

      const manifest = getValue(
        job.meta,
        'manifest',
        bespokeTasksManifestSchema,
        true,
      )
      if (!manifest) {
        await logger.error(
          `Manifest not found for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
        )
        return dapr.drop
      }

      if (manifest.createTasks.length > 0) {
        // build out the post body for the tasks
        const postBody: TaskPutPostInner[] = []
        for (const task of manifest.createTasks) {
          postBody.push({
            name: task.name,
            description: task.description,
            status: task.status,
            dueTimestamp: task.dueTimestamp,
            links: {
              assignee: `${task.links.assignee}`,
              action: task.links.action,
            },
          })
        }
        const as = ctx.actionstep()
        try {
          await as.createTasks({ tasks: postBody })
        } catch (error) {
          bespokeError(error, 'Error creating tasks', job, logger)
          return dapr.drop
        }
      }

      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-bespoke-tasks',
        path: 'v1.bespoke-tasks.matter-populate-filenotes',
      })

      await logger.info(
        `Finished populating Matter (Tasks) for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
      )

      return dapr.success
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
