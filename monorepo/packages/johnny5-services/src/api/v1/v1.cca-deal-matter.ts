import { type DbFile, FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  ccaDealMatterSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import mongoose from 'mongoose'
import { serializeError } from 'serialize-error'
import { Err, Ok } from 'ts-results-es'
import { defaultEmailSubscribers } from '../../utils/email-utils'
import {
  ccaMatterCreatedTeamsSubscribers,
  defaultTeamsSubscribers,
} from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const cca_deal_matter = new Elysia()
  .use(
    appContext({
      allowedTenants: ['CCA'],
    }),
  )
  .post(
    '/cca-deal-matter',
    async ({ body, ctx, status }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        name,
        jobStatus,
        johnny5Config,
      } = ctx

      await logger.info(`Starting CCA Deal Matter at ${name}`)
      await logger.debug(`Request payload`, body)

      try {
        const meta: Meta[] = []
        if (body?.testMode) {
          meta.push({ key: 'testMode', value: 'true' })
        }

        const session = await mongoose.startSession()
        const result = await session.withTransaction(async () => {
          let file = await FileModel.findOne(
            {
              tenant,
              pipedriveDealId: body.dealId,
            },
            {},
            { session },
          )
          if (file) {
            if (file.actionStepMatterId) {
              await logger.error(
                `Existing File found with matter already assigned`,
                { fileId: file.id, matterId: file.actionStepMatterId },
              )
              return Err({
                message: `File Id: ${file.id} found with matter: ${file.actionStepMatterId} already assigned`,
              })
            }
            const existingJob = await JobModel.findOne(
              {
                tenant,
                fileId: file._id,
                type: 'deal-matter',
              },
              {},
              { session },
            )
            if (existingJob) {
              await logger.error(`Existing Job found`, {
                fileId: file.id,
                jobId: existingJob.id,
              })
              return Err({
                message: `Job Id: ${existingJob.id} found with type: ${existingJob.type}`,
              })
            }
          }

          if (!file) {
            file = new FileModel<DbFile>({
              tenant,
              serviceType: 'unknown',
              sourceReason: `Submit Deal-Matter request`,
              createdOn: new Date(),
              pipedriveDealId: body.dealId,
            })
            await file.save({ session })
          }

          const teamsSubscribers = await defaultTeamsSubscribers(
            johnny5Config,
            logger,
          )
          teamsSubscribers.push(
            ...(await ccaMatterCreatedTeamsSubscribers(johnny5Config, logger)),
          )

          const emailSubscribers = await defaultEmailSubscribers(johnny5Config)
          emailSubscribers[0]?.events.push('created')

          const job = new JobModel({
            tenant,
            status: 'created',
            fileId: file._id,
            serviceType: file.serviceType!,
            type: 'deal-matter',
            meta,
            teamsSubscribers,
            emailSubscribers,
            createdOn: new Date(),
          })
          await job.save({ session })

          return Ok({ job, file })
        })

        await session.endSession()

        if (!result.ok) {
          throw new Error(
            `Error processing CCA Deal Matter at ${name}: ${result.val.message}`,
          )
        }

        const { job, file } = result.val
        await jobStatus(job.id, file.id, 'created')
        await start(
          {
            pubsub: component.longQueues,
            queueName: 'johnny5-cca-deal-matter',
            path: 'v1.cca-deal-matter.start',
          },
          { jobId: job.id, fileId: file.id, tenant },
        )

        await logger.info(`Finished CCA Deal Matter at ${name}`)
        return { id: job.id }
      } catch (e) {
        const errMsg = serializeError(e)
        await logger.error(
          `Error processing CCA Deal Matter at ${name}. Error: `,
          JSON.stringify(errMsg, null, 2),
        )
        return status(400, JSON.stringify(errMsg, null, 2))
      }
    },
    {
      body: ccaDealMatterSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        400: t.String(),
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'CCA Deal -> Matter',
        tags: ['Johnny5', 'CCA', 'Deal', 'Matter'],
      },
    },
  )
