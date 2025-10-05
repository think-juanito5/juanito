import { CcaRaqModel, FileModel, mapRaq } from '@dbc-tech/johnny5-mongodb'
import { ccaRaqSchema, idIntSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const cca_raqs = new Elysia({
  prefix: '/:id/cca-raq',
})
  .use(appContext())
  .get(
    '',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const file = await FileModel.findOne({
        actionStepMatterId: id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()

      if (!file) return status(404, 'RAQ not found')

      const raq = await CcaRaqModel.findOne({
        fileId: file._id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()

      if (!raq) return status(404, 'RAQ not found')

      return mapRaq(raq)
    },
    {
      headers: authHeaderSchema,
      params: idIntSchema,
      response: {
        200: ccaRaqSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get RAQ',
        tags: ['Johnny5', 'Matters', 'RAQ'],
      },
    },
  )
