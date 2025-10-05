import { CcaRaqModel, mapRaq } from '@dbc-tech/johnny5-mongodb'
import { ccaRaqSchema, idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'

export const cca_raqs = new Elysia().use(jobContext()).get(
  '/:id/cca-raq',
  async ({ params: { id }, ctx: { jwt }, status }) => {
    const raq = await CcaRaqModel.findOne({
      jobId: id,
      tenant: jwt.tenant,
    })
      .lean()
      .exec()

    if (!raq) return status(404, 'RAQ not found')

    return mapRaq(raq)
  },
  {
    headers: authHeaderSchema,
    params: idStringSchema,
    response: {
      200: ccaRaqSchema,
      401: unauthorizedSchema,
      404: t.String(),
    },
    detail: {
      summary: 'Get RAQ',
      tags: ['Johnny5', 'Jobs', 'RAQ'],
    },
  },
)
