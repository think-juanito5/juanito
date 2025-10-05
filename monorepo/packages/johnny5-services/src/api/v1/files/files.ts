import {
  Defaults,
  fileSchema,
  idStringSchema,
  queryLimitSchema,
  querySortSchema,
  serviceTypeSchema,
} from '@dbc-tech/johnny5'
import { FileModel, mapFile } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'
import { batch_matter_close } from './files.batch-matter-close'
import { jobs } from './files.jobs'
import { logs } from './files.logs'
import { quotes } from './files.quotes'
import { tasks } from './files.tasks'

export const files = new Elysia({
  prefix: '/files',
})
  .use(appContext())
  .get(
    '',
    async ({ query, ctx: { jwt } }) => {
      const { latest, limit, sort, serviceType, matterId, dealId } = query
      const q = FileModel.find({ tenant: jwt.tenant })
        .limit(
          latest ? Defaults.query.latestLimit : limit || Defaults.query.limit,
        )
        .sort({ createdOn: sort === 'asc' ? 1 : -1 })

      if (serviceType) q.where('serviceType', serviceType)
      if (matterId) q.where('actionStepMatterId', matterId)
      if (dealId) q.where('pipedriveDealId', dealId)

      const results = await q.lean().exec()

      return results.map(mapFile)
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        latest: t.Optional(t.Boolean()),
        limit: t.Optional(queryLimitSchema),
        sort: t.Optional(querySortSchema),
        serviceType: t.Optional(serviceTypeSchema),
        matterId: t.Optional(t.Number()),
        dealId: t.Optional(t.Number()),
      }),
      response: {
        200: t.Array(fileSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get all Files with matching status',
        tags: ['Files'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const q = FileModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      const result = await q.lean().exec()
      if (!result) {
        return status(404, `File with fileId ${id} not found`)
      }
      return mapFile(result)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: fileSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a File by fileId',
        tags: ['Files'],
      },
    },
  )
  .use(jobs)
  .use(logs)
  .use(batch_matter_close)
  .use(quotes)
  .use(tasks)
