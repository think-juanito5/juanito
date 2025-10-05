import {
  Defaults,
  idStringSchema,
  jobSchema,
  jobStatusSchema,
  jobTypeSchema,
  queryLimitSchema,
  querySortSchema,
} from '@dbc-tech/johnny5'
import { JobModel, mapJob } from '@dbc-tech/johnny5-mongodb'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'
import { btr } from './btr/btr'
import { cca_raqs } from './jobs.cca-raqs'
import { contract_data } from './jobs.contract-data'
import { contract_file } from './jobs.contract-file'
import { email_logs } from './jobs.email-logs'
import { logs } from './jobs.logs'
import { matters } from './jobs.matters'

export const jobs = new Elysia({
  prefix: '/jobs',
})
  .use(appContext())
  .get(
    '',
    async ({ query, ctx: { jwt } }) => {
      const { limit, sort, status, type, latest } = query
      const q = JobModel.find({ tenant: jwt.tenant })
        .limit(
          latest ? Defaults.query.latestLimit : limit || Defaults.query.limit,
        )
        .sort({ createdOn: sort === 'asc' ? 1 : -1 })
      if (status) q.where('status', status)
      if (type) q.where('type', type)

      const results = await q.lean().exec()

      return results.map(mapJob)
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        latest: t.Optional(t.Boolean()),
        limit: t.Optional(queryLimitSchema),
        sort: t.Optional(querySortSchema),
        status: t.Optional(jobStatusSchema),
        type: t.Optional(jobTypeSchema),
      }),
      response: {
        200: t.Array(jobSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Get all Jobs with matching status',
        tags: ['Jobs'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const q = JobModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      const result = await q.lean().exec()
      if (!result) {
        return status(404, `Job with id ${id} not found`)
      }
      return mapJob(result)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: jobSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Job by jobId',
        tags: ['Jobs'],
      },
    },
  )
  .use(contract_file)
  .use(matters)
  .use(contract_data)
  .use(logs)
  .use(email_logs)
  .use(btr)
  .use(cca_raqs)
