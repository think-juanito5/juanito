import {
  type DbFile,
  type DbTask,
  FileModel,
  TaskModel,
} from '@dbc-tech/johnny5-mongodb'
import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type CcaPaymentForm,
  type Meta,
  type Tenant,
  authHeaderSchema,
  ccaPaymentFormSchema,
  idIntSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { Elysia, t } from 'elysia'
import mongoose from 'mongoose'
import { Ok } from 'ts-results-es'
import { defaultEmailSubscribers } from '../../../utils/email-utils'
import { defaultTeamsSubscribers } from '../../../utils/teams-utils'
import { appContext } from '../../plugins/app-context.plugin'

async function initTask(
  tenant: Tenant,
  matterId: number,
  body: CcaPaymentForm,
  logger: Logger,
  johnny5Config: Johnny5ConfigService,
) {
  await logger.info(
    `initTask() Matter Payment #Starting to process Matter-Payment for Matter:${matterId}`,
  )

  const session = await mongoose.startSession()
  const result = await session.withTransaction(async () => {
    let file = await FileModel.findOne(
      {
        tenant,
        actionStepMatterId: matterId,
      },
      {},
      { session },
    )

    if (file) {
      await logger.info(
        `initTask() Matter Payment #File already exists for Matter:${matterId} with fileId:${file.id}`,
      )
    } else {
      await logger.info(
        `initTask() Matter Payment #No file found for Matter:${matterId}, creating a new one`,
      )
    }
    if (!file) {
      file = new FileModel<DbFile>({
        tenant,
        serviceType: 'internal',
        sourceReason: `Store payment details for Matter:${matterId}`,
        actionStepMatterId: matterId,
        createdOn: new Date(),
      })
      await file.save({ session })
    }

    const meta: Meta[] = [
      { key: 'paymentDetails', value: JSON.stringify(body) },
    ]

    const task = new TaskModel<DbTask>({
      tenant,
      fileId: file.id,
      type: 'matter-payment',
      status: 'started',
      createdOn: new Date(),
      emailSubscribers: await defaultEmailSubscribers(johnny5Config),
      teamsSubscribers: await defaultTeamsSubscribers(johnny5Config, logger),
      meta,
    })
    await task.save({ session })

    return Ok({ task, file })
  })

  await session.endSession()

  if (!result.ok) {
    throw new Error(
      `initTask() Error processing matter-payment for matter ${matterId}`,
    )
  }
  const { task, file } = result.val
  await logger.info(
    `initTask() Task created matter-payment for Matter:${matterId} with taskId:${task.id} and fileId:${file.id}`,
  )

  return { file, task }
}

export const cca_matter_payment = new Elysia()
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'CCA' }))
  .post(
    '/:id/payment',
    async ({ params: { id }, ctx, body }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        taskStatus,
        johnny5Config,
      } = ctx

      await logger.info(`Starting to process payment request for Matter:${id}`)
      const { file, task } = await initTask(
        tenant,
        id,
        body,
        logger,
        johnny5Config,
      )
      await taskStatus(task.id, file.id, 'started')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.actionstep-matter-payment',
        },
        { taskId: task.id, fileId: file.id, tenant },
      )

      return { id: task.id }
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        id: t.Number(),
      }),
      body: ccaPaymentFormSchema,
      response: {
        200: idIntSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Processing matter-payment request',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
