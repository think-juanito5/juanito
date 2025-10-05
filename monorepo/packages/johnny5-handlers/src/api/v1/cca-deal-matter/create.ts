import type {
  ActionParticipantPostMultiple,
  Priority,
  TaskPut,
} from '@dbc-tech/actionstep'
import { HttpError } from '@dbc-tech/http'
import {
  J5Config,
  type MatterCreateBasics,
  component,
  dapr,
  getNumber,
  getString,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { PipedriveAdditionalInfo } from '@dbc-tech/pipedrive'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { participantTypes } from '../../../johnny5/cca/constants'
import { datalakeMatterUpdater } from '../../../johnny5/cca/utils/matter-update'
import { datalakeDb } from '../../plugins/db.datalake.plugin'
import { filenotePipedriveSvc } from '../../plugins/filenotes-pipedrive.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const create = new Elysia()
  .use(jobContext({ name: 'v1.cca-deal-matter.create' }))
  .use(datalakeDb)
  .use(filenotePipedriveSvc)
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/create',
    async ({ body, datalakeDb, ctx, request, filenotePipedrive }) => {
      const {
        logger,
        next,
        status,
        job,
        profile,
        file,
        johnny5Config,
        safeExecute,
      } = ctx

      const { data } = body
      const { fileId, jobId } = data
      const dealId = file.pipedriveDealId!

      await logger.info(
        `Starting to Matter Deal (create) for File Id:${fileId}, Job Id:${jobId} dealId:${dealId}`,
      )
      await logger.debug('Event payload', body)

      try {
        const { meta, serviceType } = job
        await logger.debug('Job meta', meta)
        if (!meta) {
          await logger.error('Meta is missing from job')
          await status('error-processing', 'Meta is missing from job')
          return dapr.drop
        }

        const tplParticipantIds = getString(meta, 'participantIds', false)

        if (!tplParticipantIds) {
          await logger.error(
            'tplParticipantIds is missing from meta collection',
          )
          await status(
            'error-processing',
            'templateMatterId is missing from meta collection',
          )
          return dapr.drop
        }
        const actionTypeId = getNumber(meta, 'actionType', false)
        if (!actionTypeId) {
          await logger.error('actionTypeId is missing from meta collection')
          await status(
            'error-processing',
            'actionTypeId is missing from meta collection',
          )
          return dapr.drop
        }

        const sanitizeParticipants = (
          input: string,
        ): Record<string, number> => {
          const fixedString = input.replace(/(\d+):/g, '"$1":')
          return JSON.parse(fixedString)
        }

        const templateParticipants = sanitizeParticipants(tplParticipantIds)

        await logger.debug('templateParticipants:', templateParticipants)

        const matterName = getString(meta, 'matterName', false)
        if (!matterName) {
          await logger.error('matterName is missing from meta collection')
          await status(
            'error-processing',
            'matterName is missing from meta collection',
          )
          return dapr.drop
        }

        const additionalInfo = getString(meta, 'additionalInfo', false)

        await logger.info(
          `Deal containing additionalInfo value:`,
          additionalInfo,
        )
        if (!additionalInfo) {
          await logger.warn('additionalInfo is missing from meta collection')
        }

        const actionstep = ctx.actionstep()
        await logger.debug('Fetching template action participants')

        const newMatterPostBody: MatterCreateBasics = {
          name: matterName,
          matter_type_id: actionTypeId,
        }

        const trustAccountConfig = await johnny5Config.get(
          J5Config.actionstep.trustAccount,
        )
        if (!trustAccountConfig)
          throw new Error('Trust account not found in config')

        await logger.debug('Creating new matter')
        const matterId = await actionstep.createMatter(newMatterPostBody, [
          trustAccountConfig.value,
        ])

        await logger.debug('Updating job status')

        await JobModel.findByIdAndUpdate(jobId, {
          matterIds: [{ number: matterId, status: 'created' }],
        })

        await FileModel.findByIdAndUpdate(fileId, {
          actionStepMatterId: matterId,
        })

        const isOnlineConv = getString(meta, 'onlineConversionType', false)
        const assignedToTemplate =
          isOnlineConv || additionalInfo === PipedriveAdditionalInfo.sds
            ? J5Config.cca.actionstep.draftingId
            : J5Config.actionstep.conveyancingAdministrationId

        const matterAssignedTo = await johnny5Config.get(assignedToTemplate)
        if (!matterAssignedTo) {
          throw new Error(`#CCA/Admin Id not found in J5 config!`)
        }
        await actionstep.updateAction(matterId, {
          actions: { links: { assignedTo: matterAssignedTo.value } },
        })

        const conveyancingType = getString(meta, 'conveyancingType', false)
        const conveyancingTypeValue =
          conveyancingType ??
          (serviceType === 'conveyancing-buy' ? 'Purchase' : 'Sale')

        await actionstep.updateDataCollectionRecordValuev2(
          matterId,
          'convdet',
          'ConveyType',
          conveyancingTypeValue,
        )

        if (additionalInfo) {
          await actionstep.updateDataCollectionRecordValuev2(
            matterId,
            'engage',
            'AdditionalInfo',
            additionalInfo,
          )
        }

        const ap: ActionParticipantPostMultiple = {
          actionparticipants: Object.keys(templateParticipants).map((key) => ({
            links: {
              action: `${matterId}`,
              participant: `${templateParticipants[key]}`,
              participantType: key,
            },
          })),
        }

        await logger.debug(
          `Linking action participants to matter: ${JSON.stringify(ap)}`,
          { matterId, fileId, jobId },
        )

        await profile(
          () =>
            safeExecute(
              async () => actionstep.linkMultipleActionParticipants(ap),
              (error) => {
                if (error instanceof HttpError) {
                  return (
                    error.status === 400 &&
                    error.message.includes(
                      'Selected participant already exists for this action',
                    )
                  )
                }
                return false
              },
            ),
          'actionstep.linkMultipleActionParticipants',
        )

        await logger.info(
          `Created Matter:${matterId} for File Id:${fileId}, Job Id:${jobId}`,
        )
        await status('matter-created')

        const createMatterTask = async (
          name: string,
          description: string,
          assigneeId: number,
          priority?: Priority,
        ) => {
          const t: Partial<TaskPut> = {
            tasks: {
              name,
              description,
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
          (ap) => ap.links.participantType === `${participantTypes.adminStaff}`,
        )?.links.participant

        if (!tasksAssigneeId) {
          await logger.error('Admin Staff does not exist!')
          throw new Error('Admin Staff does not exist!')
        }

        if (!isOnlineConv) {
          await createMatterTask(
            'Matter Allocation Email',
            'Please complete this task which will issue an email notification to the file owner to advise they have been allocated a matter',
            +tasksAssigneeId,
            'Normal',
          )
          await logger.info(`Created tasks for Matter:${matterId}`)
        }

        await datalakeMatterUpdater(
          datalakeDb,
          dealId!,
          matterId,
          request,
          logger,
        )

        await logger.info(
          `Finished updating Deal-Matter in Datalake for File Id:${fileId}, Job Id:${jobId}`,
          { dealId, matterId },
        )

        await logger.info(
          `Finished opening Matter:${matterId} for File Id:${fileId}, Job Id:${jobId}`,
        )

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-deal-matter',
          path: 'v1.cca-deal-matter.manifest-create',
        })

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error creating Matter for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await filenotePipedrive
          .deal(dealId)
          .notify('matter-creation-error')
          .exec()

        await status(
          'error-processing',
          `Error creating Matter: ${JSON.stringify(errJson)}`,
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
