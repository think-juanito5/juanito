import { ContractDataModel, mapContractData } from '@dbc-tech/johnny5-mongodb'
import { contractDataSchema, idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'

export const contract_data = new Elysia({
  prefix: '/:id/contract-data',
})
  .use(jobContext())
  .get(
    '',
    async ({ params: { id }, status, ctx: { jwt } }) => {
      const contractData = await ContractDataModel.findOne({
        jobId: id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()
      if (!contractData) return status(404, 'Contract not found')

      return mapContractData(contractData)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: contractDataSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get Contract data',
        tags: ['Johnny5', 'Jobs', 'Contract Data'],
      },
    },
  )
