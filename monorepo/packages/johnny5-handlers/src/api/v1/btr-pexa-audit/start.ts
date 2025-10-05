import { getActionStepDateTimeFormat } from '@dbc-tech/actionstep'
import {
  dapr,
  getNumber,
  getString,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { type DbJob, JobModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'

const SATParticipantTypeName = 'Settlement_Audit_Team'

export const start = new Elysia()
  .use(jobContext({ name: 'v1.btr-pexa-audit.start' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '',
    async ({ body, ctx }) => {
      const {
        logger,
        status,
        file: { actionStepMatterId },
        job: { meta, type },
      } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to open PEXA Audit for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)
      await logger.debug('actionStepMatterId', actionStepMatterId)
      await logger.debug('Job meta', meta)

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
      await logger.debug('Powerapp URL', powerappURL)
      if (!powerappURL) {
        const msg = 'Powerapp URL not found in config'
        await logger.error(msg)
        await status('error-processing', msg)
        return dapr.drop
      }

      const dv = ctx.dataverse()
      const as = ctx.actionstep()

      const sat = await as.getActionParticipants({
        filter: `action = ${actionStepMatterId} and participantType.name = '${SATParticipantTypeName}'`,
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
      const actionstepTaskId = getNumber(meta, 'actionstepTaskId', true)!
      const existing = await dv.getBtrPexaAudits({
        $filter: `dbc_dbc_task_id eq ${actionstepTaskId} and dbc_action_id eq ${actionStepMatterId}`,
        $select: 'dbc_btr_pexa_auditid,dbc_dbc_task_id,dbc_action_id,dbc_name',
      })
      await logger.debug(
        `Query result for existing BTR PEXA Audit records for Task Id:${actionstepTaskId}, Matter Id:${actionStepMatterId}`,
        existing,
      )

      if (existing.value.length > 0) {
        const msg = `Existing BTR PEXA Audit record found for Task Id:${actionstepTaskId}, Matter Id:${actionStepMatterId}, ignoring`
        await logger.info(msg)
        await status('error-processing', msg)
        return dapr.drop
      }
      const businessUnitId = await dv.getBusinessUnitByName('BTR')
      await logger.debug(`Business unit ID for BTR: ${businessUnitId}`)

      const dataversePostBody = {
        dbc_name: `Initial Audit`,
        dbc_dbc_task_id: actionstepTaskId,
        dbc_action_id: actionStepMatterId,
        'owningbusinessunit@odata.bind': `businessunits(${businessUnitId})`,
      }
      await logger.debug(`dataverse postbody:`, dataversePostBody)
      const result = await dv.insertBtrPexaAudit(dataversePostBody)

      // read the job meta, replacing any existing audit guid
      const newMeta = meta.map((m) =>
        m.key === 'dataverseGuid'
          ? { ...m, value: result.dbc_btr_pexa_auditid }
          : m,
      )
      // check if the dataverseGuid is already in the meta, if not, add it
      const dataverseGuid = getString(meta, 'dataverseGuid', false)
      await logger.debug(`Dataverse Guid found in meta: ${dataverseGuid}`)
      if (!dataverseGuid) {
        newMeta.push({
          key: 'dataverseGuid',
          value: result.dbc_btr_pexa_auditid,
        })
      }
      const update: Partial<DbJob> = { meta: newMeta }
      await JobModel.findByIdAndUpdate(jobId, update)
      await logger.debug(`Job Id:${jobId} updated with new meta`, newMeta)

      const taskData = {
        tasks: {
          name: 'Settlement Audit Team Complete BTR PEXA Audit (only the SAT to complete this task)',
          dueTimestamp: getActionStepDateTimeFormat(new Date(), '17:00:00'),
          description: `
To be completed by the Settlement Audit Team. 

Link to the audit in Power Apps:
${powerappURL.value}&auditGuid=${result.dbc_btr_pexa_auditid}
`,
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
        `Successfully processed ${type} for File Id:${fileId}, Job Id:${jobId}, Matter Id:${actionStepMatterId}, Task Id:${actionstepTaskId}. New BTR PEXA Audit record created: ${result.dbc_btr_pexa_auditid}, New Actionstep Task Id:${asResult.tasks.id}`,
        result,
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
