import { JobModel } from '@dbc-tech/johnny5-mongodb'
import { idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { generateDocumentSasTokenUrl } from '../../../utils/azure-utils'
import { jobContext } from '../../plugins/job-context.plugin'

export const contract_file = new Elysia({
  prefix: '/:id/contract-file',
})
  .use(jobContext())
  .get(
    '',
    async ({ params: { id }, status, ctx: { jwt, logger } }) => {
      const job = await JobModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      if (!job) return status(404, 'Job not found')

      const contractBlob = job.blobs?.find((b) => b.type === 'contract')
      if (!contractBlob)
        return status(404, 'Job does not contain a linked Contract file')

      await logger.debug(`Generating SAS token for file: ${contractBlob.name}`)
      const result = await generateDocumentSasTokenUrl(contractBlob.name)
      if (!result.ok) return status(400, result.val)

      const url = result.val

      await logger.debug(
        `Generating URL: ${url} from file: ${contractBlob.name}`,
      )

      return { url }
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: t.Object({ url: t.String() }),
        400: t.String(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get Contract file (url)',
        tags: ['Johnny5', 'Jobs', 'Contract Files'],
      },
    },
  )
