import {
  type DataCollectionRecordValuesPut,
  DataCollectionRecordValuesPutSchema,
  PagedDataCollectionRecordValuesSchema,
  SingleDataCollectionRecordValueSchema,
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

export const datacollectionrecordvalues = new Elysia()
  .use(appContext())
  .get(
    '/datacollectionrecordvalues/:id',
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
      return RemoveNulls(
        await as.getDataCollectionRecordValue(id, filter(query)),
      )
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleDataCollectionRecordValueSchema),
      },
    },
  )
  .post(
    '/getdatacollectionrecordvalues',
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
      return RemoveNulls(await as.getDataCollectionRecordValues(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedDataCollectionRecordValuesSchema),
      },
    },
  )
  .put(
    '/datacollectionrecordvalues/:id',
    async ({
      params: { id },
      body,
      ctx,
    }: {
      params: { id: string }
      body: DataCollectionRecordValuesPut
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.updateDataCollectionRecordValues(id, body))
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
      body: DataCollectionRecordValuesPutSchema,
      response: {
        200: transformNullableToOptional(PagedDataCollectionRecordValuesSchema),
      },
    },
  )
