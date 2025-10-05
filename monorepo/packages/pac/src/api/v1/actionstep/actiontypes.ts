import {
  PagedActionTypesSchema,
  SingleActionTypeSchema,
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

export const actiontypes = new Elysia()
  .use(appContext())
  .get(
    '/actiontypes/:id',
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
      return RemoveNulls(await as.getActionType(id, filter(query)))
    },
    {
      params: Type.Object({
        id: Type.Number(),
      }),
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleActionTypeSchema),
      },
    },
  )
  .post(
    '/getactiontypes',
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
      return RemoveNulls(await as.getActionTypes(filter(query)))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedActionTypesSchema),
      },
    },
  )
