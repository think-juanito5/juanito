import {
  type Action,
  type ActionParticipantPostMultiple,
} from '@dbc-tech/actionstep'
import type { Priority, TaskPut } from '@dbc-tech/actionstep'
import {
  type MatterCreateBasics,
  component,
  dapr,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { participantTypes } from '@dbc-tech/johnny5-btr'
import { FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'

export const create = new Elysia()
  .use(jobContext({ name: 'v1.btr-matter-opening.create' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '',
    async ({ body, ctx }) => {
      const { logger, next, status, job, profile, johnny5Config } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to open Matter for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const { meta } = job
      await logger.debug('Job meta', meta)

      const templateMatterId = meta?.find(
        (m) => m.key === 'templateMatterId',
      )?.value
      if (!templateMatterId) {
        await logger.error('templateMatterId is missing from meta collection')
        await status(
          'error-processing',
          'templateMatterId is missing from meta collection',
        )
        return dapr.drop
      }
      const templateMatterNumber = +templateMatterId

      const testMode = meta?.find((m) => m.key === 'testMode')?.value
      let matterName = meta?.find((m) => m.key === 'matterName')?.value
      if (!matterName) {
        await logger.error('matterName is missing from meta collection')
        await status(
          'error-processing',
          'matterName is missing from meta collection',
        )
        return dapr.drop
      }
      if (testMode === 'true') {
        matterName = `[test] ${matterName}`
      }
      const additionalInfo = meta?.find(
        (m) => m.key === 'additionalInfo',
      )?.value

      const actionstep = ctx.actionstep()

      await logger.debug('Fetching template action participants')

      const templateAP = await actionstep.getActionParticipants({
        filter: `action = ${templateMatterNumber}`,
        include: 'action',
      })
      if (!templateAP || !templateAP.linked?.actions)
        throw new Error(`file template: ${templateMatterNumber} not found`)

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
        throw new Error('Trust account not found in config')

      await logger.debug('Creating new matter')
      const matterId = await actionstep.createMatter(newMatterPostBody, [
        trustAccountConfig.value,
      ])

      if (action.links.assignedTo) {
        await logger.debug(
          `Assigning matter to participant id: ${action.links.assignedTo}`,
        )
        await actionstep.updateAction(matterId, {
          actions: { links: { assignedTo: action.links.assignedTo } },
        })
      }

      await logger.debug('Updating intent')
      const intent = job.serviceType
      await actionstep.updateDataCollectionRecordValuev2(
        matterId,
        'convdet',
        'ConveyType',
        intent === 'conveyancing-buy' ? 'Purchase' : 'Sale',
      )

      if (additionalInfo) {
        await actionstep.updateDataCollectionRecordValuev2(
          matterId,
          'property',
          'additnotes',
          additionalInfo,
        )
      }

      await logger.debug('Updating job status')

      await JobModel.findByIdAndUpdate(jobId, {
        matterIds: [{ number: matterId, status: 'created' }],
      })

      await FileModel.findByIdAndUpdate(fileId, {
        actionStepMatterId: matterId,
      })

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

      await logger.debug('Linking action participants', ap)

      await profile(
        () => actionstep.linkMultipleActionParticipants(ap),
        'actionstep.linkMultipleActionParticipants',
      )

      await logger.info(
        `Created Matter:${matterId} for File Id:${fileId}, Job Id:${jobId}`,
      )

      const createMatterTask = async (
        name: string,
        assigneeId: number,
        priority?: Priority,
      ) => {
        const t: Partial<TaskPut> = {
          tasks: {
            name,
            description: name,
            priority,
            links: {
              action: `${matterId}`,
              assignee: `${assigneeId}`,
            },
          },
        }
        await actionstep.createTask(t as TaskPut)
      }

      const tasksAssigneeId = ap.actionparticipants.find(
        (ap) => ap.links.participantType === `${participantTypes.conveyancer}`,
      )?.links.participant

      if (!tasksAssigneeId) {
        await logger.error('Conveyancer does not exist!')
        throw new Error('Conveyancer does not exist!')
      }
      await createMatterTask(
        'Contract Saved | Data Entered | File Notes Completed',
        +tasksAssigneeId,
        'Normal',
      )
      await createMatterTask(
        'First Call to Client | Agent',
        +tasksAssigneeId,
        'High',
      )
      await logger.info(`Created tasks for Matter:${matterId}`)

      await logger.info(
        `Finished opening Matter:${matterId} for File Id:${fileId}, Job Id:${jobId}`,
      )

      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-btr-matter-opening',
        path: 'v1.btr-matter-opening.update',
      })

      return dapr.success
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
