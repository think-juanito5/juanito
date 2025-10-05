import {
  component,
  dapr,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'v1.bespoke-tasks.start' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '',
    async ({ body, ctx }) => {
      const { logger, job, status, next } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to extract data for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const form_response = job.meta?.find((b) => b.key === 'additionalInfo')
      if (!form_response) {
        await logger.warn(
          `File Id:${fileId} does not contain a typeform response in Job Id:${jobId}`,
        )
        return dapr.drop
      }

      await logger.info(
        `Finished extracting data for File Id:${fileId}, Job Id:${jobId}`,
      )

      await status('in-progress')
      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-bespoke-tasks',
        path: 'v1.bespoke-tasks.manifest-create',
      })

      return dapr.success
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
