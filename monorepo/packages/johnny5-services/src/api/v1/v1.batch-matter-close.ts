import {
  type DbFile,
  type DbJob,
  FileModel,
  JobModel,
} from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  batchMatterCloseSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { defaultTeamsSubscribers } from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const batch_matter_close = new Elysia()
  .use(appContext({ allowedTenants: ['CCA'] }))
  .post(
    '/batch-matter-close',
    async ({ body, ctx }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        jobStatus,
        johnny5Config,
      } = ctx
      const { matterIds, email, closureReason } = body
      await logger.info(`Starting Batch Matter Closure`)

      const file = new FileModel<DbFile>({
        tenant,
        serviceType: 'internal',
        sourceReason: `Batch Matter Closing ${matterIds.length} matters`,
        createdOn: new Date(),
      })
      await file.save()
      const fileId = file.id as string

      const teamsSubscribers = await defaultTeamsSubscribers(
        johnny5Config,
        logger,
      )

      const meta: Meta[] = []
      if (closureReason) meta.push({ key: 'filenote', value: closureReason })

      const job = new JobModel<DbJob>({
        tenant,
        status: 'created',
        fileId: file._id,
        serviceType: file.serviceType!,
        type: 'batch-matter-close',
        createdOn: new Date(),
        matterIds: matterIds.map((number) => {
          return { number, status: 'closing' }
        }),
        emailSubscribers: email
          ? [
              {
                email: email,
                name: email,
                events: ['completed', 'error-processing'],
              },
            ]
          : [],
        teamsSubscribers,
        meta,
      })
      await job.save()
      const jobId = job.id as string

      await jobStatus(jobId, fileId, 'created')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-batch-matter-close',
          path: 'v1.batch-matter-close',
        },
        { jobId, fileId, tenant },
      )

      return { id: job.id }
    },
    {
      body: batchMatterCloseSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Batch Matter Close',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )

export type BatchMatterClose = typeof batch_matter_close
