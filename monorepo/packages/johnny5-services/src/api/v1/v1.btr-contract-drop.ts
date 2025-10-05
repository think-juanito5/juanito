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
  btrContractDropSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { ObjectId } from 'mongodb'
import {
  btrContractDropHitlWaitingSubscribers,
  defaultTeamsSubscribers,
} from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const btr_contract_drop = new Elysia()
  .use(appContext({ allowedTenants: ['BTR'] }))
  .post(
    '/btr-contract-drop',
    async ({ body, ctx, status }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        name,
        jobStatus,
        johnny5Config,
      } = ctx
      await logger.info(`Starting BTR Contract Drop`)
      await logger.debug(`Request payload`, body)

      const { clientId, contractDocumentBlob, email, matterId, testMode } = body

      const existingJob = await JobModel.findOne({ clientId, tenant })
      if (existingJob) {
        await logger.error(`A job with the clientId ${clientId} already exists`)
        return status(409, `A job with the clientId ${clientId} already exists`)
      }

      const actionstep = ctx.actionstep()
      const intent = await actionstep.getIntent(matterId)

      if (!intent) {
        await logger.error(`Matter ${matterId} Intent is unknown!`)
        return status(404, `Matter ${matterId} Intent is unknown!`)
      }

      let serviceType: ServiceType =
        intent == 'buy' ? 'conveyancing-buy' : 'conveyancing-sell'

      let fileId: string

      const existingFile = await FileModel.findOne({
        tenant,
        actionStepMatterId: matterId,
      })

      if (!existingFile) {
        const file = new FileModel<DbFile>({
          tenant,
          serviceType,
          sourceReason: `Submit API request to BTR Contract Drop at ${name}`,
          actionStepMatterId: matterId,
          createdOn: new Date(),
        })
        await file.save()
        fileId = file.id as string
        serviceType = file.serviceType!
      } else {
        fileId = existingFile.id as string
        serviceType = existingFile.serviceType!
      }

      const meta: Meta[] = []
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
      teamsSubscribers.push(
        ...(await btrContractDropHitlWaitingSubscribers(johnny5Config, logger)),
      )

      const job = new JobModel<DbJob>({
        tenant,
        status: 'created',
        fileId: new ObjectId(fileId),
        serviceType,
        clientId,
        type: 'contract-drop',
        createdOn: new Date(),
        blobs: contractDocumentBlob
          ? [{ name: contractDocumentBlob, type: 'contract' }]
          : [],
        meta,
        emailSubscribers: email
          ? [
              {
                email: email,
                name: email,
                events: [
                  'created',
                  'hitl-rejected',
                  'completed',
                  'error-processing',
                ],
              },
            ]
          : [],
        teamsSubscribers,
        matterIds: [{ number: matterId, status: 'created' }],
      })
      await job.save()
      const jobId = job.id as string

      await jobStatus(jobId, fileId, 'created')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-contract-drop',
          path: 'v1.btr-contract-drop',
        },
        { jobId: job.id, fileId, tenant },
      )

      await logger.info(`Finished BTR Contract Drop`)

      return { id: job.id }
    },
    {
      body: btrContractDropSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'BTR Contract Drop',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
