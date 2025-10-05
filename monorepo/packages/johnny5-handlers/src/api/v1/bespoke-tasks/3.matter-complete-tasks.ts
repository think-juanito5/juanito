import type { TaskPutPostInner } from '@dbc-tech/actionstep'
import {
  bespokeTasksManifestSchema,
  component,
  dapr,
  getValue,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'
import { bespokeError } from './common'

export const matter_complete_tasks = new Elysia()
  .use(jobContext({ name: 'v1.bespoke-tasks.matter-complete-tasks' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-complete-tasks',
    async ({ body, ctx }) => {
      const { logger, next, file, job } = ctx
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

      if (manifest.completeTasks.length > 0) {
        // build out the post body for the tasks
        const postBody: TaskPutPostInner[] = []
        const id: string[] = []
        for (const task of manifest.completeTasks) {
          id.push(`${task.id}`)
          postBody.push({
            name: task.name,
            status: task.status,
            completedTimestamp: task.completedTimestamp,
            links: {
              assignee: `${task.links.assignee}`,
              action: task.links.action,
            },
          })
        }

        const as = ctx.actionstep()
        try {
          await as.updateTasks(id, { tasks: postBody })
        } catch (error) {
          await bespokeError(error, 'Error updating tasks', job, logger)
          return dapr.drop
        }
      }

      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-bespoke-tasks',
        path: 'v1.bespoke-tasks.matter-populate-data-fields',
      })

      await logger.info(
        `Finished updating Matter (Tasks) for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
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
