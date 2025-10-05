import {
  australianStateSchema,
  bstSchema,
  idStringSchema,
  pricingFeesSchema,
  propertyTypeSchema,
} from '@dbc-tech/johnny5'
import { PricingFeesModel, mapPricingFees } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const pricing = new Elysia({
  prefix: '/pricing',
})
  .use(appContext())
  .get(
    '',
    async ({ query, ctx: { jwt } }) => {
      const { state, bst, propertyType, version } = query
      const q = PricingFeesModel.find({ tenant: jwt.tenant })

      if (state) q.where('state', state)
      if (bst) q.where('bst', bst)
      if (propertyType) q.where('propertyType', propertyType)
      if (version) q.where('version', version)

      const results = await q.lean().exec()

      return results.map(mapPricingFees)
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        state: t.Optional(australianStateSchema),
        bst: t.Optional(bstSchema),
        propertyType: t.Optional(propertyTypeSchema),
        version: t.Optional(t.Number()),
      }),
      response: {
        200: t.Array(pricingFeesSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Search for pricing fees with matching criteria',
        tags: ['Pricing'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const q = PricingFeesModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      const result = await q.lean().exec()
      if (!result) {
        return status(404, `Pricing with id ${id} not found`)
      }
      return mapPricingFees(result)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: pricingFeesSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Pricing by id',
        tags: ['Pricing'],
      },
    },
  )
