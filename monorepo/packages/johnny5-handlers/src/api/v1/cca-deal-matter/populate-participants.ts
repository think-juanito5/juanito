import {
  J5Config,
  component,
  dapr,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { JobModel, MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { CcaMatterPopulator } from '../../../johnny5/cca-matter.populator-service'
import { filenotePipedriveSvc } from '../../plugins/filenotes-pipedrive.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const populate_participants = new Elysia()
  .use(jobContext({ name: 'v1.cca-deal-matter.populate-participants' }))
  .use(filenotePipedriveSvc)
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/populate-participants',
    async ({ body, ctx, filenotePipedrive }) => {
      const { logger, next, status, job, file, services } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const dealId = file.pipedriveDealId!
      const j5config = ctx.johnny5Config

      await logger.info(
        `Starting to populate Matter (Participants) for File Id:${fileId}, Job Id:${jobId} dealId:${dealId}`,
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
          j5config,
          ctx.actionstep(),
          ctx.logger,
          matterData.matterId,
        )

        const { manifest } = matterData

        if (matterData.status === 'participants') {
          const testMode = job.meta?.find((m) => m.key === 'testMode')?.value
          const isOnlineConv = job.meta?.some(
            (m) => m.key === 'onlineConversionType',
          )

          const newMatterEnabled = await j5config.get(
            J5Config.cca.ccaDealMatterNewNameEnabled,
          )

          matterData.status = 'data-collections'
          await matterData.save()
          await populator.addParticipants(manifest.participants)

          let matterName = undefined
          if (newMatterEnabled && newMatterEnabled.value === 'true') {
            const cca = services()
            const task = await cca.ccaMatterNameRefresh(matterData.matterId, {
              pipedriveFileNotesEnabled: true,
              teamsNotifyEnabled: true,
              initiateMatterCreation: true,
            })
            if (!task) {
              throw new Error(
                `MatterNameRefresh task failed for Matter Id:${matterData.matterId}`,
              )
            }
            await logger.info(
              `MatterNameRefresh task created for Matter Id:${matterData.matterId} with details:`,
              { taskId: task.id },
            )
          } else {
            matterName = await populator.updateMatterName(
              manifest?.meta,
              testMode,
              isOnlineConv,
            )
          }

          await logger.info(
            `MatterName ${matterName} - generated for File Id:${fileId}, Job Id:${jobId}`,
            { matterName },
          )

          if (matterName) {
            await JobModel.updateOne(
              { _id: jobId, 'meta.key': 'matterName' },
              { $set: { 'meta.$.value': matterName } },
            )
          }

          const addedIssues = populator.issues
          await logger.info(
            `Retrieved Issues when populating the Matter (Participants) for File Id:${fileId}, Job Id:${jobId}`,
            { addedIssues },
          )

          if (addedIssues.length > 0) {
            await MatterCreateModel.updateOne(
              { jobId },
              { $push: { issues: { $each: addedIssues } } },
            )
          }
        }

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-deal-matter',
          path: 'v1.cca-deal-matter.populate-data-collections',
        })

        await logger.info(
          `Finished populating Matter (Participants) for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error('Error populating Matter (Participants)', errJson)

        await filenotePipedrive
          .deal(dealId)
          .notify('matter-creation-error')
          .exec()

        await status(
          'error-processing',
          `Error Populating Matter Participants: ${JSON.stringify(errJson)}`,
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
