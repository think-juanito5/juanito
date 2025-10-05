import { type DbTask, FileModel, TaskModel } from '@dbc-tech/johnny5-mongodb'
import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type CcaMatterNameRefresh,
  type Tenant,
  authHeaderSchema,
  ccaMatterNameRefreshSchema,
  idStringSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox'

import { getString } from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'
import { Elysia, t } from 'elysia'
import mongoose from 'mongoose'
import { Ok } from 'ts-results-es'
import {
  buildMeta,
  getTeamsSubscribers,
} from '../../../utils/matter-name-utils'
import { appContext } from '../../plugins/app-context.plugin'

async function initTask(
  tenant: Tenant,
  matterId: number,
  johnny5Config: Johnny5ConfigService,
  nameRefreshParam: CcaMatterNameRefresh,
  logger: Logger,
) {
  await logger.info(`initTask() Starting to process Matter:${matterId}`)
  const assignedToId = nameRefreshParam.assignedToId

  const session = await mongoose.startSession()
  const result = await session.withTransaction(async () => {
    const meta = buildMeta(nameRefreshParam)
    const teamsSubscribers = await getTeamsSubscribers(johnny5Config, logger)
    let assignedToUpdated = false
    let isTaskRunning = false

    let file = await FileModel.findOne(
      { tenant, actionStepMatterId: matterId },
      {},
      { session },
    )
    if (!file) {
      await logger.info(`initTask() No file found for Matter:${matterId}`)
      file = new FileModel({
        tenant,
        serviceType: 'internal',
        sourceReason: `MatterNameRefresh for Matter:${matterId}`,
        actionStepMatterId: matterId,
        createdOn: new Date(),
      })
      await file.save({ session })
    } else {
      await logger.info(
        `initTask() File already exists for Matter:${matterId} with fileId:${file.id}`,
      )
    }

    let task = await TaskModel.findOne(
      {
        tenant,
        fileId: file.id,
        type: 'matter-name-refresh',
      },
      {},
      { session },
    )

    if (!task) {
      await logger.info(
        `initTask() No task found for Matter:${matterId}, creating new task`,
      )

      task = new TaskModel<DbTask>({
        tenant,
        fileId: file.id,
        type: 'matter-name-refresh',
        status: 'started',
        createdOn: new Date(),
        emailSubscribers: [],
        teamsSubscribers,
        meta,
      })
    } else {
      await logger.info(
        `initTask(+) Task already exists for Matter:${matterId} with taskId:${task.id}`,
        {
          taskId: task.id,
          fileId: file.id,
          status: task.status,
          meta: task.meta,
        },
      )
      const existingAssignedToId = task.meta
        ? getString(task.meta, 'assignedToParticipantId', false)
        : undefined
      if (assignedToId && existingAssignedToId !== assignedToId) {
        task.meta = (task.meta ?? []).filter(
          (m) =>
            ![
              'assignedToParticipantId',
              'pipedriveFileNotesEnabled',
              'teamsNotifyEnabled',
            ].includes(m.key),
        )

        task.meta.push({ key: 'assignedToParticipantId', value: assignedToId })

        assignedToUpdated = true

        if (task.status === 'started') {
          isTaskRunning = true
          await logger.info(
            `initTask() Task for Matter:${matterId} with taskId:${task.id} is already started.`,
          )
        }

        task.updatedOn = new Date()

        await logger.info(
          `initTask() Task already existed for Matter:${matterId}. Status updated to "${task.status}" for taskId:${task.id}`,
        )
      }
    }
    const newTask = task.isNew
    await task.save({ session })

    return Ok({
      task,
      file,
      assignedToUpdated,
      newTask,
      isTaskRunning,
    })
  })

  await session.endSession()

  if (!result.ok) {
    throw new Error(
      `initTask() Error processing matter-name-refresh for matter ${matterId}: ${result.val}`,
      { cause: result.val },
    )
  }

  const { task, file, assignedToUpdated, newTask, isTaskRunning } = result.val

  await logger.info(
    `initTask() Task created @newTask:${newTask} isTaskRunning:${isTaskRunning} for Matter:${matterId} with taskId:${task.id} and fileId:${file.id} assignedToUpdated:${assignedToUpdated}`,
  )

  return { file, task, assignedToUpdated, newTask, isTaskRunning }
}

export const cca_matter_name_refresh = new Elysia()
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'CCA' }))
  .post(
    '/:id/name-refresh',
    async ({ params: { id }, ctx, body }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        taskStatus,
        johnny5Config,
      } = ctx

      const {
        pipedriveFileNotesEnabled,
        teamsNotifyEnabled,
        assignedToId,
        initiateMatterCreation,
        eventName,
      } = body ?? {}

      const ccaMatterNameRefresh: CcaMatterNameRefresh = {
        pipedriveFileNotesEnabled,
        teamsNotifyEnabled,
        assignedToId,
        initiateMatterCreation,
        eventName,
      }
      await logger.info(
        `Starting to process matter-name-refresh for Matter:${id}`,
        ccaMatterNameRefresh,
      )

      const { file, task, assignedToUpdated, newTask, isTaskRunning } =
        await initTask(tenant, id, johnny5Config, ccaMatterNameRefresh, logger)

      if (
        !assignedToUpdated &&
        !initiateMatterCreation &&
        eventName !== 'StepChanged'
      ) {
        await logger.info(
          `Ignore Task: No assignedToId change for Matter:${id}, taskId:${task.id}, fileId:${file.id}`,
          { newTask, isTaskRunning, assignedToId, assignedToUpdated },
        )
        return { id: task.id }
      }
      await logger.info(
        `Matter:${id} taskId:${task.id} fileId:${file.id} newTask:${newTask} assignedToId:${assignedToId} updated`,
      )

      if (isTaskRunning) {
        await logger.info(
          `Matter:${id} taskId:${task.id} fileId:${file.id} is already running, running new parallel task for matter-name-refresh`,
          { newTask, isTaskRunning, assignedToId, assignedToUpdated },
        )
      } else {
        await logger.debug(
          `Matter:${id} taskId:${task.id} fileId:${file.id} starting task`,
        )
        await taskStatus(task.id, file.id, 'started')
      }

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.actionstep-matter-name-refresh',
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
      body: ccaMatterNameRefreshSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Processing matter-name-refresh',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
