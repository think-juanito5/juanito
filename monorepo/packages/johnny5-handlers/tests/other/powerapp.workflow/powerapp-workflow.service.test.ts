import { beforeAll, describe, expect, it } from 'bun:test'
import { Readable } from 'stream'
import { createMongoDbConnection } from '@dbc-tech/johnny5-mongodb'
import { type PowerappExtractResponse } from '../../../src/johnny5-helper/powerapp-workflow.schema'
import { PowerappWorkflowService } from '../../../src/johnny5-helper/powerapp-workflow.service'
import { uploadDocumentoAzureStorage } from '../../../src/utils/azure-utils'

const powerAutomateUrl =
  'https://prod-14.australiasoutheast.logic.azure.com:443/workflows/a90e251e6c934201a1b2ec8c80d7fbd6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=/triggers/manual/run&sv=1.0&sig=ZMq_uHNhUtCkz3ueRmEYLOixkOPuVq645q6wlv-O2EU'

describe.skip('PowerappService', async () => {
  let powerapp: PowerappWorkflowService
  beforeAll(() => {
    powerapp = new PowerappWorkflowService({})
  })

  it(
    'should retrieve the extracted data from a Powerapp document - QLD-REIQ-Community_Titles',
    async () => {
      const url =
        'https://stdevspokedbc01.blob.core.windows.net/public/67257-230809-QLD-Signed Contract-67257.pdf'
      const response = await powerapp.sendDocumentToExtract(powerAutomateUrl, {
        url,
      })

      expect(response).toBeDefined()
      expect(response.responsev2).toHaveProperty('operationStatus', 'Success')
      expect(response.responsev2.predictionOutput).toHaveProperty(
        'layoutName',
        'QLD-REIQ-Community_Titles',
      )
      expect(
        response.responsev2.predictionOutput.labels.buyers_email,
      ).toHaveProperty('value', 'mark.putland69@gmail.com')
    },
    { timeout: 60000 },
  )

  it(
    'should upload a document to Azure Storage and retrieve the extracted data from a Powerapp document',
    async () => {
      const url =
        'https://stdevspokedbc01.blob.core.windows.net/public/64076-221213-QLD-Signed Contract-64076.pdf'

      const response = await powerapp.sendDocumentToExtract(powerAutomateUrl, {
        url,
      })

      expect(response).toBeDefined()
      expect(response.responsev2).toHaveProperty('operationStatus', 'Success')
    },
    { timeout: 60000 },
  )
})

describe.skip('PowerappService > uploadDocumentoAzureStorage', async () => {
  let powerapp: PowerappWorkflowService
  let response: PowerappExtractResponse
  beforeAll(async () => {
    await createMongoDbConnection()
    powerapp = new PowerappWorkflowService({})
  })

  it(
    'should upload the extracted data from a Powerapp document to Azure',
    async () => {
      const url =
        'https://stdevspokedbc01.blob.core.windows.net/public/67257-230809-QLD-Signed Contract-67257.pdf'
      response = await powerapp.sendDocumentToExtract(powerAutomateUrl, { url })

      expect(response).toBeDefined()
      expect(response.responsev2).toHaveProperty('operationStatus', 'Success')
      expect(response.responsev2.predictionOutput).toHaveProperty(
        'layoutName',
        'QLD-REIQ-Community_Titles',
      )
      expect(
        response.responsev2.predictionOutput.labels.buyers_email,
      ).toHaveProperty('value', 'mark.putland69@gmail.com')
    },
    { timeout: 60000 },
  )

  it(
    'should retrieve the extracted data from a Powerapp document',
    async () => {
      const resultData = JSON.stringify(response)
      const resultStream = Readable.from(resultData)
      const blobName = '67257-230809-QLD-SignedContract-67257-data.json'
      const uploadResult = await uploadDocumentoAzureStorage(
        blobName,
        resultStream,
      )
      expect(uploadResult).toBeDefined()
    },
    { timeout: 60000 },
  )
})

// describe('PowerappService > processPowerappDocument', async () => {
//   let url: string | undefined
//   const fileId = 'ChmRxQBR97Nkse-mZ9LsG'

//   beforeAll(async () => {
//     await createMongoDbConnection()
//   })

//   it('should retrieve url', async () => {
//     const res = await FileModel.findById(fileId)
//     url = `https://stdevspokedbc01.blob.core.windows.net/public/${res?.contractDocumentBlobName}`

//     expect(res).toBeDefined()
//     expect(url).toBeDefined()
//     expect(url).toContain(
//       'https://stdevspokedbc01.blob.core.windows.net/public/',
//     )
//   })
// })

describe.skip('PowerappService > Invalid Contract Document', async () => {
  let powerapp: PowerappWorkflowService
  beforeAll(() => {
    powerapp = new PowerappWorkflowService({})
  })

  it(
    'should retrieve the extracted invalid data from a Powerapp document',
    async () => {
      const url =
        'https://stdevspokedbc01.blob.core.windows.net/public/TestDocument50.pdf'
      const response = await powerapp.sendDocumentToExtract(powerAutomateUrl, {
        url,
      })
      expect(response).toBeDefined()
      expect(response.responsev2).toHaveProperty('operationStatus', 'Success')
      expect(response.responsev2.predictionOutput).toHaveProperty(
        'layoutName',
        'QLD-REIQ-House_and_Land',
      )
      expect(
        response.responsev2.predictionOutput.layoutConfidenceScore,
      ).toBeLessThanOrEqual(0.0)
    },
    { timeout: 60000 },
  )

  it(
    'should upload a document to Azure Storage and retrieve the extracted data from a Powerapp document',
    async () => {
      const url =
        'https://stdevspokedbc01.blob.core.windows.net/public/64076-221213-QLD-Signed Contract-64076.pdf'

      const response = await powerapp.sendDocumentToExtract(powerAutomateUrl, {
        url,
      })

      expect(response).toBeDefined()
      expect(response.responsev2).toHaveProperty('operationStatus', 'Success')
    },
    { timeout: 60000 },
  )
})
