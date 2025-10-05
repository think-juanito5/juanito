import {
  PagedParticipantDataFieldValuesSchema,
  type SingleParticipantDataFieldValue,
  SingleParticipantDataFieldValueSchema,
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

export const participantdatafieldvalues = new Elysia()
  .use(appContext())
  .get(
    '/participantdatafieldvalues/:id',
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
        await as.getParticipantDataFieldValue(id, filter(query)),
      )
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleParticipantDataFieldValueSchema),
      },
    },
  )
  .post(
    '/getparticipantdatafieldvalues',
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
      return RemoveNulls(await as.getParticipantDataFieldValues(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedParticipantDataFieldValuesSchema),
      },
    },
  )
  .put(
    '/participantdatafieldvalues/:id',
    async ({
      params: { id },
      body,
      ctx,
    }: {
      params: { id: string }
      body: SingleParticipantDataFieldValue
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.updateParticipantDataFieldValue(id, body))
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
      body: SingleParticipantDataFieldValueSchema,
      response: {
        200: transformNullableToOptional(SingleParticipantDataFieldValueSchema),
      },
    },
  )
