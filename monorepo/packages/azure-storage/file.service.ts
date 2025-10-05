import { Readable } from 'stream'
import { BlobSASPermissions } from '@azure/storage-blob'
import type {
  BlobDownloadResponseParsed,
  BlobUploadCommonResponse,
} from '@azure/storage-blob'
import { Ok } from 'ts-results-es'
import type { ContainerClientFactory } from './container-client-factory'

export const DefaultSasTokenDuration = 259200 // 3 days

/**
 * Service for handling files.
 */
export class FileService {
  constructor(private factory: ContainerClientFactory) {}

  /**
   * Uploads a file to the specified blob container.
   *
   * @param blobName - The name of the blob.
   * @param stream - The readable stream containing the file data.
   * @returns A promise that resolves to an `Ok` object containing the response from the upload operation.
   */
  async upload(
    blobName: string,
    stream: Readable,
  ): Promise<Ok<BlobUploadCommonResponse>> {
    const containerClient = await this.factory.create()
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    const response = await blockBlobClient.uploadStream(stream)
    return Ok(response)
  }

  async uploadStream(
    blobName: string,
    stream: Readable,
  ): Promise<Ok<BlobUploadCommonResponse>> {
    const containerClient = await this.factory.create()
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    const streamArrBuffer = await this.readableStreamToArrayBuffer(stream)

    const arrBuffer = Buffer.from(streamArrBuffer)
    const sRead = Readable.from(arrBuffer)
    const response = await blockBlobClient.upload(sRead, arrBuffer.length)
    return Ok(response)
  }

  /**
   * Generates a SAS token URL for the specified blob.
   * @param blobName - The name of the blob.
   * @param duration - The duration of the SAS token in seconds. If not provided, a default duration will be used.
   * @returns A Promise that resolves to the SAS token URL.
   */
  async generateSasTokenUrl(
    blobName: string,
    duration?: number,
  ): Promise<string> {
    const containerClient = await this.factory.create()
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    const SasUrl = await blockBlobClient.generateSasUrl({
      expiresOn: new Date(
        new Date().valueOf() + (duration ?? DefaultSasTokenDuration) * 1000,
      ),
      permissions: BlobSASPermissions.parse('r'),
    })
    return SasUrl
  }

  /**
   * Downloads a file from the specified blob container.
   * @param blobName - The name of the blob.
   * @returns A promise that resolves to an `Ok` object containing the stream of the downloaded file.
   */
  async download(blobName: string): Promise<Readable | undefined> {
    try {
      const containerClient = await this.factory.create()
      const blockBlobClient = containerClient.getBlockBlobClient(blobName)

      const response = await blockBlobClient.download()
      if (response.errorCode || !response.readableStreamBody)
        throw Error(response.errorCode)
      return this.convertToReadableStream(response.readableStreamBody)
    } catch (error) {
      throw new Error(
        `Failed to download the file: ${(error as Error).message}`,
      )
    }
  }

  downloadAsFile = async (
    blobName: string,
    fileName: string,
  ): Promise<BlobDownloadResponseParsed> => {
    try {
      const containerClient = await this.factory.create()
      const blockBlobClient = containerClient.getBlockBlobClient(blobName)
      const res = await blockBlobClient.downloadToFile(fileName)
      if (res.errorCode) throw Error(res.errorCode)

      return res
    } catch (error) {
      throw new Error(
        `Failed to download the file: ${(error as Error).message}`,
      )
    }
  }

  convertToReadableStream = (stream: NodeJS.ReadableStream): Readable => {
    if (stream instanceof Readable) {
      return stream
    } else {
      const readableStream = new Readable().wrap(stream)
      return readableStream
    }
  }

  /**
   * Converts a readable stream into an ArrayBuffer.
   *
   * @param stream - The readable stream to convert.
   * @returns A promise that resolves to an ArrayBuffer containing the data from the stream.
   */
  private async readableStreamToArrayBuffer(
    stream: Readable,
  ): Promise<ArrayBuffer> {
    const chunks: Buffer[] = []

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const buffer = Buffer.concat(chunks)
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    )
  }
}
