import {
  type ActionPut,
  ActionPutSchema,
  PagedActionsSchema,
  SingleActionSchema,
} from '@dbc-tech/actionstep'
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

export const actions = new Elysia()
  .use(appContext())
  .get(
    '/actions/:id',
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
      return RemoveNulls(await as.getAction(id, filter(query)))
    },
    {
      params: Type.Object({
        id: Type.Number(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleActionSchema),
      },
    },
  )
  .post(
    '/getactions',
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
      return RemoveNulls(await as.getActions(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedActionsSchema),
      },
    },
  )
  .put(
    '/actions/:id',
    async ({
      params: { id },
      body,
      ctx,
    }: {
      params: { id: number }
      body: ActionPut
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.updateAction(id, body))
    },
    {
      params: Type.Object({
        id: Type.Number(),
      }),
      body: ActionPutSchema,
      response: {
        200: transformNullableToOptional(SingleActionSchema),
      },
    },
  )
