import {
  dapr,
  daprResponseSchema,
  getNumber,
  getString,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { jobContext } from '../../plugins/job-context.plugin'

const auditResultDataCollectionName = 'btrhq'
const auditResultDataFieldName = 'settlement_audit'
const failedAuditResultDataCollectionName = 'btrhq'
const failedAuditResultDataFieldName = 'settlement_audit_fail_reason'

export const audit_passed = new Elysia()
  .use(jobContext({ name: 'v1.btr-pexa-audit.audit-passed' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/audit-passed',
    async ({ body, ctx }) => {
      const {
        logger,
        status,
        services,
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
      const actionstepTaskId = getNumber(meta, 'actionstepTaskId', true)
      const dataverseGuid = getString(meta, 'dataverseGuid', true)
      const extra = getString(meta, 'filenote', false)

      await logger.info(
        `Starting ${type} for File Id:${fileId}, Job Id:${jobId}, Matter Id:${actionStepMatterId}, Audit Guid:${dataverseGuid}`,
      )
      try {
        const j5 = services()
        const fileNote = await j5.pexaAuditFileNote(
          actionStepMatterId,
          actionstepTaskId,
          dataverseGuid,
          extra,
        )
        const as = ctx.actionstep()

        await as.createFileNote({
          filenotes: {
            text: fileNote.filenote,
            links: {
              action: `${actionStepMatterId}`,
            },
          },
        })

        await as.updateDataCollectionRecordValuev2(
          actionStepMatterId,
          auditResultDataCollectionName,
          auditResultDataFieldName,
          'Passed',
        )

        await as.updateDataCollectionRecordValuev2(
          actionStepMatterId,
          failedAuditResultDataCollectionName,
          failedAuditResultDataFieldName,
          '',
        )

        await logger.info(
          `Successfully processed ${type} for File Id:${fileId}, Job Id:${jobId}, Matter Id:${actionStepMatterId}, audit Guid:${dataverseGuid}`,
        )
        await status('completed')
        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error processing pexa audit success for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await status(
          'error-processing',
          `Error processing pexa audit success: ${JSON.stringify(errJson)}`,
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
