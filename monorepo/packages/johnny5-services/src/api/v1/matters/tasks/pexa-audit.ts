import {
  type DbFile,
  type DbJob,
  FileModel,
  JobModel,
  type Meta,
} from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  authHeaderSchema,
  idStringSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox'
import Elysia, { status, t } from 'elysia'
import { defaultTeamsSubscribers } from '../../../../utils/teams-utils'
import { appContext } from '../../../plugins/app-context.plugin'

const newNSWMatterType = '69' // PEXA Audit record creation is only for the new NSW matter type

export const btrPexaAudit = new Elysia()
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'BTR' }))
  .post(
    '/:actionstepTaskId/pexa-audit',
    async ({ params: { id, actionstepTaskId }, ctx }) => {
      const {
        jwt: { tenant },
        logger,
        start,
        johnny5Config,
        actionstep,
      } = ctx
      await logger.info(
        `Starting BTR PEXA Audit record creation for Action Id:${id}, Task Id:${actionstepTaskId}`,
      )
      const as = actionstep()
      const matter = await as.getAction(id)
      const matterType = matter?.actions?.links?.actionType

      if (matterType !== newNSWMatterType) {
        await logger.info(
          `Action Id:${id} does not belong to the new NSW matter type, skipping PEXA Audit creation.`,
        )
        return status(204, null)
      }

      let file = await FileModel.findOne({
        tenant,
        actionStepMatterId: id,
      })
      if (!file) {
        file = new FileModel<DbFile>({
          tenant,
          serviceType: 'internal',
          sourceReason: `PEXA Audit record creation for Task:${actionstepTaskId}`,
          actionStepMatterId: id,
          createdOn: new Date(),
        })
        await file.save()
      }
      await logger.debug(`File Id:${file.id}`)

      const meta: Meta[] = []
      meta.push({
        key: 'actionstepTaskId',
        value: actionstepTaskId.toString(),
      })

      const teamsSubscribers = await defaultTeamsSubscribers(
        johnny5Config,
        logger,
      )

      let job = await JobModel.findOne({
        tenant,
        fileId: file.id,
        type: 'btr-pexa-audit',
      })
      if (!job) {
        job = new JobModel({
          tenant,
          fileId: file.id,
          serviceType: 'internal',
          type: 'btr-pexa-audit',
          status: 'created',
          createdOn: new Date(),
          emailSubscribers: [],
          teamsSubscribers: teamsSubscribers,
          meta,
        })
        await job.save()
      } else {
        // create/replace the job meta with the new task id
        const update: Partial<DbJob> = { meta }
        await JobModel.findByIdAndUpdate(job.id, update)
      }
      await logger.debug(`Job Id:${job.id}, meta: ${JSON.stringify(meta)}`)
      await start(
        {
          pubsub: component.longQueues,
          queueName: 'btr-pexa-audit-processing',
          path: 'v1.btr-pexa-audit',
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
        204: t.Null(),
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        tags: ['Matters', 'Tasks', 'PEXA Audit'],
        description: 'Create a BTR PEXA Audit record',
        summary: 'Create PEXA Audit',
      },
    },
  )
