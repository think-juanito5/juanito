import { dapr, setJsonContentHeader } from '@dbc-tech/johnny5'
import {
  type DbJob,
  JobModel,
  MatterCreateModel,
} from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { BtrMatterPopulator } from '../../../johnny5/btr-matter.populator-service'
import { jobContext } from '../../plugins/job-context.plugin'

export const matter_populate_files = new Elysia()
  .use(jobContext({ name: 'v1.btr-contract-drop.matter-populate-files' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-populate-files',
    async ({ body, ctx }) => {
      const { logger, status } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to populate Matter (Files) for File Id:${fileId}, Job Id:${jobId}`,
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

      if (matterData.status === 'files') {
        matterData.status = 'completed'
        matterData.completedOn = new Date()
        await matterData.save()
        await populator.addFiles(manifest.files)
      }

      const updateJob: Partial<DbJob> = {
        completedOn: new Date(),
      }
      await logger.debug(`Updating Job: ${jobId}`, updateJob)
      await JobModel.findByIdAndUpdate(jobId, updateJob)

      await JobModel.updateOne(
        { _id: jobId, 'matterIds.number': matterData.matterId },
        { 'matterIds.$.status': 'populated' },
      )

      await status('completed')

      await logger.info(
        `Finished populating Matter for File Id:${fileId}, Job Id:${jobId}`,
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
