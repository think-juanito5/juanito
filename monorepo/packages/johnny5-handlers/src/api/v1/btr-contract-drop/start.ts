import {
  J5Config,
  dapr,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { ContractDataModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { Elysia } from 'elysia'
import { ObjectId } from 'mongodb'
import { serializeError } from 'serialize-error'
import { mapPowerappDocument } from '../../../johnny5-helper'
import type { PowerappExtractResponse } from '../../../johnny5-helper/powerapp-workflow.schema'
import { generateDocumentSasTokenUrl } from '../../../utils/azure-utils'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'v1.btr-contract-drop.start' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '',
    async ({ body, ctx }) => {
      const { logger, johnny5Config, status, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to extract data for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const contractBlob = job.blobs?.find((b) => b.type === 'contract')
      if (!contractBlob) {
        await logger.warn(
          `File Id:${fileId} does not contain a linked Contract file`,
        )
        return dapr.drop
      }

      const blobName = contractBlob.name

      await logger.debug(`Generating SAS token for file: ${blobName}`)
      const result = await generateDocumentSasTokenUrl(blobName)
      if (!result.ok) {
        await logger.warn(
          `Error generating sas token for Contract File: ${blobName} in File Id:${fileId}, Job Id:${jobId}`,
          result.val,
        )
        return dapr.drop
      }

      const url = result.val

      await logger.debug(`Generating URL: ${url} from file: ${blobName}`)

      let documentResponse: PowerappExtractResponse
      try {
        const pa = ctx.powerapp()
        const powerAutomateUrl = await johnny5Config.get(
          J5Config.btr.powerAutomate.fileOpeningExtractUrl,
        )
        if (!powerAutomateUrl) throw new Error('Power Automate URL not found')
        documentResponse = await pa.sendDocumentToExtract(
          powerAutomateUrl.value,
          { url },
        )
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error extracting document through Powerapp for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await status(
          'error-processing',
          `Error extracting document through Powerapp: ${errJson}`,
        )

        return dapr.drop
      }

      const ufd = mapPowerappDocument(documentResponse)
      const contractData = new ContractDataModel({
        ...ufd,
        tenant: job.tenant,
        fileId: new ObjectId(fileId),
        jobId: job._id,
        contractDocumentBlobName: blobName,
      })
      await contractData.save()

      await status('hitl-waiting')

      await logger.info(
        `Finished extracting data for File Id:${fileId}, Job Id:${jobId}`,
      )

      return dapr.success
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
