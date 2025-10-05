import {
  PagedParticipantsSchema,
  type ParticipantPut,
  ParticipantPutSchema,
  SingleParticipantSchema,
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

export const participants = new Elysia()
  .use(appContext())
  .get(
    '/participants/:id',
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
      return RemoveNulls(await as.getParticipant(id, filter(query)))
    },
    {
      params: Type.Object({
        id: Type.Number(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleParticipantSchema),
      },
    },
  )
  .post(
    '/getparticipants',
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
      return RemoveNulls(await as.getParticipants(query))
    },
    {
      response: {
        200: transformNullableToOptional(PagedParticipantsSchema),
      },
      body: GetMultipleRequestSchema,
    },
  )
  .post(
    '/participants',
    async ({
      body,
      ctx,
    }: {
      body: ParticipantPut
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.createParticipant(body))
    },
    {
      body: ParticipantPutSchema,
      response: {
        200: transformNullableToOptional(SingleParticipantSchema),
      },
    },
  )
  .put(
    '/participants/:id',
    async ({
      params: { id },
      body,
      ctx,
    }: {
      params: { id: number }
      body: ParticipantPut
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.updateParticipant(id, body))
    },
    {
      params: Type.Object({
        id: Type.Number(),
      }),
      body: ParticipantPutSchema,
      response: {
        200: transformNullableToOptional(SingleParticipantSchema),
      },
    },
  )
  .delete(
    '/participants/:id',
    async ({
      params: { id },
      ctx,
    }: {
      params: { id: string }
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return as.deleteParticipant(id)
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
    },
  )
