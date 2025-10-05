import {
  type ResthookPutPost,
  resthookPutPostSchema,
  resthooksSchema,
  singleResthookSchema,
} from '@dbc-tech/actionstep'
import { idIntSchema } from '@dbc-tech/johnny5'
import { Type } from '@sinclair/typebox'
import { Elysia } from 'elysia'
import {
  type GetMultipleRequest,
  GetMultipleRequestSchema,
} from '../../../schema'
import { RemoveNulls } from '../../../utils/object-utils'
import {
  convertBodyToQuery,
  filter,
  transformNullableToOptional,
} from '../../../utils/query-utils'
import { type AppContext, appContext } from '../../plugins/app-context.plugin'

export const resthooks = new Elysia()
  .use(appContext())
  .get(
    '/resthooks/:id',
    async ({
      params: { id },
      query,
      ctx,
    }: {
      params: { id: number }
      query: GetMultipleRequest
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.getResthook(id, filter(query)))
    },
    {
      params: idIntSchema,
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(singleResthookSchema),
      },
    },
  )
  .post(
    '/getresthooks',
    async ({
      body,
      ctx,
    }: {
      body: GetMultipleRequest
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      const query = convertBodyToQuery(body)
      return RemoveNulls(await as.getResthooks(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(resthooksSchema),
      },
    },
  )
  .put(
    '/resthooks/:id',
    async ({
      params: { id },
      body,
      ctx,
    }: {
      params: { id: number }
      body: ResthookPutPost
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.updateResthook(id, body))
    },
    {
      body: resthookPutPostSchema,
      response: {
        200: transformNullableToOptional(resthooksSchema),
      },
      params: Type.Object({
        id: Type.Number(),
      }),
    },
  )
  .post(
    '/resthooks',
    async ({
      body,
      ctx,
    }: {
      body: ResthookPutPost
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.createResthook(body))
    },
    {
      body: resthookPutPostSchema,
      response: {
        200: transformNullableToOptional(resthooksSchema),
      },
    },
  )
  .delete(
    '/resthooks/:id',
    async ({
      params: { id },
      ctx,
    }: {
      params: { id: number }
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return as.deleteResthook(id)
    },
    {
      params: Type.Object({
        id: Type.Number(),
      }),
    },
  )
