import {
  type ActionParticipantPostMultiple,
  ActionParticipantPostMultipleSchema,
} from '@dbc-tech/actionstep'
import { Type } from '@sinclair/typebox'
import { Elysia } from 'elysia'
import {
  ActionParticipantMergeSchema,
  type GetMultipleRequest,
  GetMultipleRequestSchema,
  type MergeActionParticipants,
} from '../../../schema'
import { RemoveNulls } from '../../../utils/object-utils'
import { convertBodyToQuery, filter } from '../../../utils/query-utils'
import { type AppContext, appContext } from '../../plugins/app-context.plugin'

export const actionparticipants = new Elysia()
  .use(appContext())
  .get(
    '/actionparticipants/:id',
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
      return RemoveNulls(await as.getActionParticipant(id, filter(query)))
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        // TODO: Revert to 200: transformNullableToOptional(PagedActionParticipantsSchema),
        200: Type.Unknown(),
      },
    },
  )
  .post(
    '/getactionparticipants',
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
      return RemoveNulls(await as.getActionParticipants(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        // TODO: Revert to 200: transformNullableToOptional(PagedActionParticipantsSchema),
        200: Type.Unknown(),
      },
    },
  )
  .post(
    '/actionparticipants',
    async ({
      body,
      ctx,
    }: {
      body: ActionParticipantPostMultiple
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.linkMultipleActionParticipants(body))
    },
    {
      body: ActionParticipantPostMultipleSchema,
      detail: {
        summary: 'Link multiple participants to the action',
      },
      response: {
        // TODO: Revert to 200: transformNullableToOptional(PagedActionParticipantsSchema),
        200: Type.Unknown(),
      },
    },
  )
  .delete(
    '/actionparticipants/:id',
    async ({ params: { id }, ctx }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return as.deleteActionParticipant(id)
    },
    {
      params: Type.Object({
        id: Type.String(),
      }),
    },
  )
  .post(
    '/mergeactionparticipants',
    async ({
      body,
      ctx,
    }: {
      body: MergeActionParticipants
      ctx: AppContext
    }) => {
      const { pacActionstep } = ctx
      const pac = pacActionstep()
      return RemoveNulls(await pac.mergeActionParticipants(body))
    },
    {
      body: ActionParticipantMergeSchema,
      detail: {
        summary: 'Reassign matters from one party to another',
      },
      response: {
        // TODO: Revert to 200: transformNullableToOptional(PagedActionParticipantsSchema),
        200: Type.Unknown(),
      },
    },
  )
