import { type DbJob, FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  authHeaderSchema,
  idStringSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox'
import { getString, setJsonContentHeader } from '@dbc-tech/johnny5/utils'
import Elysia, { t } from 'elysia'
import { appContext } from '../../../plugins/app-context.plugin'

export const btrPexaAuditFailedReady = new Elysia()
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'BTR' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/:actionstepTaskId/pexa-audit-failed-ready',
    async ({ params: { id, actionstepTaskId }, ctx }) => {
      const {
        jwt: { tenant },
        logger,
        jobStatus,
        start,
      } = ctx
      await logger.info(
        `Starting BTR PEXA Audit record creation for Action Id:${id}, Task Id:${actionstepTaskId}`,
      )

      // find the file
      const file = await FileModel.findOne({
        tenant,
        actionStepMatterId: id,
      })
      if (!file) {
        throw new Error(
          `File not found for Action Id:${id}, Task Id:${actionstepTaskId}`,
        )
      }

      // find the job
      const job = await JobModel.findOne({
        tenant,
        fileId: file.id,
        type: 'btr-pexa-audit',
      })
      if (!job || !job.meta) {
        throw new Error(`BTR PEXA Audit Job not found for Action Id:${id}`)
      }
      await jobStatus(job.id, file.id, 'in-progress')

      // need to append the new task to the existing task list
      // get the existing task list
      let taskMeta = getString(job.meta, 'actionstepTaskId', true)
      // append the new task to the existing task list
      taskMeta += `,${actionstepTaskId}`
      // construct a new meta object, replacing the existing task
      // list with the appended task list
      const newMeta: Meta[] = job.meta.filter(
        (m) => m.key !== 'actionstepTaskId',
      )
      newMeta.push({
        key: 'actionstepTaskId',
        value: taskMeta,
      })
      await logger.debug(
        `Appending new task to existing task list: ${taskMeta}`,
      )

      // update the job with the new meta object
      const update: Partial<DbJob> = { meta: newMeta }
      await JobModel.findByIdAndUpdate(job.id, update)

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'btr-pexa-audit-processing',
          path: 'v1.btr-pexa-audit.subsequent-audit-start',
        },
        { jobId: job.id, fileId: file.id, tenant },
      )

      return { id: job.id }
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        id: t.Number(),
        actionstepTaskId: t.Number(),
      }),
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        tags: ['Matters', 'Tasks', 'PEXA Audit'],
        description: 'Create a subsequent BTR PEXA Audit record',
        summary: 'Create subsequent PEXA Audit',
      },
    },
  )
