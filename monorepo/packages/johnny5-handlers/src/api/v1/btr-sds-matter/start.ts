import { AddressValidationService } from '@dbc-tech/google'
import {
  type PropertyAddress,
  btrSdsClientWebhookSchema,
  dapr,
  getString,
  getValue,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import {
  BtrAgentModel,
  type DbBtrAgent,
  JobModel,
} from '@dbc-tech/johnny5-mongodb'
import { component, daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { SdsErrorMessages } from '../../../johnny5/btr/constants'
import {
  SdsAppError,
  handleSdsAppError,
} from '../../../johnny5/btr/utils/error-utils'
import { getMatterTemplateId } from '../../../johnny5/btr/utils/leads-util'
import { googleValidatedAddress } from '../../../johnny5/btr/utils/property-utils'
import { composeMatterName } from '../../../johnny5/btr/utils/string-utils'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'v1.btr-sds-matter.start' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/start',
    async ({ body, ctx }) => {
      const { logger, status, next, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Start #SDS Matter Creation for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('SDS Event payload', body)

      try {
        const { meta } = job
        await logger.debug('SDS Job meta', meta)
        if (!meta) {
          throw new SdsAppError(
            SdsErrorMessages.MISSING_JOB_META.userMessage,
            'MISSING_JOB_META',
          )
        }

        const webhook = getValue(
          meta,
          'webhookPayload',
          btrSdsClientWebhookSchema,
          false,
        )
        if (!webhook) {
          throw new SdsAppError(
            SdsErrorMessages.MISSING_PAYLOAD_META.userMessage,
            'MISSING_PAYLOAD_META',
          )
        }

        const { property_address, agent, sellers, agent_id, conveyancer_area } =
          webhook
        if (!property_address || !agent || !sellers) {
          throw new SdsAppError(
            SdsErrorMessages.INCOMPLETE_SDS_WEBHOOK.userMessage,
            'INCOMPLETE_SDS_WEBHOOK',
          )
        }

        const getAddressComponents = async (
          addrInput: string,
        ): Promise<PropertyAddress | undefined> => {
          const googleSvc = new AddressValidationService({
            apiKey: process.env.GOOGLE_API_KEY!,
          })
          const addr = await googleValidatedAddress(
            googleSvc,
            addrInput,
            logger,
          )
          if (!addr) {
            await logger.error(`Invalid address input: ${addrInput}`)
          }
          return addr
        }

        const validatedAddr = await getAddressComponents(property_address)
        if (!validatedAddr) {
          throw new SdsAppError(
            SdsErrorMessages.INVALID_SDS_PROPERTY.userMessage,
            'INVALID_SDS_PROPERTY',
            {
              property_address,
            },
          )
        }

        const matterTemplateId = await getMatterTemplateId(
          logger,
          job.tenant,
          agent_id,
          conveyancer_area,
          +validatedAddr.postcode,
        )

        if (!matterTemplateId) {
          throw new SdsAppError(
            SdsErrorMessages.INVALID_CONVEYANCER_AREA.userMessage,
            'INVALID_CONVEYANCER_AREA',
            {
              conveyancer_area,
              postcode: validatedAddr.postcode,
            },
          )
        }

        const isTestMode = getString(meta, 'testMode', false) === 'true'
        await logger.info(
          `SDS Matter is in test mode: ${isTestMode} Template ID: ${matterTemplateId}`,
        )

        const matterName = composeMatterName(sellers, isTestMode)
        await logger.debug(`Matter Name:`, matterName)

        if (matterTemplateId) {
          meta.push({
            key: 'templateMatterId',
            value: String(matterTemplateId),
          })
        }
        meta.push({ key: 'matterName', value: matterName })
        if (agent_id) {
          meta.push({ key: 'agentId', value: String(agent_id) })
        } else {
          await logger.warn('SDS agentId is not available from webhookPayload!')
        }
        meta.push({
          key: 'validatedAddress',
          value: JSON.stringify(validatedAddr),
        })

        await JobModel.updateOne({ _id: jobId }, { $set: { meta } })
        await logger.debug(`SDS Job meta updated/google validated Address: `, {
          meta,
          validatedAddr,
        })

        if (agent_id) {
          let btrAgent = await BtrAgentModel.findOne({
            sdsAgentId: agent_id,
            tenant: job.tenant,
          })

          if (!btrAgent) {
            await logger.debug(
              `Creating new BTR Agent for SDS Agent ID: ${agent_id}`,
            )

            btrAgent = new BtrAgentModel<DbBtrAgent>({
              tenant: job.tenant,
              fullName: agent.full_name,
              agencyName: webhook.agency_name,
              agentPhone: agent.phone,
              agentEmail: agent.email,
              sdsAgentId: agent_id,
              sdsWebsiteUrl: webhook.referral_url,
              createdOn: new Date(),
            })
            await btrAgent.save()
          } else {
            await logger.debug(
              `BTR Agent already exists for SDS Agent ID: ${agent_id}`,
            )
          }
        }

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-sds-matter',
          path: 'v1.btr-sds-matter.create',
        })

        await logger.info(
          `Start #Finished starting Matter Creation for File Id:${fileId}, Job Id:${jobId}`,
        )
        return dapr.success
      } catch (error: unknown) {
        const { filenoteMessage } = await handleSdsAppError(
          'Error Starting Matter Creation',
          error,
          fileId,
          jobId,
          logger,
        )

        await status('error-processing', filenoteMessage)
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
