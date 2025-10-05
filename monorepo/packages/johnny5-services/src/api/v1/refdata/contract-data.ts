import {
  type RefdataContractData,
  RefdataContractDataModel,
  mapRefdataContractData,
} from '@dbc-tech/johnny5-mongodb'
import { idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  RefdataContractDataCreate,
  RefdataContractDataUpdate,
  refdataContractDataSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const contractData = new Elysia({
  prefix: '/contract-data',
})
  .use(appContext())
  .post(
    '',
    async ({ body, ctx: { jwt } }) => {
      const payload: RefdataContractData = {
        ...body,
        tenant: jwt.tenant,
      }
      const model = new RefdataContractDataModel(payload)
      const refdata = await model.save()
      return refdata.id
    },
    {
      headers: authHeaderSchema,
      body: RefdataContractDataCreate,
      response: {
        200: t.String(),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Create a contract data refdata',
        tags: ['Johnny5', 'Refdata', 'Contract Data'],
      },
    },
  )
  .get(
    '',
    async ({ query: { tags }, ctx: { jwt } }) => {
      const q = RefdataContractDataModel.find({ tenant: jwt.tenant })
      if (tags && tags.length > 0) {
        q.where('tags', {
          $all: tags,
        })
      }

      const response = await q.lean().exec()

      return response.map(mapRefdataContractData)
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        tags: t.Optional(t.Array(t.String())),
      }),
      response: {
        200: t.Array(refdataContractDataSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get all contract data refdata with matching tags',
        tags: ['Johnny5', 'Refdata', 'Contract Data'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const response = await RefdataContractDataModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()
      if (!response) {
        return status(404, `Contract Data Refdata with id ${id} not found`)
      }
      return {
        ...response,
        id: response._id.toString(),
      }
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: refdataContractDataSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Contract Data Refdata by id',
        tags: ['Johnny5', 'Refdata', 'Contract Data'],
      },
    },
  )
  .put(
    ':id',
    async ({ body, ctx: { jwt }, params: { id }, set, status }) => {
      const result = await RefdataContractDataModel.updateOne(
        { _id: id, tenant: jwt.tenant },
        body,
      ).exec()

      if (result.modifiedCount > 0) {
        set.status = 204
        return
      }
      return status(404, `Contract Data Refdata with id ${id} not found`)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      body: RefdataContractDataUpdate,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Update a Contract Data Refdata by id',
        tags: ['Johnny5', 'Refdata', 'Contract Data'],
      },
    },
  )
  .delete(
    ':id',
    async ({ params: { id }, ctx: { jwt }, set, status }) => {
      const result = await RefdataContractDataModel.deleteOne({
        _id: id,
        tenant: jwt.tenant,
      }).exec()

      if (result.deletedCount > 0) {
        set.status = 204
        return
      }
      return status(404, `Contract Data Refdata with id ${id} not found`)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Delete a Contract Data Refdata by id',
        tags: ['Johnny5', 'Refdata', 'Contract Data'],
      },
    },
  )
