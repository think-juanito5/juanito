import { describe, expect, it } from 'bun:test'
import { Readable } from 'stream'
import { TypeformService } from '../../../src/typeform/typeform.service'
import {
  checkFileExists,
  checkFileSize,
  removeFile,
  saveStreamToFile,
} from '../../../src/utils/data-utils'

describe('TypeformService', () => {
  const formId = 'v06U7Jc0'
  const testFilePath = `test-${formId}.zip`

  it('should throw Authentication Error on TypeformService', () => {
    const typeformService = new TypeformService({
      apiKey: 'your-api-key',
      baseUrl: process.env['CCA_TYPEFORM_API_URL']!,
    })

    const authenticationError = {
      code: 'AUTHENTICATION_FAILED',
      description: 'Authentication failed',
    }

    const res = typeformService.downloadFile('formId')
    expect(res).rejects.toThrowError(JSON.stringify(authenticationError))
  })

  it('should download the data in stream', async () => {
    const typeformService = new TypeformService({
      apiKey: process.env['CCA_TYPEFORM_API_KEY']!,
      baseUrl: process.env['CCA_TYPEFORM_API_URL']!,
    })

    const formId = 'BcNftPqn'
    const fileStream = await typeformService.downloadFile(formId)

    expect(fileStream).toBeInstanceOf(Readable)
  })

  it('should save to file from the stream data', async () => {
    const typeformService = new TypeformService({
      apiKey: process.env['CCA_TYPEFORM_API_KEY']!,
      baseUrl: process.env['CCA_TYPEFORM_API_URL']!,
    })
    const fileStream = await typeformService.downloadFile(formId)
    await saveStreamToFile(fileStream, testFilePath)
    const exists = await checkFileExists(testFilePath)
    expect(exists).toBe(true)
  })

  it('should be more than 10MB in size - downloaded file', async () => {
    const size = await checkFileSize(testFilePath)
    console.log(`File info: ${testFilePath} size: ${size}`)
    expect(size).toBeGreaterThan(10000000)
    await removeFile(testFilePath)
  })
})
