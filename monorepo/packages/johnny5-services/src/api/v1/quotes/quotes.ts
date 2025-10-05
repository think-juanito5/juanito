import { CcaRaqModel, QuoteModel, mapQuote } from '@dbc-tech/johnny5-mongodb'
import { Defaults } from '@dbc-tech/johnny5/constants'
import {
  australianStateSchema,
  bstSchema,
  idStringSchema,
  propertyTypeSchema,
  queryLimitSchema,
  querySortSchema,
  quoteSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const quotes = new Elysia({ prefix: '/quotes' })
  .use(appContext({}))
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const quote = QuoteModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      const quoteResult = await quote.lean().exec()
      if (!quoteResult) {
        return status(404, `Quote with id ${id} not found`)
      }

      const raq = CcaRaqModel.findOne({
        fileId: quoteResult.fileId,
        tenant: jwt.tenant,
      })
      const raqResult = await raq.lean().exec()
      if (!raqResult) {
        return status(404, `RAQ with File id ${quoteResult.fileId} not found`)
      }

      return mapQuote(quoteResult, raqResult)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: quoteSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Quote by id',
        tags: ['Johnny5', 'Quote'],
      },
    },
  )
  .get(
    '',
    async ({ query, ctx: { jwt } }) => {
      const { latest, limit, sort, state, bst, propertyType } = query
      const q = QuoteModel.find({
        tenant: jwt.tenant,
      })
        .limit(
          latest ? Defaults.query.latestLimit : limit || Defaults.query.limit,
        )
        .sort({ createdOn: sort === 'asc' ? 1 : -1 })
      if (state) q.where('state', state)
      if (bst) q.where('bst', bst)
      if (propertyType) q.where('propertyType', propertyType)

      const quotes = await q.lean().exec()

      return quotes.map((q) => mapQuote(q))
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        latest: t.Optional(t.Boolean()),
        limit: t.Optional(queryLimitSchema),
        sort: t.Optional(querySortSchema),
        state: t.Optional(australianStateSchema),
        bst: t.Optional(bstSchema),
        propertyType: t.Optional(propertyTypeSchema),
      }),
      response: {
        200: t.Array(quoteSchema),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get Quotes',
        tags: ['Johnny5', 'Quote'],
      },
    },
  )
