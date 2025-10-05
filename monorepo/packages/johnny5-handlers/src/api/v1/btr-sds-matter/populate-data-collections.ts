import { component, dapr, setJsonContentHeader } from '@dbc-tech/johnny5'
import { MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { BtrMatterPopulator } from '../../../johnny5/btr-matter.populator-service'
import { SdsErrorMessages } from '../../../johnny5/btr/constants'
import { ActionstepFileNoteService } from '../../../johnny5/btr/sds/actionstep-filenotes-service'
import {
  SdsAppError,
  handleSdsAppError,
} from '../../../johnny5/btr/utils/error-utils'
import { jobContext } from '../../plugins/job-context.plugin'

export const populate_data_collections = new Elysia()
  .use(
    jobContext({
      name: 'v1.btr-sds-matter.populate-data-collections',
    }),
  )
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/populate-data-collections',
    async ({ body, ctx }) => {
      const { logger, next, status, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const actionstep = ctx.actionstep()
      const matterId = job.matterIds?.[0]?.number

      await logger.info(
        `Starting to populate Matter (Data Collections) for File Id:${fileId}, Job Id:${jobId} with Matter Id:${matterId}`,
      )
      await logger.debug('Event payload', body)

      try {
        const matterData = await MatterCreateModel.findOne({ jobId })
        if (!matterData)
          throw new SdsAppError(
            SdsErrorMessages.MANIFEST_NOT_FOUND.userMessage,
            'MANIFEST_NOT_FOUND',
          )
        if (!matterId)
          throw new SdsAppError(
            SdsErrorMessages.MATTER_ID_UNKNOWN.userMessage,
            'MATTER_ID_UNKNOWN',
          )

        const populator = new BtrMatterPopulator(
          ctx.johnny5Config,
          actionstep,
          ctx.logger,
          matterId,
        )

        const { manifest } = matterData

        if (matterData.status === 'data-collections') {
          matterData.status = 'filenotes'
          await matterData.save()
          await populator.addCollections(manifest.data_collections)
        }

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-sds-matter',
          path: 'v1.btr-sds-matter.populate-filenotes',
        })

        await logger.info(
          `Finished populating Matter (Data Collections) for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error: unknown) {
        const { filenoteMessage } = await handleSdsAppError(
          'Error populating Matter (Data Collections)',
          error,
          fileId,
          jobId,
          logger,
        )

        await status('error-processing', filenoteMessage)

        if (matterId) {
          const service = new ActionstepFileNoteService(
            matterId,
            job,
            actionstep,
            logger,
          )
          await service.createSubmissionDetailsWithError(filenoteMessage)
        }
        return dapr.drop
      }
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
