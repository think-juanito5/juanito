import {
  type AdditionalInfoTypes,
  type MatterDetails,
  MatterStatusService,
} from '@dbc-tech/cca-common'
import {
  type Intent,
  J5Config,
  type MatterReadinessState,
  type ReadinessEntityType,
  dapr,
  getString,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import {
  type DbJob,
  JobModel,
  MatterCreateModel,
} from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import {
  type AustralianState,
  jobCloudEventSchema,
} from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { CcaMatterPopulator } from '../../../johnny5/cca-matter.populator-service'
import { settlmentCalculatorMatterUpdater } from '../../../johnny5/cca/utils/matter-update'
import { filenotePipedriveSvc } from '../../plugins/filenotes-pipedrive.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const populate_stepchange = new Elysia()
  .use(jobContext({ name: 'v1.cca-deal-matter.populate-stepchange' }))
  .use(filenotePipedriveSvc)
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/populate-stepchange',
    async ({ body, ctx, filenotePipedrive }) => {
      const { logger, status, file, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const dealId = file.pipedriveDealId!
      const j5config = ctx.johnny5Config

      await logger.info(
        `Starting to populate Matter (Stepchange) for File Id:${fileId}, Job Id:${jobId} dealId:${dealId}`,
      )

      await logger.debug('Event payload', body)
      try {
        const { meta } = job
        await logger.debug('Job meta', meta)
        if (!meta) {
          await logger.error('Meta is missing from job')
          await status('error-processing', 'Meta is missing from job')
          return dapr.drop
        }

        const matterData = await MatterCreateModel.findOne({ jobId })
        if (!matterData)
          throw new Error(
            `Manifest not found for File Id:${fileId}, Job Id:${jobId}`,
          )

        const matterId = matterData.matterId
        if (!matterId)
          throw new Error(
            `Matter Id unknown from Manifest for File Id:${fileId}, Job Id:${jobId}`,
          )

        const populator = new CcaMatterPopulator(
          ctx.johnny5Config,
          ctx.actionstep(),
          ctx.logger,
          matterId,
        )

        const { manifest } = matterData

        const isOnlineConv = meta?.some((m) => m.key === 'onlineConversionType')

        const state = manifest.meta?.find((m) => m.key === 'state')
          ?.value as AustralianState

        const natureProp = manifest.meta?.find(
          (m) => m.key === 'natureOfProperty',
        )?.value

        const sdsInfo = meta
          ? getString(meta, 'additionalInfo', false)
          : undefined
        const sdsOnlineConv = sdsInfo === 'Seller disclosure statement'
        await logger.debug(
          `Matter Id: ${matterId} isOnlineConv: ${isOnlineConv}, natureProp: ${natureProp}, sdsOnlineConv: ${sdsOnlineConv}`,
        )
        await logger.info('Online Conversion:', {
          sdsInfo,
          isOnlineConv,
          natureProp,
          sdsOnlineConv,
        })

        if (matterData.status === 'stepchange') {
          matterData.status = 'completed'
          matterData.completedOn = new Date()
          await matterData.save()
          let nodeId: string | undefined
          const hasStepchange = isOnlineConv || sdsOnlineConv

          if (isOnlineConv) {
            nodeId = await populator.onlineConversionProcess(
              matterId,
              natureProp,
            )
          } else if (sdsOnlineConv) {
            const assignedToParticipantId = await j5config.get(
              J5Config.cca.actionstep.draftingId,
            )

            if (!assignedToParticipantId) {
              throw new Error(
                `Assigned To Participant Id not found in Job Meta for File Id:${fileId}, Job Id:${jobId}`,
              )
            }
            nodeId = await populator.SdsChangeStepProcess(
              matterId,
              +assignedToParticipantId.value,
            )
          }
          await logger.info(
            `StepChange to Node Id: ${nodeId ?? 'N/A'} hasStepchange:${hasStepchange} isOC:${isOnlineConv} sdsOC:${sdsOnlineConv} for Matter Id: ${matterId}`,
          )

          const shouldUpdateReadinessStatus = Boolean(nodeId) || !hasStepchange
          if (shouldUpdateReadinessStatus) {
            const detailsReady: ReadinessEntityType[] = [
              'client',
              'conveyancer',
              'tenant',
            ]
            if (hasStepchange) {
              detailsReady.push('stepchange')
            }

            const matterStatusSvc = new MatterStatusService()
            const details: MatterReadinessState = {
              matterId,
              detailsReady,
            }
            await logger.info(
              `Updating readiness status for matter ${matterId}`,
              details,
            )

            const result = await matterStatusSvc.updateReadinessStatus(
              matterId,
              details,
            )

            if (result.err) {
              logger.warn(
                `Failed to update readiness status for matter ${matterId}: ${result.val}`,
              )
            }
          }
        }

        const updateJob: Partial<DbJob> = {
          completedOn: new Date(),
        }
        await logger.debug(`Updating Job: ${jobId}`, updateJob)
        await JobModel.findByIdAndUpdate(jobId, updateJob)

        await JobModel.updateOne(
          { _id: jobId, 'matterIds.number': matterId },
          { 'matterIds.$.status': 'populated' },
        )

        const matterName = job.meta?.find((m) => m.key === 'matterName')?.value

        const clientName = manifest.meta?.find(
          (m) => m.key === 'clientName',
        )?.value

        const matterTypeName = manifest.meta?.find(
          (m) => m.key === 'matterTypeName',
        )?.value

        const intent = manifest.meta?.find((m) => m.key === 'intent')
          ?.value as Intent

        const postCode = manifest.meta?.find((m) => m.key === 'postCode')?.value
        const concierge = manifest.meta?.find(
          (m) => m.key === 'concierge',
        )?.value

        const additionalInfo = manifest.meta?.find(
          (m) => m.key === 'additionalInfo',
        )?.value as AdditionalInfoTypes | undefined

        const newMatterEnabled = await j5config.get(
          J5Config.cca.ccaDealMatterNewNameEnabled,
        )

        const matterDetails: MatterDetails = {
          matterName:
            newMatterEnabled?.value !== 'true'
              ? matterName
              : `Matter ${matterId} (name pending) has been created for deal Id ${dealId}`,
          clientName,
          matterTypeName,
          postCode,
          concierge,
          additionalInfo,
        }

        await logger.debug('Matter Details:', {
          ...matterDetails,
          intent,
          state,
        })

        await filenotePipedrive
          .deal(dealId)
          .details(matterDetails)
          .notify('matter-created-details', 'matter-creation-completed')
          .handleCompleted()
          .exec()

        await status('completed')

        await logger.info(
          `Finished populating Matter for File Id:${fileId}, Job Id:${jobId} newMatterEnabled:${newMatterEnabled?.value}`,
        )

        const syncMatterService = ctx.syncMatter()
        await settlmentCalculatorMatterUpdater(syncMatterService, logger, {
          dealId,
          matterId,
          matterName,
          state,
          intent,
        })

        await logger.info(
          `Finished updating Deal/Matter: ${dealId}/${matterId} in Calculator for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error('Error populating Matter (Stepchange)', errJson)

        await filenotePipedrive
          .deal(dealId)
          .notify('matter-creation-error')
          .exec()

        await status(
          'error-processing',
          `Error Populating Matter Stepchange: ${JSON.stringify(errJson)}`,
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
