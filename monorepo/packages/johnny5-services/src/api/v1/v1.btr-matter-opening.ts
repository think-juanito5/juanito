import {
  type DbFile,
  type DbJob,
  FileModel,
  JobModel,
} from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  btrMatterOpeningSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { defaultTeamsSubscribers } from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const btr_matter_opening = new Elysia()
  .use(appContext({ allowedTenants: ['BTR'] }))
  .post(
    '/btr-matter-opening',
    async ({ body, ctx, status }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        name,
        jobStatus,
        johnny5Config,
      } = ctx
      await logger.info(`Starting BTR Matter Opening`)
      await logger.debug(`Request payload`, body)

      const {
        matterName,
        additionalInfo,
        clientId,
        email,
        templateMatterId,
        intent,
        professionalFees,
        testMode,
      } = body

      const existingJob = await JobModel.findOne({ clientId, tenant })
      if (existingJob) {
        await logger.error(`A job with the clientId ${clientId} already exists`)
        return status(409, `A job with the clientId ${clientId} already exists`)
      }

      const file = new FileModel<DbFile>({
        tenant,
        serviceType: intent == 'buy' ? 'conveyancing-buy' : 'conveyancing-sell',
        sourceReason: `Submit API request to BTR Matter Opening at ${name}`,
        createdOn: new Date(),
      })
      await file.save()
      const fileId = file.id as string

      const meta: Meta[] = []
      if (matterName) {
        meta.push({ key: 'matterName', value: matterName })
      }
      if (additionalInfo) {
        meta.push({ key: 'additionalInfo', value: additionalInfo })
      }
      if (templateMatterId) {
        meta.push({
          key: 'templateMatterId',
          value: templateMatterId.toString(),
        })
      }
      if (professionalFees) {
        meta.push({ key: 'professionalFees', value: professionalFees })
      }
      if (email) {
        meta.push({ key: 'createdByEmail', value: email })
      }
      if (testMode) {
        meta.push({ key: 'testMode', value: 'true' })
      }

      const teamsSubscribers = await defaultTeamsSubscribers(
        johnny5Config,
        logger,
      )

      const job = new JobModel<DbJob>({
        tenant,
        status: 'created',
        fileId: file._id,
        serviceType: file.serviceType!,
        clientId,
        type: 'matter-opening',
        createdOn: new Date(),
        meta,
        emailSubscribers: email
          ? [
              {
                email: email,
                name: email,
                events: ['created', 'completed', 'error-processing'],
              },
            ]
          : [],
        teamsSubscribers,
      })
      await job.save()
      const jobId = job.id as string

      await jobStatus(jobId, fileId, 'created')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-matter-opening',
          path: 'v1.btr-matter-opening',
        },
        { jobId: job.id, fileId: file.id, tenant },
      )

      await logger.info(`Finished BTR Matter Opening`)

      return { id: job.id }
    },
    {
      body: btrMatterOpeningSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'BTR Matter Opening',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
