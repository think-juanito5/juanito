import {
  type DbFile,
  type DbJob,
  FileModel,
  JobModel,
} from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  btrSdsClientWebhookSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'

import { Elysia, t } from 'elysia'
import mongoose from 'mongoose'
import { Err, Ok } from 'ts-results-es'
import { hasIgnoreInNames } from '../../utils/property-utils'
import {
  btrSdsMatterCreatedTeamsSubscribers,
  defaultTeamsSubscribers,
} from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const btr_sds_matter_create = new Elysia()
  .use(appContext({ allowedTenants: ['BTR'] }))
  .post(
    '/btr-sds-matter-create',
    async ({ body, ctx }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        jobStatus,
        johnny5Config,
      } = ctx
      await logger.info(`Starting BTR SDS Matter Creation`)
      await logger.debug(`Request payload`, body)
      const clientId = body.webhook_id

      const session = await mongoose.startSession()
      const result = await session.withTransaction(async () => {
        const existingJob = await JobModel.findOne(
          { clientId, tenant, type: 'sds-matter-creation' },
          {},
          { session },
        )
        if (existingJob) {
          await logger.error(
            `A job with the clientId/payloadId ${clientId} already exists`,
          )
          return Err(
            `A job with the clientId/payloadId ${clientId} already exists`,
          )
        }

        const file = new FileModel<DbFile>({
          tenant,
          serviceType: 'conveyancing-sell',
          sourceReason: `Submit API request for BTR Seller Disclosure Statement Matter creation with clientId: ${clientId}`,
          createdOn: new Date(),
        })
        await file.save({ session })

        const meta: Meta[] = []
        meta.push({
          key: 'webhookPayload',
          value: JSON.stringify(body),
        })

        const isTestMode = hasIgnoreInNames(body)
        await logger.debug(
          `BTR SDS Matter Create is in test mode: ${isTestMode}`,
        )
        meta.push({
          key: 'testMode',
          value: isTestMode ? 'true' : 'false',
        })

        const teamsSubscribers = await defaultTeamsSubscribers(
          johnny5Config,
          logger,
        )
        teamsSubscribers.push(
          ...(await btrSdsMatterCreatedTeamsSubscribers(johnny5Config, logger)),
        )

        const job = new JobModel<DbJob>({
          tenant,
          status: 'created',
          fileId: file._id,
          serviceType: file.serviceType!,
          clientId,
          type: 'sds-matter-creation',
          createdOn: new Date(),
          meta,
          teamsSubscribers,
        })

        await job.save({ session })
        return Ok({ job, file })
      })

      await session.endSession()

      if (!result.ok) {
        throw new Error(
          `Error processing BTR SDS Matter Creation: ` + result.val,
        )
      }

      const { job, file } = result.val
      await jobStatus(job.id, file.id, 'created')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-sds-matter',
          path: 'v1.btr-sds-matter.start',
        },
        { jobId: job.id, fileId: file.id, tenant },
      )

      await logger.info(`Finished BTR SDS Matter Creation`)
      return { id: job.id }
    },
    {
      body: btrSdsClientWebhookSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'BTR SDS Matter Create',
        tags: ['Johnny5', 'SDS Matters'],
      },
    },
  )
