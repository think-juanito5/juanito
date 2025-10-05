import {
  Defaults,
  australianStateSchema,
  bstSchema,
  ccaRaqSchema,
  idStringSchema,
  propertyTypeSchema,
  queryLimitSchema,
  querySortSchema,
} from '@dbc-tech/johnny5'
import { CcaRaqModel, mapRaq } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const cca_raqs = new Elysia({
  prefix: '/cca-raqs',
})
  .use(appContext())
  .get(
    '',
    async ({ query, ctx: { jwt } }) => {
      const {
        latest,
        limit,
        sort,
        firstName,
        lastName,
        email,
        phone,
        cid,
        state,
        bst,
        propertyType,
      } = query
      const q = CcaRaqModel.find({ tenant: jwt.tenant })
        .limit(
          latest ? Defaults.query.latestLimit : limit || Defaults.query.limit,
        )
        .sort({ createdOn: sort === 'asc' ? 1 : -1 })
      if (firstName) q.where('firstName', firstName)
      if (lastName) q.where('lastName', lastName)
      if (email) q.where('email', email)
      if (phone) q.where('phone', phone)
      if (cid) q.where('cid', cid)
      if (state) q.where('state', state)
      if (bst) q.where('bst', bst)
      if (propertyType) q.where('propertyType', propertyType)

      const results = await q.lean().exec()

      return results.map(mapRaq)
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        latest: t.Optional(t.Boolean()),
        limit: t.Optional(queryLimitSchema),
        sort: t.Optional(querySortSchema),
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        cid: t.Optional(t.String()),
        state: t.Optional(australianStateSchema),
        bst: t.Optional(bstSchema),
        propertyType: t.Optional(propertyTypeSchema),
      }),
      response: {
        200: t.Array(ccaRaqSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get all CCA RAQs',
        tags: ['Johnny5', 'RAQ'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const q = CcaRaqModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      const result = await q.lean().exec()
      if (!result) {
        return status(404, `RAQ with id ${id} not found`)
      }
      return mapRaq(result)
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
        summary: 'Get a CCA RAQ by id',
        tags: ['Johnny5', 'RAQ'],
      },
    },
  )
