import {
  PagedTasksSchema,
  SingleTaskSchema,
  type TaskPost,
  TaskPostSchema,
  type TaskPut,
  TaskPutSchema,
} from '@dbc-tech/actionstep'
import { idIntSchema } from '@dbc-tech/johnny5'
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

export const tasks = new Elysia()
  .use(appContext())
  .get(
    '/tasks/:id',
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
      return RemoveNulls(await as.getTask(id, filter(query)))
    },
    {
      params: idIntSchema,
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleTaskSchema),
      },
    },
  )
  .post(
    '/gettasks',
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
      return RemoveNulls(await as.getTasks(filter(query)))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedTasksSchema),
      },
    },
  )
  .post(
    '/tasks',
    async ({
      body,
      ctx,
    }: {
      body: TaskPost
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.createTask(body))
    },
    {
      body: TaskPostSchema,
      response: {
        200: transformNullableToOptional(SingleTaskSchema),
      },
    },
  )
  .put(
    '/tasks/:id',
    async ({
      params: { id },
      body,
      ctx,
    }: {
      params: { id: number }
      body: TaskPut
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.updateTask(id, body))
    },
    {
      params: idIntSchema,
      body: TaskPutSchema,
      response: {
        200: transformNullableToOptional(SingleTaskSchema),
      },
    },
  )
