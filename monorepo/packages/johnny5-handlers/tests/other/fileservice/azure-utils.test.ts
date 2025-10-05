import { beforeAll, describe, expect, it } from 'bun:test'
import { createReadStream } from 'fs'
import path from 'path'
import { Readable } from 'stream'
import type { BlobUploadCommonResponse } from '@azure/storage-blob'
import {
  downloadDocumenFromAzureStorage,
  uploadStreamtoAzureStorage,
} from '../../../src/utils/azure-utils'

const getXSampleDoc = (fileRef: string) => {
  const sampleDocs = '../../../samples/contracts/samples/'
  const blobName = `pipedrive-deal-docs/${path.basename(fileRef)}`
  const filename = path.resolve(process.cwd(), `${sampleDocs}/${fileRef}`)
  return { blobName, filename }
}

describe('uploadStreamtoAzureStorage', async () => {
  const blobName = 'pipedrive-deal-docs/basic-data-001.json'
  let basicData = {}
  beforeAll(() => {
    basicData = { id: 123, name: 'John Woke', email: 'hello2@gmail.com' }
  })

  it(
    'should upload the basic-data-10001.json document to Azure storage',
    async () => {
      const resultData = JSON.stringify(basicData)
      const resultStream = Readable.from(resultData)
      const res = await uploadStreamtoAzureStorage(blobName, resultStream)
      expect(typeof res).toBe('object')
      expect(res).toHaveProperty('ok', true)
      expect(res).toHaveProperty('val')
      expect(res.val).toHaveProperty('_response')
      expect(res.val).toHaveProperty('errorCode', undefined)
      expect((res.val as BlobUploadCommonResponse)._response).toHaveProperty(
        'status',
        201,
      )
    },
    { timeout: 60000 },
  )

  it(
    'should upload Test_Document_1001.pdf file document to Azure storage',
    async () => {
      const { filename, blobName } = getXSampleDoc('Test_Document_001.pdf')
      const res = await uploadStreamtoAzureStorage(
        blobName,
        createReadStream(filename),
      )
      expect(typeof res).toBe('object')
      expect(res).toHaveProperty('ok', true)
      expect(res).toHaveProperty('val')
      expect(res.val).toHaveProperty('_response')
      expect(res.val).toHaveProperty('errorCode', undefined)
      expect((res.val as BlobUploadCommonResponse)._response).toHaveProperty(
        'status',
        201,
      )
    },
    { timeout: 60000 },
  )

  it(
    'should upload Test_Document_1002.pdf file document to Azure storage',
    async () => {
      const { filename, blobName } = getXSampleDoc('Test_Document_002.pdf')
      const res = await uploadStreamtoAzureStorage(
        blobName,
        createReadStream(filename),
      )
      expect(typeof res).toBe('object')
      expect(res).toHaveProperty('ok', true)
      expect(res).toHaveProperty('val')
      expect(res.val).toHaveProperty('_response')
      expect(res.val).toHaveProperty('errorCode', undefined)
      expect((res.val as BlobUploadCommonResponse)._response).toHaveProperty(
        'status',
        201,
      )
    },
    { timeout: 60000 },
  )

  it(
    `should upload 'Test_Document_002 - Copy.pdf' file document to Azure storage`,
    async () => {
      const { filename, blobName } = getXSampleDoc(
        'Test_Document_002 - Copy.pdf',
      )
      const res = await uploadStreamtoAzureStorage(
        blobName,
        createReadStream(filename),
      )
      expect(typeof res).toBe('object')
      expect(res).toHaveProperty('ok', true)
      expect(res).toHaveProperty('val')
      expect(res.val).toHaveProperty('_response')
      expect(res.val).toHaveProperty('errorCode', undefined)
      expect((res.val as BlobUploadCommonResponse)._response).toHaveProperty(
        'status',
        201,
      )
    },
    { timeout: 60000 },
  )

  it(
    'should upload 67257-230809-QLD-Signed Contract-67257.pdf file document to Azure storage',
    async () => {
      const { filename, blobName } = getXSampleDoc(
        '67257-230809-QLD-Signed Contract-67257.pdf',
      )
      const res = await uploadStreamtoAzureStorage(
        blobName,
        createReadStream(filename),
      )
      expect(typeof res).toBe('object')
      expect(res).toHaveProperty('ok', true)
      expect(res).toHaveProperty('val')
      expect(res.val).toHaveProperty('_response')
      expect(res.val).toHaveProperty('errorCode', undefined)
      expect((res.val as BlobUploadCommonResponse)._response).toHaveProperty(
        'status',
        201,
      )
    },
    { timeout: 60000 },
  )
})

describe('downloadDocumenFromAzureStorage', async () => {
  const blobName =
    'pipedrive-deal-docs/67257-230809-QLD-Signed Contract-67257.pdf'

  it(
    `should download the '${blobName}' document from the Azure storage`,
    async () => {
      const res = await downloadDocumenFromAzureStorage(blobName)
      expect(typeof res).toBe('object')
      expect(res).toHaveProperty('ok', true)
      expect(res).toHaveProperty('val')
      expect(res.val).toBeInstanceOf(Readable)
    },
    { timeout: 60000 },
  )
})
