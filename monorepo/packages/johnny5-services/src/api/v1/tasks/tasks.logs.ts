import { AuditLogModel, mapAuditLog } from '@dbc-tech/johnny5-mongodb'
import { Defaults } from '@dbc-tech/johnny5/constants'
import {
  auditLogSchema,
  idStringSchema,
  logLevelSchema,
  queryLimitSchema,
  querySortSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { taskContext } from '../../plugins/task-context.plugin'

export const task_logs = new Elysia({
  prefix: '/:id/logs',
})
  .use(taskContext())
  .get(
    '',
    async ({ params: { id }, ctx: { jwt }, query }) => {
      const { limit, sort, level } = query
      const q = AuditLogModel.find({ tenant: jwt.tenant, taskId: id })
        .limit(limit || Defaults.query.limit)
        .sort({ createdOn: sort === 'asc' ? 1 : -1 })
      if (level) q.where('logLevel', level)

      const results = await q.lean().exec()
      return results.map(mapAuditLog)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      query: t.Object({
        limit: t.Optional(queryLimitSchema),
        sort: t.Optional(querySortSchema),
        level: t.Optional(t.Array(logLevelSchema)),
      }),
      response: {
        200: t.Array(auditLogSchema),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get Logs',
        tags: ['Johnny5', 'Tasks', 'Logs'],
      },
    },
  )
