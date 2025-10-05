import {
  type DbFile,
  type DbJob,
  FileModel,
  JobModel,
} from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  type ServiceType,
  ccaOnMatterArchiveSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import { Ok } from 'ts-results-es'
import { defaultEmailSubscribers } from '../../utils/email-utils'
import { defaultTeamsSubscribers } from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const cca_on_matter_archive = new Elysia()
  .use(appContext({ allowedTenants: ['CCA'] }))
  .post(
    '/cca-on-matter-archive',
    async ({ body, ctx, status }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        jobStatus,
        johnny5Config,
      } = ctx
      const { matterId, actionType, primaryParticipantIds, testMode } = body
      await logger.info(`Starting On Matter Archive request`)

      const session = await mongoose.startSession()
      const result = await session.withTransaction(async () => {
        let file = await FileModel.findOne({
          tenant,
          actionStepMatterId: matterId,
        })

        let fileId: string
        let serviceType: ServiceType = 'internal'

        if (!file) {
          file = new FileModel<DbFile>({
            tenant,
            serviceType,
            sourceReason: `Submit on-matter-archive request`,
            actionStepMatterId: matterId,
            createdOn: new Date(),
          })
          await file.save()
          fileId = file.id as string
          serviceType = file.serviceType!
        } else {
          fileId = file.id as string
          serviceType = file.serviceType!
        }

        const meta: Meta[] = [
          {
            key: 'actionType',
            value: `${actionType}`,
          },
          {
            key: 'participantIds',
            value: JSON.stringify(primaryParticipantIds),
          },
          {
            key: 'testMode',
            value: testMode ? 'true' : 'false',
          },
        ]

        const job = new JobModel<DbJob>({
          tenant,
          status: 'created',
          fileId: new ObjectId(fileId),
          serviceType,
          type: 'on-matter-archive',
          createdOn: new Date(),
          emailSubscribers: await defaultEmailSubscribers(johnny5Config),
          teamsSubscribers: await defaultTeamsSubscribers(
            johnny5Config,
            logger,
          ),
          meta,
        })
        await job.save()

        return Ok({ job, file })
      })
      await session.endSession()

      if (!result.ok) {
        return status(400, `Error processing On Matter Archive request`)
      }

      const { job, file } = result.val
      await jobStatus(job.id, file.id, 'created')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-on-matter-archive',
          path: 'v1.cca-on-matter-archive',
        },
        { jobId: job.id, fileId: file.id, tenant },
      )

      await logger.info(`Finished On Matter Archive request`)

      return { id: job.id }
    },
    {
      body: ccaOnMatterArchiveSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'On Matter Archive',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
