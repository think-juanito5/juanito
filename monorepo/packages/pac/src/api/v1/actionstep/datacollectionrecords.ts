import {
  type DataCollectionRecordPost,
  DataCollectionRecordPostSchema,
  PagedDataCollectionRecordsSchema,
  SingleDataCollectionRecordSchema,
} from '@dbc-tech/actionstep'
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

export const datacollectionrecords = new Elysia()
  .use(appContext())
  .post(
    '/getdatacollectionrecords',
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
      return RemoveNulls(await as.getDataCollectionRecords(filter(query)))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedDataCollectionRecordsSchema),
      },
    },
  )
  .post(
    '/datacollectionrecords',
    async ({
      body,
      ctx,
    }: {
      body: DataCollectionRecordPost
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.createDataCollectionRecord(body))
    },
    {
      body: DataCollectionRecordPostSchema,
      response: {
        200: transformNullableToOptional(SingleDataCollectionRecordSchema),
      },
      detail: {
        summary: 'Create a data collection record',
        description: 'Create a data collection record',
      },
    },
  )
