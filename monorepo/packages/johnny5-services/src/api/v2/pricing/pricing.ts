import { priceSchema } from '@dbc-tech/dataverse'
import { idStringSchema } from '@dbc-tech/johnny5'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { queryInputSchema } from '@dbc-tech/pricing/pricing.schema'
import { Elysia, status, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const pricing = new Elysia({
  prefix: '/pricing',
})
  .use(appContext())
  .get(
    '',
    async ({ query, ctx: { pricing } }) => {
      if (!query.effectiveDate && !query.version)
        return status(
          400,
          'Effective date or version=current|draft is required',
        )
      const ccaPricing = pricing()
      const response = await ccaPricing.getPrices(query)
      return response
    },
    {
      headers: authHeaderSchema,
      query: queryInputSchema,
      response: {
        200: t.Array(priceSchema),
        204: t.String(),
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
    async ({ params: { id }, ctx: { pricing } }) => {
      const pr = pricing()
      const response = await pr.getPriceById(id)
      if (!response) {
        return status(204, 'Pricing not found for the given id')
      }
      return response
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: priceSchema,
        204: t.String(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Pricing by id',
        tags: ['Pricing'],
      },
    },
  )
