import {
  component,
  dapr,
  daprResponseSchema,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { type DbJob, JobModel } from '@dbc-tech/johnny5-mongodb'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'v1.batch-matter-close' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '',
    async ({ body, ctx }) => {
      const { data } = body
      const { fileId, jobId } = data
      const {
        logger,
        next,
        job: { matterIds, meta },
        status,
      } = ctx
      let filenote: string = 'Automated closure by system'
      if (meta && meta.find((m) => m.key === 'filenote')) {
        filenote = meta.find((m) => m.key === 'filenote')!.value
      }

      await logger.info(
        `Starting next stage of Batch Matter Close for File Id:${fileId}, Job Id:${jobId}`,
      )

      await logger.debug('Message payload', body)

      const nextMatterId = matterIds?.find((m) => m.status === 'closing')
      if (!nextMatterId) {
        const updateJob: Partial<DbJob> = {
          completedOn: new Date(),
        }
        await logger.debug(`Updating Job: ${jobId}`, updateJob)
        await JobModel.findByIdAndUpdate(jobId, updateJob)

        if (
          (matterIds?.filter((m) => m.status === 'error-processing').length ??
            0) > 0
        ) {
          await status('completed-with-errors')
        } else {
          await status('completed')
        }

        await logger.info(
          `Finished Batch Matter Close and Completed Job for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      }

      try {
        await ctx
          .services()
          .matterClose(nextMatterId.number, { closureReason: filenote })
        await logger.info(
          `Closed Matter:${nextMatterId.number} for File Id:${fileId}, Job Id:${jobId}`,
        )
        await JobModel.updateOne(
          { _id: jobId, 'matterIds.number': nextMatterId.number },
          { 'matterIds.$.status': 'closed' },
        )
      } catch (e) {
        await logger.error(
          `Failed to close Matter:${nextMatterId.number} for File Id:${fileId}, Job Id:${jobId}`,
          e,
        )
        await JobModel.updateOne(
          { _id: jobId, 'matterIds.number': nextMatterId.number },
          { 'matterIds.$.status': 'error-processing' },
        )
      }

      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-batch-matter-close',
        path: 'v1.batch-matter-close',
      })

      await logger.info(
        `Finished stage of Batch Matter Close for File Id:${fileId}, Job Id:${jobId}`,
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
