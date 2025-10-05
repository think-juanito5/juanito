import {
  PagedActionDocumentFolderSchema,
  SingleActionDocumentFolderSchema,
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

export const actionfolders = new Elysia()
  .use(appContext())
  .get(
    '/actionfolders/:id',
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
      return RemoveNulls(await as.getActionFolderv2(id, filter(query)))
    },
    {
      params: Type.Object({
        id: Type.Number(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleActionDocumentFolderSchema),
      },
    },
  )
  .post(
    '/getactionfolders',
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
      return RemoveNulls(await as.getActionFoldersv2(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedActionDocumentFolderSchema),
        204: Type.Null(),
      },
    },
  )
