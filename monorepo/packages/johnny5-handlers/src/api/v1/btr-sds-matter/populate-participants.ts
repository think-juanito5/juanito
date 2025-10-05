import {
  component,
  dapr,
  getString,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { BtrAgentModel, MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
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

export const populate_participants = new Elysia()
  .use(jobContext({ name: 'v1.btr-sds-matter.populate-participants' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/populate-participants',
    async ({ body, ctx }) => {
      const { logger, next, status } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const j5config = ctx.johnny5Config
      const { job } = ctx
      const matterId = job.matterIds?.[0]?.number
      const actionstep = ctx.actionstep()
      await logger.info(
        `Starting to populate Matter (Participants) for File Id:${fileId}, Job Id:${jobId} with Matter Id:${matterId}`,
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
          j5config,
          ctx.actionstep(),
          ctx.logger,
          matterId,
        )

        const { manifest } = matterData

        if (matterData.status === 'participants') {
          matterData.status = 'data-collections'
          await matterData.save()
          await populator.addParticipants(manifest.participants)
          const agentParticipantId = populator.btrAgentParticipantId
          const addedIssues = populator.issues

          if (addedIssues.length > 0) {
            await MatterCreateModel.updateOne(
              { jobId },
              { $push: { issues: { $each: addedIssues } } },
            )
          }

          await logger.info(
            `Matter (Participants) populated for File Id:${fileId}, Job Id:${jobId} with Agent Participant Id:${agentParticipantId}`,
          )
          const agentId = job.meta
            ? getString(job.meta, 'agentId', false)
            : undefined
          if (agentId) {
            await logger.debug(
              `Agent Id found in Job Meta: ${agentId}, updating Agent Participant Id in Job`,
            )
            await BtrAgentModel.updateOne(
              { sdsAgentId: agentId },
              { $set: { participantId: agentParticipantId } },
            )

            await logger.info(
              `BtrAgent updated with Agent Participant Id:${agentParticipantId} for Agent Id:${agentId}`,
            )
          }
        }

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-sds-matter',
          path: 'v1.btr-sds-matter.populate-data-collections',
        })

        await logger.info(
          `Finished populating Matter (Participants) for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error: unknown) {
        const { filenoteMessage } = await handleSdsAppError(
          'Error populating Matter (Participants)',
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
