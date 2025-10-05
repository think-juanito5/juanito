import { Readable } from 'stream'
import type { BlobUploadCommonResponse } from '@azure/storage-blob'
import { ContainerClientFactory, FileService } from '@dbc-tech/azure-storage'
import { Err, Ok, Result } from 'ts-results-es'

export const storageConnection = process.env.CCA_AZURE_STORAGE_CONNECTION!
export const DefaultContainerName = 'documents'
/**
 * Uploads a document to Azure Storage.
 *
 * @param blobName - The name of the blob in Azure Storage.
 * @param stream - The readable stream containing the document data.
 * @returns A promise that resolves to a Result object containing either the uploaded blob response or an error message.
 */
export async function uploadDocumentoAzureStorage(
  blobName: string,
  stream: Readable,
): Promise<Result<BlobUploadCommonResponse, string>> {
  try {
    const fileService = new FileService(factory)
    const response = await fileService.upload(blobName, stream)
    return Ok(response.val)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Err(`error details: ${errorMessage}`)
  }
}

/**
 * Generates a shared access signature (SAS) token URL for a document blob.
 * @param blobName - The name of the document blob.
 * @param duration - Optional. The duration of the SAS token in seconds.
 * @returns A Promise that resolves to a Result object containing the SAS token URL if successful,
 * or an error message if an error occurs.
 */
export const generateDocumentSasTokenUrl = async (
  blobName: string,
  duration?: number,
): Promise<Result<string, string>> => {
  try {
    const fileService = new FileService(factory)
    const url = await fileService.generateSasTokenUrl(blobName, duration)
    return Ok(url)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Err(`error details: ${errorMessage}`)
  }
}

const factory = new ContainerClientFactory(
  storageConnection,
  DefaultContainerName,
)
