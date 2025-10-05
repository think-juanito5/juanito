import {
  type Action,
  type ActionParticipantPostMultiple,
} from '@dbc-tech/actionstep'
import {
  type MatterCreateBasics,
  type Meta,
  dapr,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { participantTypes } from '@dbc-tech/johnny5-btr'
import { FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { component, daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { Err, Ok } from 'ts-results-es'
import { SdsErrorMessages } from '../../../johnny5/btr/constants'
import { ActionstepFileNoteService } from '../../../johnny5/btr/sds/actionstep-filenotes-service'
import {
  SdsAppError,
  handleSdsAppError,
} from '../../../johnny5/btr/utils/error-utils'
import { jobContext } from '../../plugins/job-context.plugin'

export const create = new Elysia()
  .use(jobContext({ name: 'v1.btr-sds-matter.create' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/create',
    async ({ body, ctx }) => {
      const { logger, status, next, job, profile, johnny5Config } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const actionstep = ctx.actionstep()
      let matterId: number | undefined

      await logger.info(
        `Create #SDS Matter Creation for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('SDS Event payload', body)

      try {
        const { meta } = job
        await logger.debug('SDS Job meta', meta)

        const templateMatterId = meta?.find(
          (m) => m.key === 'templateMatterId',
        )?.value
        if (!templateMatterId) {
          throw new SdsAppError(
            SdsErrorMessages.MISSING_TEMPLATE_MATTER_ID.userMessage,
            'MISSING_TEMPLATE_MATTER_ID',
          )
        }
        const templateMatterNumber = +templateMatterId
        const testMode = meta?.find((m) => m.key === 'testMode')?.value
        let matterName = meta?.find((m) => m.key === 'matterName')?.value
        if (!matterName) {
          throw new SdsAppError(
            SdsErrorMessages.MISSING_MATTER_NAME.userMessage,
            'MISSING_MATTER_NAME',
          )
        }

        if (testMode === 'true') {
          matterName = `[test] ${matterName}`
        }
        const additionalInfo = meta?.find(
          (m) => m.key === 'additionalInfo',
        )?.value

        await logger.debug('SDS Fetching template action participants')

        const templateAP = await actionstep.getActionParticipants({
          filter: `action = ${templateMatterNumber}`,
          include: 'action',
        })
        if (!templateAP || !templateAP.linked?.actions)
          throw new SdsAppError(
            SdsErrorMessages.TEMPLATE_NOT_FOUND.userMessage,
            'TEMPLATE_NOT_FOUND',
            { templateMatterNumber },
          )

        const action: Action = templateAP.linked.actions[0]
        const newMatterPostBody: MatterCreateBasics = {
          name: matterName,
          reference: action.reference!,
          matter_type_id: +action.links.actionType!,
          notes: additionalInfo,
        }

        const trustAccountConfig = await johnny5Config.get(
          'actionstep_trust_account',
        )
        if (!trustAccountConfig)
          throw new SdsAppError(
            SdsErrorMessages.MISSING_TRUST_ACCOUNT.userMessage,
            'MISSING_TRUST_ACCOUNT',
          )

        await logger.debug('SDS Creating new matter')
        matterId = await actionstep.createMatter(newMatterPostBody, [
          trustAccountConfig.value,
        ])

        if (!matterId) {
          throw new SdsAppError(
            SdsErrorMessages.MATTER_CREATION_FAILED.userMessage,
            'MATTER_CREATION_FAILED',
          )
        }
        await logger.info(
          `SDS Created Matter:${matterId} for File Id:${fileId}, Job Id:${jobId}`,
        )
        await logger.debug(
          `SDS Updating job status with new matterId ${matterId}`,
        )

        const result = await updateJobAndFileInTransaction(
          jobId,
          fileId,
          String(matterId),
        )
        if (result.err) {
          throw new SdsAppError(
            SdsErrorMessages.ERROR_UPDATING_JOB_AND_FILE.userMessage,
            'ERROR_UPDATING_JOB_AND_FILE',
            { details: result.val },
          )
        } else {
          const { job, file } = result.val
          await logger.debug(
            `SDS Updated Job: ${job._id} and File: ${file._id} with new matterId ${matterId}`,
          )
        }

        if (action.links.assignedTo) {
          await logger.debug(
            `SDS Assigning matter to participant id: ${action.links.assignedTo}`,
          )
          await actionstep.updateAction(matterId, {
            actions: { links: { assignedTo: action.links.assignedTo } },
          })
        }

        await logger.debug('SDS Updating Matter intent')
        await actionstep.updateDataCollectionRecordValuev2(
          matterId,
          'convdet',
          'ConveyType',
          'Sale',
        )

        if (additionalInfo) {
          await actionstep.updateDataCollectionRecordValuev2(
            matterId,
            'property',
            'additnotes',
            additionalInfo,
          )
        }

        const ap: ActionParticipantPostMultiple = {
          actionparticipants: templateAP.actionparticipants.map((ap) => {
            return {
              links: {
                action: `${matterId}`,
                participant: ap.links.participant,
                participantType: ap.links.participantType,
              },
            }
          }),
        }

        await logger.debug('SDS Linking action participants', ap)

        await profile(
          () => actionstep.linkMultipleActionParticipants(ap),
          'actionstep.linkMultipleActionParticipants',
        )

        await logger.info(
          `SDS Created Matter:${matterId} for File Id:${fileId}, Job Id:${jobId}`,
        )

        const conveyancerAssigneeId = ap.actionparticipants.find(
          (ap) =>
            ap.links.participantType === `${participantTypes.conveyancer}`,
        )?.links.participant

        if (!conveyancerAssigneeId) {
          throw new SdsAppError(
            SdsErrorMessages.MISSING_PARTICIPANT_CONVEYANCER.userMessage,
            'MISSING_PARTICIPANT_CONVEYANCER',
          )
        }

        await logger.info(
          `Assigned assignedToParticipantId Meta for Matter:${matterId}`,
        )

        const xmeta: Meta[] = (meta ?? []).filter(
          (m) => !['assignedToParticipantId'].includes(m.key),
        )
        xmeta.push({
          key: 'assignedToParticipantId',
          value: String(conveyancerAssigneeId),
        })
        await JobModel.updateOne({ _id: jobId }, { $set: { meta: xmeta } })

        await logger.info(
          `Finished opening Matter:${matterId} for File Id:${fileId}, Job Id:${jobId}`,
        )

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-sds-matter',
          path: 'v1.btr-sds-matter.manifest-create',
        })
        return dapr.success
      } catch (error: unknown) {
        const { filenoteMessage } = await handleSdsAppError(
          'Error creating Matter',
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

const updateJobAndFileInTransaction = async (
  jobId: string,
  fileId: string,
  matterId: string,
) => {
  const session = await mongoose.startSession()

  try {
    const result = await session.withTransaction(async () => {
      await JobModel.findByIdAndUpdate(
        jobId,
        { matterIds: [{ number: matterId, status: 'created' }] },
        { session },
      )

      await FileModel.findByIdAndUpdate(
        fileId,
        { actionStepMatterId: matterId },
        { session },
      )

      const job = await JobModel.findById(jobId, null, { session })
      const file = await FileModel.findById(fileId, null, { session })

      if (!job || !file) {
        return Err('Job or File not found inside transaction')
      }

      return Ok({ job, file })
    })

    if (!result) {
      return Err('Transaction aborted — result is null')
    }
    return result
  } catch (err) {
    return Err(`Error processing BTR SDS Matter Creation: ${err}`)
  } finally {
    await session.endSession()
  }
}
