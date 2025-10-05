import {
  type DbFile,
  type DbJob,
  FileModel,
  JobModel,
} from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import { type Meta, idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { defaultTeamsSubscribers } from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const stale_matter_cleanup = new Elysia()
  .use(appContext({ allowedTenants: ['CCA'] }))
  .post(
    '/stale-matter-cleanup',
    async ({ ctx }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        jobStatus,
        johnny5Config,
      } = ctx
      await logger.info(`Starting Stale Matter Cleanup`)

      const file = new FileModel<DbFile>({
        tenant,
        serviceType: 'internal',
        sourceReason: `Stale Matter Cleanup triggered`,
        createdOn: new Date(),
      })
      await file.save()
      const fileId = file.id as string

      const teamsSubscribers = await defaultTeamsSubscribers(
        johnny5Config,
        logger,
      )

      const meta: Meta[] = []
      meta.push({ key: 'filenote', value: 'Stale Matter Cleanup' })

      const job = new JobModel<DbJob>({
        tenant,
        status: 'created',
        fileId: file._id,
        serviceType: file.serviceType!,
        type: 'stale-matter-cleanup',
        createdOn: new Date(),
        emailSubscribers: [],
        teamsSubscribers,
        meta,
      })
      await job.save()
      const jobId = job.id as string

      await jobStatus(jobId, fileId, 'created')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'cca-actionstep-stale-matter-cleanup',
          path: 'v1.stale-matter-cleanup',
        },
        { jobId, fileId, tenant },
      )

      return { id: jobId }
    },
    {
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Stale Online Drafting Matter Cleanup',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
