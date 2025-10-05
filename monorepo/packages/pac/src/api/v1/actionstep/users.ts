import { PagedUsersSchema, SingleUserSchema } from '@dbc-tech/actionstep'
import { Elysia, t } from 'elysia'
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

export const users = new Elysia()
  .use(appContext())
  .get(
    '/users/:id',
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
      return RemoveNulls(await as.getUser(id, filter(query)))
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleUserSchema),
      },
    },
  )
  .post(
    '/getusers',
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
      return RemoveNulls(await as.getUsers(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedUsersSchema),
      },
    },
  )
  .get(
    '/users/current',
    async ({
      query,
      ctx,
    }: {
      query: GetMultipleRequest
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.getCurrentUser(filter(query)))
    },
    {
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleUserSchema),
      },
    },
  )
