import { idStringSchema, matterCreateSchema } from '@dbc-tech/johnny5'
import { MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
import { mapMatterCreate } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'

export const matters = new Elysia({
  prefix: '/:id/matter-manifest',
})
  .use(jobContext())
  .get(
    '',
    async ({ params: { id }, status, ctx: { jwt } }) => {
      const matterData = await MatterCreateModel.findOne({
        jobId: id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()
      if (!matterData) return status(404, 'Matter manifest not found')

      return mapMatterCreate(matterData)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: matterCreateSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get Matter Manifest',
        tags: ['Johnny5', 'Jobs', 'Matters'],
      },
    },
  )
