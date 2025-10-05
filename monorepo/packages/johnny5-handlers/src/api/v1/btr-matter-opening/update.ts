import {
  dapr,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { JobModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'

export const update = new Elysia()
  .use(jobContext({ name: 'v1.btr-matter-opening.update' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/update',
    async ({ body, ctx }) => {
      const { logger, status, file, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const as = ctx.actionstep()
      await logger.info(
        `Starting to update Matter for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const matterId = file.actionStepMatterId
      if (!matterId) {
        await logger.error(
          `actionStepMatterId is missing from File Id:${fileId}`,
        )
        await status('error-processing', 'actionStepMatterId is missing')
        return dapr.drop
      }

      const { meta } = job
      const professionalFees = meta?.find(
        (m) => m.key === 'professionalFees',
      )?.value
      if (professionalFees) {
        await as.updateDataCollectionRecordValuev2(
          matterId,
          'engage',
          'fees',
          professionalFees,
        )
      }

      await JobModel.findByIdAndUpdate(jobId, {
        completedOn: new Date(),
      })

      await status('completed')

      await logger.info(
        `Finished updating Matter:${matterId} for File Id:${fileId}, Job Id:${jobId}`,
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
