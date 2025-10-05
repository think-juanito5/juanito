import { getActionStepDateTimeFormat } from '@dbc-tech/actionstep'
import {
  dapr,
  daprResponseSchema,
  getNumberArray,
  getString,
  getStringArray,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { jobContext } from '../../plugins/job-context.plugin'
import { compileTaskDescription } from './index'

const failedAuditTaskTargetParticipantTypeName = 'Conveyancer'
const auditResultDataCollectionName = 'btrhq'
const auditResultDataFieldName = 'settlement_audit'
const failedAuditResultDataCollectionName = 'btrhq'
const failedAuditResultDataFieldName = 'settlement_audit_fail_reason'

export const audit_failed = new Elysia()
  .use(jobContext({ name: 'v1.btr-pexa-audit.audit-failed' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/audit-failed',
    async ({ body, ctx }) => {
      const {
        logger,
        status,
        job: { meta, type, id: jobId, fileId },
        file: { actionStepMatterId },
      } = ctx
      await logger.debug('Event payload', body)
      if (!actionStepMatterId) {
        throw new Error('File does not have an Actionstep Matter Id')
      }
      if (!meta) {
        throw new Error('No meta provided')
      }
      const actionStepTaskIds = getNumberArray(meta, 'actionstepTaskId', true)
      const actionStepTaskId = actionStepTaskIds.at(-1)!
      const dataverseGuid = getStringArray(meta, 'dataverseGuid', true).at(-1)!
      const extra = getString(meta, 'filenote', false)

      await logger.info(
        `Starting ${type} for File Id:${fileId}, Job Id:${jobId}, Matter Id:${actionStepMatterId}, Audit Guid:${dataverseGuid}`,
      )
      try {
        const as = ctx.actionstep()
        const j5 = ctx.services()

        const fileNote = await j5.pexaAuditFileNote(
          actionStepMatterId,
          actionStepTaskId,
          dataverseGuid,
          extra,
        )
        let taskDescription
        try {
          taskDescription = await compileTaskDescription(
            ctx.dataverse,
            dataverseGuid,
          )
        } catch (error) {
          const msg = `Error compiling task description for BTR PEXA Audit record:${dataverseGuid}, Matter Id:${actionStepMatterId}, ignoring`
          await logger.error(msg, serializeError(error))
          await status('error-processing', msg)
          return dapr.retry
        }

        await as.createFileNote({
          filenotes: {
            text: fileNote.filenote,
            links: {
              action: `${actionStepMatterId}`,
            },
          },
        })

        if (taskDescription) {
          const conveyancer = await as.getActionParticipants({
            filter: `action = ${actionStepMatterId} AND participantType.name = '${failedAuditTaskTargetParticipantTypeName}'`,
          })
          if (conveyancer.actionparticipants.length === 0) {
            const msg = `No conveyancer found for BTR PEXA Audit record:${dataverseGuid}, Matter Id:${actionStepMatterId}, ignoring`
            await logger.error(msg)
            await status('error-processing', msg)
            return dapr.drop
          }
          await as.createTask({
            tasks: {
              name: 'PEXA AUDIT check failed items',
              description: taskDescription,
              dueTimestamp: getActionStepDateTimeFormat(new Date(), '17:00:00'),
              links: {
                action: `${actionStepMatterId}`,
                assignee: conveyancer.actionparticipants[0].links.participant,
              },
            },
          })

          await as.updateDataCollectionRecordValuev2(
            actionStepMatterId,
            auditResultDataCollectionName,
            auditResultDataFieldName,
            'Failed',
          )

          await as.updateDataCollectionRecordValuev2(
            actionStepMatterId,
            failedAuditResultDataCollectionName,
            failedAuditResultDataFieldName,
            taskDescription,
          )
        }

        await logger.info(
          `Successfully processed ${type} for File Id:${fileId}, Job Id:${jobId}, Matter Id:${actionStepMatterId}, audit Guid:${dataverseGuid}`,
        )
        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error creating Manifest for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )
        await status(
          'error-processing',
          `Error creating Manifest: ${JSON.stringify(errJson)}`,
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
