import {
  Defaults,
  idStringSchema,
  queryLimitSchema,
  querySortSchema,
  taskSchema,
  taskStatusSchema,
  taskTypeSchema,
} from '@dbc-tech/johnny5'
import { TaskModel, mapTask } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'
import { task_emails } from './tasks.email-logs'
import { task_logs } from './tasks.logs'

export const tasks = new Elysia({
  prefix: '/tasks',
})
  .use(appContext())
  .get(
    '',
    async ({ query, ctx: { jwt } }) => {
      const { limit, sort, status, type, latest } = query
      const q = TaskModel.find({ tenant: jwt.tenant })
        .limit(
          latest ? Defaults.query.latestLimit : limit || Defaults.query.limit,
        )
        .sort({ createdOn: sort === 'asc' ? 1 : -1 })
      if (status) q.where('status', status)
      if (type) q.where('type', type)

      const results = await q.lean().exec()

      return results.map(mapTask)
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        latest: t.Optional(t.Boolean()),
        limit: t.Optional(queryLimitSchema),
        sort: t.Optional(querySortSchema),
        status: t.Optional(taskStatusSchema),
        type: t.Optional(taskTypeSchema),
      }),
      response: {
        200: t.Array(taskSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get all Tasks with matching status',
        tags: ['Tasks'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const q = TaskModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      const result = await q.lean().exec()
      if (!result) {
        return status(404, `Task with id ${id} not found`)
      }
      return mapTask(result)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: taskSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Task by taskId',
        tags: ['Tasks'],
      },
    },
  )
  .use(task_logs)
  .use(task_emails)
