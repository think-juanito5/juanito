import {
  type Johnny5Config,
  Johnny5ConfigModel,
  mapJohnny5Config,
} from '@dbc-tech/johnny5-mongodb'
import { idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  RefdataConfigCreate,
  RefdataConfigUpdate,
  refdataConfigSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const configs = new Elysia({
  prefix: '/configs',
})
  .use(appContext())
  .post(
    '',
    async ({ body, ctx: { jwt } }) => {
      const payload: Johnny5Config = {
        ...body,
        tenant: jwt.tenant,
        createdOn: new Date(),
      }
      const model = new Johnny5ConfigModel(payload)
      const refdata = await model.save()
      return refdata.id
    },
    {
      headers: authHeaderSchema,
      body: RefdataConfigCreate,
      response: {
        200: t.String(),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Create a config refdata',
        tags: ['Johnny5', 'Refdata', 'Config'],
      },
    },
  )
  .get(
    '',
    async ({ ctx: { jwt } }) => {
      const q = Johnny5ConfigModel.find({ tenant: jwt.tenant })
      const response = await q.lean().exec()

      return response.map(mapJohnny5Config)
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        tags: t.Optional(t.Array(t.String())),
      }),
      response: {
        200: t.Array(refdataConfigSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get all config refdata with matching tags',
        tags: ['Johnny5', 'Refdata', 'Config'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const response = await Johnny5ConfigModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()
      if (!response) {
        return status(404, `Config Refdata with id ${id} not found`)
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
        200: refdataConfigSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Config Refdata by id',
        tags: ['Johnny5', 'Refdata', 'Config'],
      },
    },
  )
  .put(
    ':id',
    async ({ body, ctx: { jwt }, params: { id }, set, status }) => {
      const result = await Johnny5ConfigModel.updateOne(
        { _id: id, tenant: jwt.tenant },
        { ...body, updatedOn: new Date() },
      ).exec()

      if (result.modifiedCount > 0) {
        set.status = 204
        return
      }
      return status(404, `Config Refdata with id ${id} not found`)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      body: RefdataConfigUpdate,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Update a Config Refdata by id',
        tags: ['Johnny5', 'Refdata', 'Config'],
      },
    },
  )
  .delete(
    ':id',
    async ({ params: { id }, ctx: { jwt }, set, status }) => {
      const result = await Johnny5ConfigModel.deleteOne({
        _id: id,
        tenant: jwt.tenant,
      }).exec()

      if (result.deletedCount > 0) {
        set.status = 204
        return
      }
      return status(404, `Config Refdata with id ${id} not found`)
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
        summary: 'Delete a Config Refdata by id',
        tags: ['Johnny5', 'Refdata', 'Config'],
      },
    },
  )
