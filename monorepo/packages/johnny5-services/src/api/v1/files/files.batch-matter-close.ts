import {
  type Meta,
  batchMatterCloseSchema,
  component,
  idStringSchema,
} from '@dbc-tech/johnny5'
import { type DbJob, JobModel } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { defaultTeamsSubscribers } from '../../../utils/teams-utils'
import { fileContext } from '../../plugins/file-context.plugin'

export const batch_matter_close = new Elysia({
  prefix: '/:id/batch-matter-close',
})
  .use(fileContext())
  .post(
    '',
    async ({ params: { id }, body, ctx }) => {
      const {
        file,
        jwt: { tenant },
        next,
        status,
        johnny5Config,
        logger,
      } = ctx
      const { matterIds, email, closureReason } = body

      const meta: Meta[] = []
      if (closureReason) meta.push({ key: 'filenote', value: closureReason })

      const teamsSubscribers = await defaultTeamsSubscribers(
        johnny5Config,
        logger,
      )

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

      await status(jobId, 'created')

      await next(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-batch-matter-close',
          path: 'v1.batch-matter-close',
        },
        { jobId, fileId: id, tenant },
      )

      return { id: jobId }
    },
    {
      body: batchMatterCloseSchema,
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Batch Matter Close',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
