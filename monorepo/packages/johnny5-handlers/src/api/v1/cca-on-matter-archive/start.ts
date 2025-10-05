import { ccaSellFileMatterTypes } from '@dbc-tech/actionstep'
import {
  dapr,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Value } from '@sinclair/typebox/value'
import { Elysia, t } from 'elysia'
import { serializeError } from 'serialize-error'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'v1.cca-on-matter-archive.start' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '',
    async ({ body, ctx }) => {
      const { logger, status, job, file } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const { actionStepMatterId } = file
      await logger.info(
        `Starting to process Matter Archival for File Id:${fileId}, Job Id:${jobId}, Matter: ${file.actionStepMatterId}`,
      )
      await logger.debug('Event payload', body)

      const { meta } = job
      await logger.debug('Job meta', meta)

      if (!actionStepMatterId) {
        await logger.error('actionStepMatterId is missing from file')
        await status(
          'error-processing',
          'actionStepMatterId is missing from file',
        )
        return dapr.drop
      }

      const actionType = meta?.find((m) => m.key === 'actionType')?.value
      if (!actionType) {
        await logger.error('actionType is missing from meta collection')
        await status(
          'error-processing',
          'actionType is missing from meta collection',
        )
        return dapr.drop
      }

      const metaParticipantIds = meta?.find(
        (m) => m.key === 'participantIds',
      )?.value
      if (!metaParticipantIds) {
        await logger.error('participantIds is missing from meta collection')
        await status(
          'error-processing',
          'participantIds is missing from meta collection',
        )
        return dapr.drop
      }

      const participantIds = Value.Parse(
        t.Array(t.Number()),
        metaParticipantIds,
      )
      if (!participantIds || participantIds.length === 0) {
        await logger.error('participantIds is empty')
        await status('error-processing', 'participantIds is empty')
        return dapr.drop
      }

      if (!ccaSellFileMatterTypes.includes(+actionType)) {
        await logger.info(
          `Ignoring Matter Archival for File Id:${fileId}, Job Id:${jobId}, Matter: ${file.actionStepMatterId} as actionType: ${actionType} is not a sell file`,
        )
        await status('completed')
        return dapr.success
      }

      const actionstep = ctx.actionstep()

      const primaryParticipantId = participantIds[0]
      await logger.debug(
        `Clearing contact fields of (primary) Participant Id: ${primaryParticipantId}`,
      )

      try {
        await actionstep.updateParticipant(primaryParticipantId, {
          participants: {
            email: null,
            phone1Area: null,
            phone1Country: null,
            phone1Label: null,
            phone1Notes: null,
            phone1Number: null,
            phone2Area: null,
            phone2Country: null,
            phone2Label: null,
            phone2Notes: null,
            phone2Number: null,
            phone3Area: null,
            phone3Country: null,
            phone3Label: null,
            phone3Notes: null,
            phone3Number: null,
            phone4Area: null,
            phone4Country: null,
            phone4Label: null,
            phone4Notes: null,
            phone4Number: null,
          },
        })

        await actionstep.createFileNote({
          filenotes: {
            text: `[Matter archive] Removed contact details from primary participant: ${primaryParticipantId}`,
            links: {
              action: `${actionStepMatterId}`,
            },
          },
        })
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error clearing contact fields of (primary) Participant Id: ${primaryParticipantId}`,
          errJson,
        )
        await status(
          'error-processing',
          `Error clearing contact fields of (primary) Participant Id: ${primaryParticipantId}: ${JSON.stringify(errJson)}`,
        )
        return dapr.drop
      }

      await logger.info(
        `Finished processing Matter Archival for File Id:${fileId}, Job Id:${jobId}, Matter: ${file.actionStepMatterId}`,
      )

      await status('completed')

      return dapr.success
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
