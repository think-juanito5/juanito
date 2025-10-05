import {
  PagedParticipantTypesSchema,
  SingleParticipantTypeSchema,
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

export const participanttypes = new Elysia()
  .use(appContext())
  .get(
    '/participanttypes/:id',
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
      return RemoveNulls(await as.getParticipantType(id, filter(query)))
    },
    {
      params: idIntSchema,
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleParticipantTypeSchema),
      },
    },
  )
  .post(
    '/getparticipanttypes',
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
      return RemoveNulls(await as.getParticipantTypes(query))
    },
    {
      response: {
        200: transformNullableToOptional(PagedParticipantTypesSchema),
      },
      body: GetMultipleRequestSchema,
    },
  )
