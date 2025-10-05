import { idStringSchema, jobSchema } from '@dbc-tech/johnny5'
import { JobModel, mapJob } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { fileContext } from '../../plugins/file-context.plugin'

export const jobs = new Elysia({
  prefix: '/:id/jobs',
})
  .use(fileContext())
  .get(
    '',
    async ({ params: { id }, ctx: { jwt } }) => {
      const jobs = await JobModel.find({
        fileId: id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()

      return jobs.map(mapJob)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: t.Array(jobSchema),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get Jobs',
        tags: ['Johnny5', 'Files', 'Jobs'],
      },
    },
  )
