import { dapr, getString, setJsonContentHeader } from '@dbc-tech/johnny5'
import {
  type DbJob,
  JobModel,
  MatterCreateModel,
} from '@dbc-tech/johnny5-mongodb'
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

export const populate_stepchange = new Elysia()
  .use(jobContext({ name: 'v1.btr-sds-matter.populate-stepchange' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/populate-stepchange',
    async ({ body, ctx }) => {
      const { logger, status, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const actionstep = ctx.actionstep()
      const matterId = job.matterIds?.[0]?.number
      await logger.info(
        `Starting to populate Matter (Stepchange) for File Id:${fileId}, Job Id:${jobId} with Matter Id:${matterId}`,
      )

      await logger.debug('Event payload', body)
      try {
        const { meta } = job
        await logger.debug('Job meta', meta)

        const matterData = await MatterCreateModel.findOne({ jobId })
        if (!matterData)
          throw new SdsAppError(
            SdsErrorMessages.MANIFEST_NOT_FOUND.userMessage,
            'MANIFEST_NOT_FOUND',
          )
        const matterId = matterData.matterId
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

        if (matterData.status === 'stepchange') {
          matterData.status = 'completed'
          matterData.completedOn = new Date()
          await matterData.save()

          const assignedToParticipantId = meta
            ? getString(meta, 'assignedToParticipantId', false)
            : undefined
          if (!assignedToParticipantId) {
            throw new SdsAppError(
              SdsErrorMessages.MISSING_ASSIGNED_TO_PARTICIPANT_ID.userMessage,
              'MISSING_ASSIGNED_TO_PARTICIPANT_ID',
            )
          }
          await populator.SdsChangeStepProcess(
            matterId,
            +assignedToParticipantId,
          )
        }

        const updateJob: Partial<DbJob> = {
          completedOn: new Date(),
        }
        await logger.debug(`Updating Job: ${jobId}`, updateJob)
        await JobModel.findByIdAndUpdate(jobId, updateJob)

        await JobModel.updateOne(
          { _id: jobId, 'matterIds.number': matterId },
          { 'matterIds.$.status': 'populated' },
        )

        await status('completed')
        await logger.info(
          `Finished populating Matter (StepChange) for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error: unknown) {
        const { filenoteMessage } = await handleSdsAppError(
          'Error populating Matter (StepChange)',
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
          await service.logFileNotes(filenoteMessage)
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
