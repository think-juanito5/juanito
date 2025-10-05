import {
  type FileNotePost,
  FileNotePostSchema,
  PagedFileNotesSchema,
  SingleFileNoteSchema,
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

export const filenotes = new Elysia()
  .use(appContext())
  .get(
    '/filenotes/:id',
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
      return RemoveNulls(await as.getFileNote(id, filter(query)))
    },
    {
      params: Type.Object({
        id: Type.Number(),
      }),
      query: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(SingleFileNoteSchema),
      },
    },
  )
  .post(
    '/getfilenotes',
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
      return RemoveNulls(await as.getFileNotes(query))
    },
    {
      body: GetMultipleRequestSchema,
      response: {
        200: transformNullableToOptional(PagedFileNotesSchema),
      },
    },
  )
  .post(
    '/filenotes',
    async ({
      body,
      ctx,
    }: {
      body: FileNotePost
      ctx: AppContext
    }) => {
      const { actionstep } = ctx
      const as = actionstep()
      return RemoveNulls(await as.createFileNote(body))
    },
    {
      body: FileNotePostSchema,
      response: {
        200: transformNullableToOptional(SingleFileNoteSchema),
      },
    },
  )
