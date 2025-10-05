import { EmailLogModel, mapEmailLog } from '@dbc-tech/johnny5-mongodb'
import { emailLogSchema, idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { taskContext } from '../../plugins/task-context.plugin'

export const task_emails = new Elysia({
  prefix: '/:id/emails',
})
  .use(taskContext())
  .get(
    '',
    async ({ params: { id }, ctx: { jwt } }) => {
      const emailLogs = await EmailLogModel.find({
        taskId: id,
        tenant: jwt.tenant,
      })
        .sort({ createdOn: -1 })
        .lean()
        .exec()

      return emailLogs.map(mapEmailLog)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: t.Array(emailLogSchema),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get Email Logs',
        tags: ['Johnny5', 'Tasks', 'Email Logs'],
      },
    },
  )
