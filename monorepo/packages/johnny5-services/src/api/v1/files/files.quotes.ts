import { QuoteModel, mapQuote } from '@dbc-tech/johnny5-mongodb'
import { idStringSchema, quoteSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { fileContext } from '../../plugins/file-context.plugin'

export const quotes = new Elysia({ prefix: '/:id/quotes' })
  .use(fileContext())
  .get(
    '',
    async ({ params: { id }, ctx: { jwt } }) => {
      const q = QuoteModel.find({
        fileId: id,
        tenant: jwt.tenant,
      })
      const quotes = await q.lean().exec()
      return quotes.map((q) => mapQuote(q))
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
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
