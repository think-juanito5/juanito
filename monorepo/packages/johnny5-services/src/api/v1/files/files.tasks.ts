import { idStringSchema, taskSchema } from '@dbc-tech/johnny5'
import { TaskModel, mapTask } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { fileContext } from '../../plugins/file-context.plugin'

export const tasks = new Elysia({
  prefix: '/:id/tasks',
})
  .use(fileContext())
  .get(
    '',
    async ({ params: { id }, ctx: { jwt } }) => {
      const tasks = await TaskModel.find({
        fileId: id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()

      return tasks.map(mapTask)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: t.Array(taskSchema),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get Tasks',
        tags: ['Johnny5', 'Files', 'Tasks'],
      },
    },
  )
