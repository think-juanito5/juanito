import { getActionStepDateTimeFormat } from '@dbc-tech/actionstep'
import {
  dapr,
  getNumberArray,
  getString,
  getStringArray,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { JobModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { jobContext } from '../../plugins/job-context.plugin'
import { compileTaskDescription } from './index'

const SATParticipantTypeName = 'Settlement_Audit_Team'

export const subsequentAuditStart = new Elysia()
  .use(jobContext({ name: 'v1.btr-pexa-audit.subsequentAuditStart' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/subsequent-audit-start',
    async ({ body, ctx }) => {
      const {
        logger,
        status,
        file: { actionStepMatterId },
        job: { meta, type, id: jobId, fileId },
      } = ctx
      await logger.debug('Event payload', body)
      if (!actionStepMatterId) {
        const msg = 'File does not have an Actionstep Matter Id'
        await logger.warn(msg)
        await status('error-processing', msg)
        return dapr.drop
      }
      if (!meta) {
        const msg = 'No meta provided'
        await logger.warn(msg)
        await status('error-processing', msg)
        return dapr.drop
      }
      const powerappURL = await ctx.johnny5Config.get(
        'btr_pexa_audit_powerapps_app_url',
      )
      if (!powerappURL) {
        const msg = 'Powerapp URL not found in config'
        await logger.warn(msg)
        await status('error-processing', msg)
        return dapr.drop
      }

      const dv = ctx.dataverse()
      const as = ctx.actionstep()

      const sat = await as.getActionParticipants({
        filter: `action=${actionStepMatterId} and participantType.name='${SATParticipantTypeName}'`,
      })

      if (!sat.actionparticipants || sat.actionparticipants.length === 0) {
        const msg = `No Settlement Audit Team found for Matter Id:${actionStepMatterId}`
        await logger.info(msg)
        await status('error-processing', msg)
        return dapr.drop
      }

      await logger.info(
        `Starting ${type} for File Id:${fileId}, Job Id:${jobId}, Matter Id:${actionStepMatterId}`,
      )
      const actionstepTaskIds = getNumberArray(meta, 'actionstepTaskId', true)
      const dataverseGuids = getStringArray(meta, 'dataverseGuid', true)
      const current = actionstepTaskIds.at(-1)
      const previousAuditGuid = dataverseGuids.at(-1)!

      // check to make sure the current task doesn't already have an audit record
      const existing = await dv.getBtrPexaAudits({
        $filter: `dbc_dbc_task_id eq ${current} and dbc_action_id eq ${actionStepMatterId}`,
        $select: 'dbc_btr_pexa_auditid,dbc_dbc_task_id,dbc_action_id,dbc_name',
      })
      await logger.debug(
        `Query result for existing BTR PEXA Audit records for Task Id:${current}, 
          Matter Id:${actionStepMatterId}`,
        existing,
      )

      if (existing.value.length > 0) {
        const msg = `Existing BTR PEXA Audit record found for Task Id:${current}, 
          Matter Id:${actionStepMatterId}, ignoring`
        await logger.info(msg)
        await status('error-processing', msg)
        return dapr.drop
      }

      const businessUnitId = await dv.getBusinessUnitByName('BTR')
      await logger.debug(`Business unit ID for BTR: ${businessUnitId}`)

      // create the new BTR PEXA Audit record
      const data = {
        dbc_name: `Subsequent Audit (${dataverseGuids.length + 1})`,
        dbc_dbc_task_id: current,
        dbc_action_id: actionStepMatterId,
        'owningbusinessunit@odata.bind': `businessunits(${businessUnitId})`,
      }
      await logger.debug(`dataverse postbody:`, data)
      const result = await dv.insertBtrPexaAudit(data)

      // need to update the job with the new audit id
      const existingGuids = getString(meta, 'dataverseGuid', true)
      await JobModel.updateOne(
        { _id: jobId, 'meta.key': 'dataverseGuid' },
        {
          $set: {
            'meta.$.value': `${existingGuids},${result.dbc_btr_pexa_auditid}`,
          },
        },
      )

      let prevAuditFailedDescription
      try {
        prevAuditFailedDescription = await compileTaskDescription(
          ctx.dataverse,
          previousAuditGuid,
        )
      } catch (error) {
        const msg = `Error compiling task description for BTR PEXA Audit record:${previousAuditGuid}, Matter Id:${actionStepMatterId}, ignoring`
        await logger.error(msg, serializeError(error))
        return dapr.retry
      }

      // get the failed audit results from the previous audit
      const previousAuditResults = await dv.getBtrPexaAuditResults({
        $filter: `(_dbc_btr_pexa_audit_value eq '${previousAuditGuid}')
          and ((dbc_answer eq 'No') or (dbc_part eq 'SETUP' and dbc_answer ne 'No'))`,
        $select:
          'dbc_company_name, dbc_name, dbc_part, dbc_btr_pexa_audit_question, dbc_answer, dbc_potential_answers',
      })
      await logger.debug(
        `BTR PEXA Audit record:${previousAuditGuid} has ${previousAuditResults.value.length} results`,
      )
      if (!(previousAuditResults.value.length > 0)) {
        const msg = `No results found for BTR PEXA Audit record:${previousAuditGuid}, fail`
        await logger.error(msg, previousAuditResults)
        await status('error-processing', msg)
        return dapr.drop
      }

      // want to group by dbc_company_name and dbc_name, count the number of
      // dbc_answer = 'No' for each group
      const groupedResults = previousAuditResults.value.reduce(
        (acc, row) => {
          const key = `${row.dbc_company_name}-${row.dbc_name}`
          if (!acc[key]) {
            acc[key] = {
              dbc_company_name: row.dbc_company_name!,
              dbc_name: row.dbc_name!,
              count: 0,
            }
          }
          if (row.dbc_answer === 'No') {
            acc[key].count += 1
          }
          return acc
        },
        {} as Record<
          string,
          { dbc_company_name: string; dbc_name: string; count: number }
        >,
      )

      // filter previousAuditResults, using groupedResults as a guide
      // to remove the rows for a dbc_company_name,dbc_name combination
      // if that combination has a count of 0
      const filteredResults = previousAuditResults.value.filter((row) => {
        const key = `${row.dbc_company_name}-${row.dbc_name}`
        return groupedResults[key] && groupedResults[key].count > 0
      })

      // reshape the results to fit bulk upserter
      const newAuditRows = filteredResults.map((row) => {
        return {
          'dbc_btr_pexa_audit@odata.bind': `dbc_btr_pexa_audits(${result.dbc_btr_pexa_auditid})`,
          dbc_company_name: row.dbc_company_name || '',
          dbc_name: row.dbc_name,
          dbc_part: row.dbc_part,
          dbc_btr_pexa_audit_question: row.dbc_btr_pexa_audit_question,
          dbc_answer:
            row.dbc_part === 'SETUP'
              ? row.dbc_answer === 'No'
                ? null
                : row.dbc_answer
              : null,
          dbc_potential_answers: JSON.parse(row.dbc_potential_answers!),
        }
      })
      try {
        await dv.bulkInsert('dbc_btr_pexa_audit_results', newAuditRows)
      } catch (e) {
        const msg = serializeError(e)
        await logger.error(JSON.stringify(msg), previousAuditResults)
        await status('error-processing', JSON.stringify(msg))
        return dapr.drop
      }

      const taskData = {
        tasks: {
          name: 'Settlement Audit Team- VERIFY FAILED PEXA AUDIT ITEMS ADDRESSED (to be completed by SAT team only)',
          dueTimestamp: getActionStepDateTimeFormat(new Date(), '17:00:00'),
          description: `
Task to be completed by the Settlement Audit Team, NOT Franchisee.

**Previous Audit Failed Items:**
${prevAuditFailedDescription}

Link to the audit in Power Apps:
${powerappURL.value}&auditGuid=${result.dbc_btr_pexa_auditid}

Reminder: any disputed items please email compliance@bytherules.com.au
          `.trim(),
          links: {
            action: `${actionStepMatterId}`,
            assignee: sat.actionparticipants[0].links.participant,
          },
        },
      }
      await logger.debug(`actionstep task postbody:`, taskData)
      const asResult = await as.createTask(taskData)

      await status('hitl-waiting')
      await logger.info(
        `Successfully processed ${type} for File Id:${fileId}, 
        Job Id:${jobId}, Matter Id:${actionStepMatterId}, 
        Task Id:${current}. 
        New BTR PEXA Audit record created: ${result.dbc_btr_pexa_auditid}, 
        New Actionstep Task Id:${asResult.tasks.id}`,
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
