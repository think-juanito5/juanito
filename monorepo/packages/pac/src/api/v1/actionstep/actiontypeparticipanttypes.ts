import { pagedActionTypeParticipantTypesSchema } from '@dbc-tech/actionstep'
import { Elysia } from 'elysia'
import {
  type GetMultipleRequest,
  GetMultipleRequestSchema,
} from '../../../schema'
import { RemoveNulls } from '../../../utils/object-utils'
import {
  convertBodyToQuery,
  transformNullableToOptional,
} from '../../../utils/query-utils'
import { type AppContext, appContext } from '../../plugins/app-context.plugin'

export const actiontypeparticipanttypes = new Elysia().use(appContext()).post(
  '/getactiontypeparticipanttypes',
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
    return RemoveNulls(await as.getActionTypeParticipantTypes(query))
  },
  {
    response: {
      200: transformNullableToOptional(pagedActionTypeParticipantTypesSchema),
    },
    body: GetMultipleRequestSchema,
  },
)
