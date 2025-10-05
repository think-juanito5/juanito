import { component, dapr, setJsonContentHeader } from '@dbc-tech/johnny5'
import { MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { BtrMatterPopulator } from '../../../johnny5/btr-matter.populator-service'
import { jobContext } from '../../plugins/job-context.plugin'

export const matter_populate_filenotes = new Elysia()
  .use(jobContext({ name: 'v1.btr-contract-drop.matter-populate-filenotes' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-populate-filenotes',
    async ({ body, ctx }) => {
      const { logger, next } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to populate Matter (Filenotes) for File Id:${fileId}, Job Id:${jobId}`,
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
      const { manifest, issues } = matterData

      if (matterData.status === 'filenotes') {
        matterData.status = 'tasks'
        await matterData.save()
        await populator.addFilenotes(manifest.filenotes)
        await populator.addIssuesAsFilenotes(issues)
      }

      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-btr-contract-drop',
        path: 'v1.btr-contract-drop.matter-populate-tasks',
      })

      await logger.info(
        `Finished populating Matter (Filenotes) for File Id:${fileId}, Job Id:${jobId}`,
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
