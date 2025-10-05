import { type DbFile, FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  ccaEmailUnsubscribeFormSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import mongoose from 'mongoose'
import { serializeError } from 'serialize-error'
import { Ok } from 'ts-results-es'
import { appContext } from '../plugins/app-context.plugin'

export const cca_email_unsubscribe = new Elysia()
  .use(
    appContext({
      allowedTenants: ['CCA'],
    }),
  )
  .post(
    '/cca-email-unsubscribe',
    async ({ body, ctx, status }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        jobStatus,
      } = ctx

      await logger.info(`Starting CCA Unsubscribe email ${body.email}`)
      await logger.debug(`Request payload`, body)

      try {
        const session = await mongoose.startSession()
        const result = await session.withTransaction(async () => {
          const file = new FileModel<DbFile>({
            tenant,
            serviceType: 'unknown',
            sourceReason: `CCA Unsubscribe request`,
            createdOn: new Date(),
          })
          await file.save({ session })

          const meta: Meta[] = []
          meta.push({
            key: 'unsubscribeEmail',
            value: body.email,
          })
          meta.push({
            key: 'unsubscribeOption',
            value: body.option,
          })

          const job = new JobModel({
            tenant,
            status: 'created',
            fileId: file._id,
            serviceType: file.serviceType!,
            type: 'cca-unsubscribe',
            meta,
            createdOn: new Date(),
          })
          await job.save({ session })

          return Ok({ job, file })
        })

        await session.endSession()

        if (!result.ok) {
          throw new Error(
            `Error creating CCA Unsubscribe job for email: ${body.email}: ${result.val}`,
          )
        }

        const { job, file } = result.val
        await jobStatus(job.id, file.id, 'created')
        await start(
          {
            pubsub: component.longQueues,
            queueName: 'johnny5-cca-email-unsubscribe',
            path: 'v1.cca-email-unsubscribe',
          },
          { jobId: job.id, fileId: file.id, tenant },
        )

        await logger.info(`Finished CCA Unsubscribe for email: ${body.email}`)
        return { id: job.id }
      } catch (e) {
        const errMsg = serializeError(e)
        await logger.error(
          `Error processing CCA Unsubscribe for email: ${body.email}. Error: `,
          JSON.stringify(errMsg, null, 2),
        )
        return status(400, JSON.stringify(errMsg, null, 2))
      }
    },
    {
      body: ccaEmailUnsubscribeFormSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        400: t.String(),
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'CCA Unsubscribe',
        tags: ['Johnny5', 'CCA', 'Unsubscribe'],
      },
    },
  )
