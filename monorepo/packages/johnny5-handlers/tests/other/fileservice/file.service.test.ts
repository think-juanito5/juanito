import { beforeAll, describe, expect, it } from 'bun:test'
import { Readable } from 'stream'
import { ContainerClientFactory, FileService } from '@dbc-tech/azure-storage'

type TestBasicResponse = {
  responsev2: {
    operationStatus: string
    predictionOutput: {
      layoutName: string
      labels: {
        buyers_email: {
          value: string
        }
      }
    }
  }
}

describe('uploadDocumentoAzureStorage > generateDocumentSasTokenUrl', async () => {
  let response: TestBasicResponse
  let fileservice: FileService
  const blobName = 'extracted-qld-data.json'

  beforeAll(() => {
    fileservice = new FileService(
      new ContainerClientFactory(
        process.env.CCA_AZURE_STORAGE_CONNECTION!,
        'files',
      ),
    )
    response = {
      responsev2: {
        operationStatus: 'Success',
        predictionOutput: {
          layoutName: 'Test-Layout',
          labels: {
            buyers_email: {
              value: 'hello2@gmail.com',
            },
          },
        },
      },
    }
  })

  it(
    'should upload the extracted data from a Test response document to Azure',
    async () => {
      const resultData = JSON.stringify(response)
      const resultStream = Readable.from(resultData)

      const uploadResult = await fileservice.upload(blobName, resultStream)
      expect(uploadResult).toBeDefined()
      expect(uploadResult.val).toHaveProperty('errorCode', undefined)
    },
    { timeout: 60000 },
  )

  it('should generate retrieve the extracted data from a Test response document', async () => {
    const response2 = await fileservice.generateSasTokenUrl(blobName, 60)
    const urlPattern =
      /^https:\/\/[\w-]+\.blob\.core\.windows\.net\/files\/[\w-]+\.json\?sv=.*$/
    expect(response2).toBeDefined()
    expect(response2).toMatch(urlPattern)
  })
})
