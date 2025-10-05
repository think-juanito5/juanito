import { type Meta, setJsonContentHeader } from '@dbc-tech/johnny5'
import { type DbJob, FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../../plugins/app-context.plugin'

export const btrPexaAuditValidate = new Elysia()
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'BTR' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/:actionstepTaskId/pexa-audit-submit',
    async ({
      params: { id, actionstepTaskId },
      body: { dataverseGuid, extra },
      status,
      set,
      ctx: { jwt, logger, jobStatus, dataverse, start },
    }) => {
      await logger.info(
        `Processing Audit Validation for Matter Id:${id}, task Id:${actionstepTaskId}`,
      )
      await logger.debug(`Dataverse audit guid`, dataverseGuid)

      const file = await FileModel.findOne({
        tenant: jwt.tenant,
        actionStepMatterId: id,
      })
      await logger.debug(`File Id`, file?.id ?? 'no file found')
      if (!file || !file.id) return status(404, 'File not found')

      const job = await JobModel.findOne({
        fileId: file.id,
        type: 'btr-pexa-audit',
        tenant: jwt.tenant,
      })
      await logger.debug(`Job Id`, job?.id ?? 'no job found')
      if (!job || !job.meta) return status(404, 'Job not found')

      await jobStatus(job.id, file.id, 'in-progress')
      await logger.debug(`Job meta`, job.meta)
      if (extra) {
        // construct a new meta object, replacing any existing filenote
        // list with the extra coming from powerapps
        const newMeta: Meta[] = job.meta.filter((m) => m.key !== 'filenote')
        newMeta.push({
          key: 'filenote',
          value: extra,
        })

        // update the job with the new meta object
        const update: Partial<DbJob> = { meta: newMeta }
        await JobModel.findByIdAndUpdate(job.id, update)
      }

      const dv = dataverse()
      const auditRecords = await dv.getBtrPexaAuditResults({
        $filter: `_dbc_btr_pexa_audit_value eq '${dataverseGuid}'`,
        $select:
          'dbc_company_name, dbc_name, dbc_part, dbc_btr_pexa_audit_question, dbc_answer',
      })
      if (auditRecords.value.length === 0) {
        const msg = `No results found for BTR PEXA Audit record:${dataverseGuid}, ignoring`
        await logger.warn(msg)
        return status(404, msg)
      }

      const failRecords = auditRecords.value.filter((result) => {
        return result.dbc_answer?.toLowerCase() === 'no'
      })

      const isFailed = failRecords.length > 0

      await jobStatus(
        job.id,
        file.id,
        isFailed ? 'hitl-rejected' : 'hitl-validated',
      )

      if (isFailed) {
        await start(
          {
            pubsub: component.longQueues,
            queueName: 'btr-pexa-audit-processing',
            path: 'v1.btr-pexa-audit.audit-failed',
          },
          { fileId: file.id, jobId: job.id, tenant: jwt.tenant },
        )
      } else {
        await start(
          {
            pubsub: component.longQueues,
            queueName: 'btr-pexa-audit-processing',
            path: 'v1.btr-pexa-audit.audit-passed',
          },
          { fileId: file.id, jobId: job.id, tenant: jwt.tenant },
        )
      }

      await logger.info(
        `Finished processing Pexa Audit Validation for Matter Id:${id}, task Id:${actionstepTaskId}`,
      )

      set.status = 'No Content'
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        id: t.Number(),
        actionstepTaskId: t.Number(),
      }),
      body: t.Object({
        dataverseGuid: t.String(),
        extra: t.Optional(t.String()),
      }),
      response: {
        204: t.Void(),
        400: t.String(),
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Submit PEXA Audit validation request',
        tags: ['Johnny5', 'Jobs', 'Pexa Audit'],
      },
    },
  )
