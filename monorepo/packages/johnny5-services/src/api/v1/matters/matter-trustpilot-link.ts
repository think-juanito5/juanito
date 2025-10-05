import {
  type DbFile,
  type DbTask,
  FileModel,
  TaskModel,
} from '@dbc-tech/johnny5-mongodb'
import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Meta,
  type Tenant,
  authHeaderSchema,
  ccaMatterTpLinkParamsSchema,
  idStringSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { Elysia, t } from 'elysia'
import mongoose from 'mongoose'
import { Ok } from 'ts-results-es'
import {
  ccaMatterCreatedTeamsSubscribers,
  defaultTeamsSubscribers,
} from '../../../utils/teams-utils'
import { appContext } from '../../plugins/app-context.plugin'

async function initTask(
  tenant: Tenant,
  matterId: number,
  actionStepParticipantUpdatedId: number | undefined,
  johnny5Config: Johnny5ConfigService,
  logger: Logger,
) {
  await logger.info(
    `initTask() TPLink #Starting to process Matter-Trustpilot-Link for Matter:${matterId} with ActionstepParticipantUpdatedId:${actionStepParticipantUpdatedId}`,
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
        `initTask() TPLink #File already exists for Matter:${matterId} with fileId:${file.id}`,
      )
    } else {
      await logger.info(
        `initTask() TPLink #No file found for Matter:${matterId}, creating a new one`,
      )
    }
    if (!file) {
      file = new FileModel<DbFile>({
        tenant,
        serviceType: 'internal',
        sourceReason: `Generate TrustPilot link for Matter:${matterId} `,
        actionStepMatterId: matterId,
        createdOn: new Date(),
      })
      await file.save({ session })
    }

    const teamsSubscribers = await defaultTeamsSubscribers(
      johnny5Config,
      logger,
    )
    teamsSubscribers.push(
      ...(await ccaMatterCreatedTeamsSubscribers(johnny5Config, logger)),
    )

    const meta: Meta[] = []

    let task = await TaskModel.findOne(
      {
        tenant,
        fileId: file.id,
        type: 'matter-trustpilot-link',
      },
      {},
      { session },
    )

    if (!task) {
      await logger.info(
        `initTask() No task found for Matter:${matterId}, creating a new one`,
      )
      task = new TaskModel<DbTask>({
        tenant,
        fileId: file.id,
        type: 'matter-trustpilot-link',
        status: 'started',
        createdOn: new Date(),
        emailSubscribers: [],
        teamsSubscribers: teamsSubscribers,
        meta,
      })
    } else {
      await logger.info(
        `initTask() Task already exists for Matter:${matterId} with taskId:${task.id}`,
      )

      if (actionStepParticipantUpdatedId) {
        //personId is re-used as ActionStepParticipantUpdatedId
        await logger.info(
          `initTask() Updating task meta with ActionStepParticipantUpdatedId:${actionStepParticipantUpdatedId}`,
        )
        task.meta = (task.meta ?? []).filter(
          (m) => !['personId'].includes(m.key),
        )

        task.meta.push({
          key: 'personId',
          value: String(actionStepParticipantUpdatedId),
        })
        task.updatedOn = new Date()
      }
    }
    await task.save({ session })

    return Ok({ task, file })
  })

  await session.endSession()

  if (!result.ok) {
    throw new Error(
      `initTask() Error processing matter-trustpilot-link for matter ${matterId}`,
    )
  }
  const { task, file } = result.val
  await logger.info(
    `initTask() Task created TrustPilot-link for Matter:${matterId} with taskId:${task.id} and fileId:${file.id}`,
  )

  return { file, task }
}

export const cca_matter_trustpilot_link = new Elysia()
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'CCA' }))
  .post(
    '/:id/trustpilot-link',
    async ({ params: { id }, ctx, body }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        taskStatus,
        johnny5Config,
      } = ctx

      const { participantClientId } = body ?? {}

      await logger.info(
        `Starting to process trustpilot-link request for Matter:${id} with ActionstepParticipantUpdatedId:${participantClientId}`,
      )
      const { file, task } = await initTask(
        tenant,
        id,
        participantClientId,
        johnny5Config,
        logger,
      )
      await taskStatus(task.id, file.id, 'started')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.actionstep-matter-trustpilot-link',
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
      body: ccaMatterTpLinkParamsSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Processing trustpilot-link request',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
