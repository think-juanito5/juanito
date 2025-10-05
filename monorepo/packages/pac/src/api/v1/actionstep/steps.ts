import { PagedStepsSchema, SingleStepSchema } from '@dbc-tech/actionstep'
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

export const steps = new Elysia()
  .use(appContext())
  .get(
    '/steps/:id',
    async ({
      params: { id },
      query,
      ctx,
    }: {
      params: { id: string }
      query: GetMultipleRequest
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.getStep(id, filter(query)))
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleStepSchema),
      },
    },
  )
  .post(
    '/getsteps',
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
      return RemoveNulls(await as.getSteps(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedStepsSchema),
      },
    },
  )
