import {
  PagedParticipantTypeDataFieldsSchema,
  SingleParticipantTypeDataFieldSchema,
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

export const participanttypedatafields = new Elysia()
  .use(appContext())
  .get(
    '/participanttypedatafields/:id',
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
      return RemoveNulls(
        await as.getParticipantTypeDataField(id, filter(query)),
      )
    },
    {
      params: idIntSchema,
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleParticipantTypeDataFieldSchema),
      },
    },
  )
  .post(
    '/getparticipanttypedatafields',
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
      return RemoveNulls(await as.getParticipantTypeDataFields(filter(query)))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedParticipantTypeDataFieldsSchema),
      },
    },
  )
