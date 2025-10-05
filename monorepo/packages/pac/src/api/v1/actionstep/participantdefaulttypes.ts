import {
  type ParticipantDefaultTypesPost,
  ParticipantDefaultTypesPostSchema,
} from '@dbc-tech/actionstep'
import { Type } from '@sinclair/typebox'
import { Elysia } from 'elysia'
import {
  type GetMultipleRequest,
  GetMultipleRequestSchema,
} from '../../../schema'
import { RemoveNulls } from '../../../utils/object-utils'
import { convertBodyToQuery, filter } from '../../../utils/query-utils'
import { type AppContext, appContext } from '../../plugins/app-context.plugin'

export const participantdefaulttypes = new Elysia()
  .use(appContext())
  .get(
    '/participantdefaulttypes/:id',
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
      return RemoveNulls(await as.getParticipantDefaultType(id, filter(query)))
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        // 200: transformNullableToOptional(SingleParticipantDefaultTypesSchema),
        200: Type.Unknown(),
      },
    },
  )
  .post(
    '/getparticipantdefaulttypes',
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
      const out = RemoveNulls(await as.getParticipantDefaultTypes(query))
      return out
    },
    {
      response: {
        200: Type.Unknown(),
      },
      body: GetMultipleRequestSchema,
    },
  )
  .post(
    '/participantdefaulttypes',
    async ({
      body,
      ctx,
    }: {
      body: ParticipantDefaultTypesPost
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.createParticipantDefaultType(body))
    },
    {
      body: ParticipantDefaultTypesPostSchema,
      response: {
        // 200: transformNullableToOptional(SingleParticipantDefaultTypesSchema),
        200: Type.Unknown(),
      },
    },
  )
  .delete(
    '/participantdefaulttypes/:id--:targetParticipantTypeId',
    async ({
      params: { id, targetParticipantTypeId },
      ctx,
    }: {
      params: { id: string; targetParticipantTypeId: string }
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return as.deleteParticipantDefaultType(id, targetParticipantTypeId)
    },
    {
      params: Type.Object({
        id: Type.String(),
        targetParticipantTypeId: Type.String(),
      }),
    },
  )
