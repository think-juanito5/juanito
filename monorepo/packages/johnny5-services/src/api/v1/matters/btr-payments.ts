import type { SingleAction } from '@dbc-tech/actionstep'
import { matterDetailsSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const btr_matter_payment = new Elysia({ prefix: '/:id/details' })
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'BTR' }))
  .get(
    '',
    async ({ params: { id }, ctx, status }) => {
      const as = ctx.actionstep()
      const action = (await as.getAction(id, {
        include: 'step',
      })) as SingleAction

      if (!action.actions.id) {
        return status(404, 'No matter found')
      }
      return {
        matterId: action.actions.id,
        status: action.actions.status,
      }
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        id: t.Number(),
      }),
      response: {
        200: matterDetailsSchema,
        401: unauthorizedSchema,
        404: t.String(),
        500: t.String(),
      },
      detail: {
        summary: 'Get matter information by id',
        tags: ['Johnny5', 'BTR Actionstep'],
      },
    },
  )
