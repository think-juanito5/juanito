import { BlobServiceClient } from '@azure/storage-blob'

export class ContainerClientFactory {
  readonly blobServiceClient: BlobServiceClient

  constructor(
    connection: string,
    private readonly containerName: string,
  ) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connection)
  }

  async create() {
    const client = this.blobServiceClient.getContainerClient(this.containerName)
    await client.createIfNotExists()
    return client
  }
}
