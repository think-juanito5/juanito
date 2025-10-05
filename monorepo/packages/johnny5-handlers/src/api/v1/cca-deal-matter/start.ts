import {
  type AustralianState,
  type Intent,
  dapr,
  getServiceType,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { component, daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import {
  OnlineConversionNotes,
  PipedriveAdditionalInfo,
  type PipedriveAdditionalInfoType,
  customFields,
  matterTypeId,
  pipedriveAdditionalInfoTypes,
  pipedriveConveyancingTypeNewfield,
  state as pipedriveState,
} from '@dbc-tech/pipedrive'
import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { serializeError } from 'serialize-error'
import { Ok } from 'ts-results-es'
import { bstIdMapIntent } from '../../../johnny5/cca/constants'
import { checkOnlineConversion } from '../../../johnny5/cca/utils/online-conversion.utils'
import { filenotePipedriveSvc } from '../../plugins/filenotes-pipedrive.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'v1.cca-deal-matter.start' }))
  .use(filenotePipedriveSvc)
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/start',
    async ({ body, ctx, filenotePipedrive }) => {
      const { logger, next, status, file, johnny5Config } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const dealId = file.pipedriveDealId!
      const pipedriveV2 = ctx.pipedriveV2()

      await logger.info(
        `Starting to Matter Deal (start @1) for File Id:${fileId}, Job Id:${jobId} dealId:${dealId}`,
      )
      await logger.debug('Event payload', body)

      try {
        await filenotePipedrive
          .deal(dealId)
          .notify('matter-creation-initiated')
          .exec()

        const deal = await pipedriveV2.getDeal(dealId)
        const bst = deal.data.custom_fields
          ? deal.data.custom_fields[customFields.bst]
          : undefined
        if (!bst)
          throw new Error(
            `Deal does not contain a valid custom field (${customFields.bst}) containing BST value`,
          )

        const bstId: number = +bst

        const pipdriveStateId = deal.data.custom_fields
          ? deal.data.custom_fields[customFields.state]
          : undefined

        if (!pipdriveStateId) {
          throw new Error(
            `Deal does not contain a valid custom  field (${customFields.state}) containing State value`,
          )
        }
        const additionalInfoCode = deal.data.custom_fields
          ? deal.data.custom_fields[customFields.additionalInfo]
          : undefined
        const leadJourney = deal.data.custom_fields
          ? (deal.data.custom_fields[customFields.leadJourney] as
              | string
              | undefined)
          : undefined

        await logger.info(
          `Deal additionalInfo Code value: ${additionalInfoCode} and leadJourney: ${leadJourney}`,
        )
        const newConveyancingTypeId = deal.data.custom_fields
          ? deal.data.custom_fields[customFields.newConveyancingType]
          : undefined

        const newConveyancingType = newConveyancingTypeId
          ? pipedriveConveyancingTypeNewfield[+newConveyancingTypeId]
          : undefined
        await logger.info(
          `Deal custom field (${customFields.newConveyancingType}) containing newConveyancingType value: ${newConveyancingType}`,
        )

        const additionalInfo: PipedriveAdditionalInfoType | undefined =
          additionalInfoCode
            ? pipedriveAdditionalInfoTypes[+additionalInfoCode]
            : undefined

        const intent = bstIdMapIntent[bstId] as Intent
        const state = pipedriveState[+pipdriveStateId] as AustralianState
        const isSdsTransaction =
          additionalInfo === PipedriveAdditionalInfo.sds ||
          leadJourney === OnlineConversionNotes.sds

        await logger.info(
          `Deal additionalInfo value: ${additionalInfo} and leadJourney: ${leadJourney} and isSdsTransaction: ${isSdsTransaction}`,
        )

        const onlineConv = await checkOnlineConversion(
          { intent, state },
          deal.data.custom_fields,
        )

        const tplKey = isSdsTransaction
          ? 'onlineconversion-sds'
          : onlineConv
            ? 'onlineconversion'
            : state
        const cfgTemplateName = `actionstep-${intent}-matter-template-participants`

        await logger.info(
          `State [${state}] tplKey: ${tplKey} intent: ${intent} {oc,tpl,cfg} `,
          {
            onlineConv,
            tplKey,
            cfgTemplateName,
          },
        )

        const tplParticipantIds = await johnny5Config.get(cfgTemplateName, [
          tplKey,
        ])
        if (!tplParticipantIds || !tplParticipantIds.value) {
          throw new Error(`No tplParticipantIds found for state: ${tplKey}`)
        }
        await logger.debug(
          `State [${state}] tplParticipantIds Id: ${tplParticipantIds.value}`,
        )

        const actionTypeId = matterTypeId[state]
        if (!actionTypeId) {
          throw new Error(`No actionTypeId found for state: ${state}`)
        }
        await logger.debug(`State [${state}] actionTypeId Id: ${actionTypeId}`)

        const session = await mongoose.startSession()
        const result = await session.withTransaction(async () => {
          const metaEntries = [
            { key: 'participantIds', value: tplParticipantIds.value },
            { key: 'matterName', value: 'Pending' },
            { key: 'actionType', value: `${actionTypeId}` },
          ]

          if (newConveyancingType) {
            metaEntries.push({
              key: 'conveyancingType',
              value: newConveyancingType,
            })
          }
          if (onlineConv) {
            metaEntries.push({ key: 'onlineConversionType', value: onlineConv })
          }
          if (additionalInfo) {
            metaEntries.push({
              key: 'additionalInfo',
              value: additionalInfo,
            })
          }

          await logger.debug('Start meta entries:', metaEntries)

          const serviceType = getServiceType(intent)
          const job = await JobModel.findByIdAndUpdate(
            jobId,
            {
              $set: { serviceType },
              $push: {
                meta: {
                  $each: metaEntries,
                },
              },
            },
            { session },
          )

          await logger.debug('Updating job serviceType and meta')

          const file = await FileModel.findByIdAndUpdate(
            fileId,
            {
              serviceType,
            },
            { session },
          )

          await logger.debug('Updating file serviceType')
          return Ok({ job, file })
        })

        await session.endSession()

        if (!result.ok) {
          throw new Error(
            `Transaction: Error processing CCA Deal Matter in Start stage!`,
          )
        }

        await status('in-progress')
        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-deal-matter',
          path: 'v1.cca-deal-matter.create',
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
