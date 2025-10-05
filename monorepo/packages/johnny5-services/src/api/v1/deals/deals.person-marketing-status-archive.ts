import { type DbTask, FileModel, TaskModel } from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  type Tenant,
  authHeaderSchema,
  idStringSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { Elysia, NotFoundError, t } from 'elysia'
import mongoose from 'mongoose'
import { Ok } from 'ts-results-es'
import { appContext } from '../../plugins/app-context.plugin'

async function initTask(
  tenant: Tenant,
  id: number,
  personId: number,
  logger: Logger,
) {
  await logger.info(
    `initTask() Starting to process Deal:${id}, Person ID: ${id}`,
  )

  const session = await mongoose.startSession()
  const result = await session.withTransaction(async () => {
    const file = await FileModel.findOne(
      {
        tenant,
        pipedriveDealId: id,
      },
      {},
      { session },
    )

    if (file) {
      await logger.info(
        `initTask() File already exists for Deal:${id} with fileId:${file.id}`,
      )
    } else {
      await logger.info(`initTask() No file found for Deal:${id}`)
      throw new NotFoundError(`initTask() File not found for Deal:${id}`)
    }

    const meta: Meta[] = []

    meta.push({
      key: 'personId',
      value: personId.toString(),
    })

    const task = new TaskModel<DbTask>({
      tenant,
      fileId: file.id,
      type: 'pipedrive-marketing-status-archive',
      status: 'started',
      createdOn: new Date(),
      emailSubscribers: [],
      teamsSubscribers: [],
      meta,
    })
    await task.save({ session })
    return Ok({ task, file })
  })

  await session.endSession()

  if (!result.ok) {
    throw new Error(
      `initTask() Error processing marketing-status-archive for Deal ${id}, Person ID: ${result.val}`,
    )
  }
  const { task, file } = result.val
  await logger.info(
    `initTask() Task created for Deal:${id} with taskId:${task.id} and fileId:${file.id}`,
  )

  return { file, task }
}

export const deals_person_marketing_status_archive = new Elysia()
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'CCA' }))
  .post(
    '/:dealId/persons/:personId/marketing-status-archive',
    async ({ params: { dealId, personId }, ctx }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        taskStatus,
      } = ctx

      await logger.info(
        `Starting to process marketing-status-archive for Deal :${dealId}, Person ID: ${personId}`,
      )

      const { file, task } = await initTask(tenant, dealId, personId, logger)
      await taskStatus(task.id, file.id, 'started')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.pipedrive-marketing-status-archive',
        },
        { taskId: task.id, fileId: file.id, tenant },
      )

      return { id: task.id }
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        dealId: t.Number(),
        personId: t.Number(),
      }),
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Processing pipedrive marketing status archive for person',
        tags: ['Johnny5', 'Deals'],
      },
    },
  )
