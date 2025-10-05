import { typeFormWebhookReceivedSchema } from '@dbc-tech/johnny5-http-service'
import { type DbJob, FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import { type Meta, idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, status, t } from 'elysia'
import { defaultTeamsSubscribers } from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const bespoke_tasks = new Elysia()
  .use(appContext({ allowedTenants: ['BTR', 'CCA', 'FCL'] }))
  .post(
    '/bespoke-tasks',
    async ({ body, ctx }) => {
      const { logger, start, jobStatus, johnny5Config } = ctx
      await logger.info(`Creating a Bespoke Tasks processing job`)
      await logger.debug(`Request payload`, body)

      const { tenant, ...form_response } = body
      const { hidden } = form_response.form_response
      if (!hidden || !hidden.refmatid) {
        await logger.error(`Form response does not contain hidden fields`)
        return status(400, `Form response does not contain hidden fields`)
      }
      const { refmatid: actionStepMatterId } = hidden

      // check if we have a file (we probably do) and create one if not
      let file
      file = await FileModel.findOne({
        tenant,
        actionStepMatterId,
      })
      if (!file) {
        file = new FileModel({
          tenant,
          actionStepMatterId,
          sourceReason: `Bespoke tasks trigger for Actionstep Matter ID ${actionStepMatterId}`,
          serviceType: 'internal',
          createdOn: new Date(),
        })
        await file.save()
      }
      const fileId = file.id as string

      const teamsSubscribers = await defaultTeamsSubscribers(
        johnny5Config,
        logger,
      )

      const meta: Meta[] = []
      meta.push({
        key: 'additionalInfo',
        value: JSON.stringify(form_response),
      })

      const job = new JobModel<DbJob>({
        tenant,
        status: 'created',
        fileId: file._id,
        serviceType: file.serviceType!,
        type: 'bespoke-tasks',
        meta,
        createdOn: new Date(),
        emailSubscribers: [],
        teamsSubscribers,
      })
      await job.save()
      const jobId = job.id as string

      await jobStatus(jobId, fileId, 'created')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-bespoke-tasks',
          path: 'v1.bespoke-tasks',
        },
        { jobId: job.id, fileId: file.id, tenant },
      )

      await logger.info(`Finished Processing Bespoke Tasks Job`)

      return { id: job.id }
    },
    {
      body: typeFormWebhookReceivedSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        400: t.String(),
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Bespoke Tasks',
        tags: ['Johnny5', 'Matters', 'BespokeTasks'],
      },
    },
  )
