import { component, dapr, setJsonContentHeader } from '@dbc-tech/johnny5'
import { MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { CcaMatterPopulator } from '../../../johnny5/cca-matter.populator-service'
import { filenotePipedriveSvc } from '../../plugins/filenotes-pipedrive.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const populate_data_collections = new Elysia()
  .use(
    jobContext({
      name: 'v1.cca-deal-matter.populate-data-collections',
    }),
  )
  .use(filenotePipedriveSvc)
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/populate-data-collections',
    async ({ body, ctx, filenotePipedrive }) => {
      const { logger, next, status, file } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const dealId = file.pipedriveDealId!

      await logger.info(
        `Starting to populate Matter (Data Collections) for File Id:${fileId}, Job Id:${jobId} dealId:${dealId}`,
      )
      await logger.debug('Event payload', body)

      try {
        const matterData = await MatterCreateModel.findOne({ jobId })
        if (!matterData)
          throw new Error(
            `Manifest not found for File Id:${fileId}, Job Id:${jobId}`,
          )
        if (!matterData.matterId)
          throw new Error(
            `Matter Id unknown from Manifest for File Id:${fileId}, Job Id:${jobId}`,
          )

        const populator = new CcaMatterPopulator(
          ctx.johnny5Config,
          ctx.actionstep(),
          ctx.logger,
          matterData.matterId,
        )

        const { manifest } = matterData

        if (matterData.status === 'data-collections') {
          matterData.status = 'filenotes'
          await matterData.save()
          await populator.addCollections(manifest.data_collections)
        }

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-deal-matter',
          path: 'v1.cca-deal-matter.populate-filenotes',
        })

        await logger.info(
          `Finished populating Matter (Data Collections) for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          'Error populating Matter (Data Collections)',
          errJson,
        )

        await filenotePipedrive
          .deal(dealId)
          .notify('matter-creation-error')
          .exec()
        await status(
          'error-processing',
          `Error Populating Data Collections: ${JSON.stringify(errJson)}`,
        )
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
