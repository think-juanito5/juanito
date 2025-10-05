import {
  type DbRefdataTypeForm,
  RefdataTypeFormModel,
  mapRefdataTypeform,
} from '@dbc-tech/johnny5-mongodb'
import {
  RefdataTypeFormCreate,
  RefdataTypeFormFieldRefUpdate,
  RefdataTypeFormUpdate,
  refdataTypeFormFieldRefSchema,
  refdataTypeFormSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const typeform = new Elysia({
  prefix: '/typeform',
})
  .use(appContext())
  .post(
    '',
    async ({ body, status, ctx: { jwt } }) => {
      const newRefdata: DbRefdataTypeForm = {
        ...body,
        tenant: jwt.tenant,
      }
      const existingRefdata = await RefdataTypeFormModel.findOne({
        form_id: newRefdata.form_id,
        tenant: jwt.tenant,
      })
      if (existingRefdata) {
        return status(
          409,
          `Typeform Refdata with form_id ${newRefdata.form_id} already exists`,
        )
      }

      const model = new RefdataTypeFormModel(newRefdata)
      const refdata = await model.save()
      return refdata.form_id
    },
    {
      headers: authHeaderSchema,
      body: RefdataTypeFormCreate,
      response: {
        200: t.String(),
        400: t.String(),
        401: unauthorizedSchema,
        409: t.String(),
      },
      detail: {
        summary: 'Create a typeform refdata',
        tags: ['Johnny5', 'Refdata', 'Typeform'],
      },
    },
  )
  .get(
    '',
    async ({ ctx: { jwt } }) => {
      const q = RefdataTypeFormModel.find({ tenant: jwt.tenant })
      const response = await q.lean().exec()

      return response.map(mapRefdataTypeform)
    },
    {
      headers: authHeaderSchema,
      response: {
        200: t.Array(refdataTypeFormSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get all Typeform refdata with matching tags',
        tags: ['Johnny5', 'Refdata', 'Typeform'],
      },
    },
  )
  .get(
    ':form_id',
    async ({ params: { form_id }, ctx: { jwt }, status }) => {
      const response = await RefdataTypeFormModel.findOne({
        form_id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()
      if (!response) {
        return status(404, `Typeform Refdata with form_id ${form_id} not found`)
      }
      return mapRefdataTypeform(response)
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        form_id: t.String(),
      }),
      response: {
        200: refdataTypeFormSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Typeform Refdata by form_id',
        tags: ['Johnny5', 'Refdata', 'Typeform'],
      },
    },
  )
  .put(
    ':form_id',
    async ({ body, ctx: { jwt }, params: { form_id }, set, status }) => {
      const result = await RefdataTypeFormModel.updateOne(
        { form_id, tenant: jwt.tenant },
        body,
      ).exec()

      if (result.modifiedCount > 0) {
        set.status = 204
        return
      }
      return status(404, `Typeform Refdata with form_id ${form_id} not found`)
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        form_id: t.String(),
      }),
      body: RefdataTypeFormUpdate,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Update a Typeform Refdata by form_id',
        tags: ['Johnny5', 'Refdata', 'Typeform'],
      },
    },
  )
  .delete(
    ':form_id',
    async ({ params: { form_id }, ctx: { jwt }, set, status }) => {
      const result = await RefdataTypeFormModel.deleteOne({
        form_id,
        tenant: jwt.tenant,
      }).exec()

      if (result.deletedCount > 0) {
        set.status = 204
        return
      }
      return status(404, `Typeform Refdata with form_id ${form_id} not found`)
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        form_id: t.String(),
      }),
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Delete a Typeform Refdata by form_id',
        tags: ['Johnny5', 'Refdata', 'Typeform'],
      },
    },
  )
  .post(
    ':form_id/fields',
    async ({ params: { form_id }, body, status, ctx: { jwt } }) => {
      const existingRefdata = await RefdataTypeFormModel.findOne({
        form_id,
        tenant: jwt.tenant,
      })
      if (!existingRefdata) {
        return status(404, `Typeform Refdata with form_id ${form_id} not found`)
      }

      if (
        existingRefdata.field_refs?.some((f) => f.field_id === body.field_id)
      ) {
        return status(
          409,
          `Typeform Refdata with form_id ${form_id} already has field_id ${body.field_id}`,
        )
      }

      await RefdataTypeFormModel.updateOne(
        { form_id },
        { $push: { field_refs: body } },
      )

      return body.field_id
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        form_id: t.String(),
      }),
      body: refdataTypeFormFieldRefSchema,
      response: {
        200: t.String(),
        400: t.String(),
        404: t.String(),
        401: unauthorizedSchema,
        409: t.String(),
      },
      detail: {
        summary: 'Create a typeform refdata',
        tags: ['Johnny5', 'Refdata', 'Typeform'],
      },
    },
  )
  .put(
    ':form_id/fields/:field_id',
    async ({
      body,
      ctx: { jwt },
      params: { form_id, field_id },
      set,
      status,
    }) => {
      const existingRefdata = await RefdataTypeFormModel.findOne({
        form_id,
        tenant: jwt.tenant,
      })
      if (!existingRefdata) {
        return status(404, `Typeform Refdata with form_id ${form_id} not found`)
      }

      const result = await RefdataTypeFormModel.updateOne(
        { form_id, 'field_refs.field_id': field_id },
        { $set: { 'field_refs.$': { ...body, field_id } } },
      )
      if (result.modifiedCount > 0) {
        set.status = 204
        return
      }
      return status(
        404,
        `Typeform Refdata with form_id ${form_id} does not contain field_id ${field_id}`,
      )
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        form_id: t.String(),
        field_id: t.String(),
      }),
      body: RefdataTypeFormFieldRefUpdate,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Update a Typeform field reference by form_id and field_id',
        tags: ['Johnny5', 'Refdata', 'Typeform'],
      },
    },
  )
  .delete(
    ':form_id/fields/:field_id',
    async ({ params: { form_id, field_id }, ctx: { jwt }, set, status }) => {
      const existingRefdata = await RefdataTypeFormModel.findOne({
        form_id,
        tenant: jwt.tenant,
      })
      if (!existingRefdata) {
        return status(404, `Typeform Refdata with form_id ${form_id} not found`)
      }

      const result = await RefdataTypeFormModel.updateOne(
        { form_id },
        { $pull: { field_refs: { field_id } } },
      )
      if (result.modifiedCount > 0) {
        set.status = 204
        return
      }
      return status(
        404,
        `Typeform Refdata with form_id ${form_id} does not contain field_id ${field_id}`,
      )
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        form_id: t.String(),
        field_id: t.String(),
      }),
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Delete a Typeform field reference by form_id and field_id',
        tags: ['Johnny5', 'Refdata', 'Typeform'],
      },
    },
  )
