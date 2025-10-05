import {
  J5Config,
  component,
  dapr,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
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

export const populate_filenotes = new Elysia()
  .use(jobContext({ name: 'v1.btr-sds-matter.populate-filenotes' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/populate-filenotes',
    async ({ body, ctx }) => {
      const { logger, next, status, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const actionstep = ctx.actionstep()
      const matterId = job.matterIds?.[0]?.number
      const j5config = ctx.johnny5Config

      await logger.info(
        `Starting to populate Matter (Filenotes) for File Id:${fileId}, Job Id:${jobId} with Matter Id:${matterId}`,
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

        const { manifest, issues } = matterData

        if (matterData.status === 'filenotes') {
          matterData.status = 'files'
          await matterData.save()
          await populator.addFilenotes(manifest.filenotes)

          const btrSdsFormFilenotesEnabled = await j5config.get(
            J5Config.btr.sellerDisclosure.clients.sdsFormFilenotesEnabled,
          )
          await logger.info(
            `Adding of SDS Form as filenote for Matter Id:${matterId}, File Id:${fileId}, Job Id:${jobId} btrSdsFormFilenotesEnabled: ${btrSdsFormFilenotesEnabled?.value}`,
          )
          if (btrSdsFormFilenotesEnabled?.value === 'true') {
            const service = new ActionstepFileNoteService(
              matterId,
              job,
              actionstep,
              logger,
            )
            const preferredDetails = await service.getPreferredHQDetails()
            const contactCardNotes = issues
              ? issues.map((issue) => issue.description).join('\n')
              : undefined
            const fnotes = service.buildFileNotes(
              preferredDetails,
              contactCardNotes,
            )
            await service.saveFilenotesToMeta(fnotes)
            await populator.addIssuesAsFilenotes([{ description: fnotes }])
          }
        }

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-sds-matter',
          path: 'v1.btr-sds-matter.populate-files',
        })

        await logger.info(
          `Finished populating Matter (Filenotes) for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error) {
        const { filenoteMessage } = await handleSdsAppError(
          'Error populating Matter (Filenotes)',
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
