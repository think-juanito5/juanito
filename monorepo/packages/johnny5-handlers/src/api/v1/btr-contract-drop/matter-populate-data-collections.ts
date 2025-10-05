import { component, dapr, setJsonContentHeader } from '@dbc-tech/johnny5'
import { MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { BtrMatterPopulator } from '../../../johnny5/btr-matter.populator-service'
import { jobContext } from '../../plugins/job-context.plugin'

export const matter_populate_data_collections = new Elysia()
  .use(
    jobContext({
      name: 'v1.btr-contract-drop.matter-populate-data-collections',
    }),
  )
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-populate-data-collections',
    async ({ body, ctx }) => {
      const { logger, next } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to populate Matter (Data Collections) for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const matterData = await MatterCreateModel.findOne({ jobId })
      if (!matterData)
        throw new Error(
          `Manifest not found for File Id:${fileId}, Job Id:${jobId}`,
        )
      if (!matterData.matterId)
        throw new Error(
          `Matter Id unknown from Manifest for File Id:${fileId}, Job Id:${jobId}`,
        )

      const populator = new BtrMatterPopulator(
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
        queueName: 'johnny5-btr-contract-drop',
        path: 'v1.btr-contract-drop.matter-populate-filenotes',
      })

      await logger.info(
        `Finished populating Matter (Data Collections) for File Id:${fileId}, Job Id:${jobId}`,
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
