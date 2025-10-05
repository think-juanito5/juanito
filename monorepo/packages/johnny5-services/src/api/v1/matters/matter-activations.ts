import {
  type DbFile,
  type DbTask,
  FileModel,
  type Meta,
  TaskModel,
} from '@dbc-tech/johnny5-mongodb'
import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type Tenant,
  idIntSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import {
  matterCloseSchema,
  matterDeactivationSchema,
  matterReactivationSchema,
} from '@dbc-tech/johnny5/typebox/matter.schema'
import type { Logger } from '@dbc-tech/logger'
import { Elysia, t } from 'elysia'
import { defaultTeamsSubscribers } from '../../../utils/teams-utils'
import { appContext } from '../../plugins/app-context.plugin'

async function matterActivations(
  tenant: Tenant,
  id: number,
  reason: string,
  action: 'matter-deactivation' | 'matter-reactivation' | 'matter-close',
  johnny5Config: Johnny5ConfigService,
  logger: Logger,
) {
  let file = await FileModel.findOne({
    tenant,
    actionStepMatterId: id,
  })
  if (!file) {
    file = new FileModel<DbFile>({
      tenant,
      serviceType: 'internal',
      sourceReason: `${action} for Matter:${id}`,
      actionStepMatterId: id,
      createdOn: new Date(),
    })
    await file.save()
  }

  const meta: Meta[] = []
  meta.push({ key: 'filenote', value: reason })

  const teamsSubscribers = await defaultTeamsSubscribers(johnny5Config, logger)

  const task = new TaskModel<DbTask>({
    tenant,
    fileId: file.id,
    type: action,
    status: 'started',
    createdOn: new Date(),
    emailSubscribers: [],
    teamsSubscribers: teamsSubscribers,
    meta,
  })
  await task.save()

  return { file, task }
}

export const deactivate_matter = new Elysia()
  .use(appContext({ allowedTenants: ['CCA'] }))
  .post(
    '/:id/deactivate',
    async ({ params: { id }, ctx, body: { deactivationReason } }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        taskStatus,
        johnny5Config,
      } = ctx
      await logger.info(`Starting Matter Deactivation for Matter:${id}`)
      const { file, task } = await matterActivations(
        tenant,
        id,
        deactivationReason,
        'matter-deactivation',
        johnny5Config,
        logger,
      )
      await taskStatus(task.id, file.id, 'started')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.actionstep-matter-activations',
        },
        { taskId: task.id, fileId: file.id, tenant },
      )

      return { id: task.id }
    },
    {
      headers: authHeaderSchema,
      params: idIntSchema,
      body: matterDeactivationSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Deactivate Matter',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )

export const reactivate_matter = new Elysia()
  .use(appContext({ allowedTenants: ['CCA'] }))
  .post(
    '/:id/reactivate',
    async ({ params: { id }, ctx, body: { reactivationReason } }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        taskStatus,
        johnny5Config,
      } = ctx
      await logger.info(`Starting Matter Reactivation for Matter:${id}`)

      const { file, task } = await matterActivations(
        tenant,
        id,
        reactivationReason,
        'matter-reactivation',
        johnny5Config,
        logger,
      )

      await taskStatus(task.id, file.id, 'started')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.actionstep-matter-activations',
        },
        { taskId: task.id, fileId: file.id, tenant },
      )

      return { id: task.id }
    },
    {
      headers: authHeaderSchema,
      params: idIntSchema,
      body: matterReactivationSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Reactivate Matter',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )

export const close_matter = new Elysia()
  .use(appContext({ allowedTenants: ['CCA'] }))
  .post(
    '/:id/close',
    async ({ params: { id }, ctx, body: { closureReason } }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        taskStatus,
        johnny5Config,
      } = ctx
      await logger.info(`Starting Matter Closure for Matter:${id}`)

      const { file, task } = await matterActivations(
        tenant,
        id,
        closureReason,
        'matter-close',
        johnny5Config,
        logger,
      )

      await taskStatus(task.id, file.id, 'started')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.actionstep-matter-activations',
        },
        { taskId: task.id, fileId: file.id, tenant },
      )

      return { id: task.id }
    },
    {
      headers: authHeaderSchema,
      params: idIntSchema,
      body: matterCloseSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Close Matter',
        tags: ['Johnny5', 'Matters'],
      },
    },
  )
