import { Readable } from 'stream'
import { DefaultAzureCredential } from '@azure/identity'
import { DataLakeServiceClient } from '@azure/storage-file-datalake'
import { type Logger, NullLogger } from '@dbc-tech/logger'

export type OnelakeServiceConfig = {
  accountUrl: string
  workSpaceName: string
  lakeHousePath: string
  correlationId?: string
  logger?: Logger
}

export class OnelakeService {
  private logger: Logger
  private accountUrl: string
  private workSpaceName: string
  private lakeHousePath: string

  constructor(config: OnelakeServiceConfig) {
    this.logger = config.logger ?? NullLogger()
    this.accountUrl = config.accountUrl
    this.workSpaceName = config.workSpaceName
    this.lakeHousePath = config.lakeHousePath
  }

  async uploadFile(
    filePath: string,
    fileName: string,
    content: Readable | string,
  ) {
    if (!this.accountUrl || !this.workSpaceName || !this.lakeHousePath) {
      this.logger.error(
        'OneLake configuration environment variables are not set.',
      )
      return {}
    }

    const buildUrl = (baseUrl: string, path: string) => {
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1)
      }

      if (!path.startsWith('/')) {
        path = `/${path}`
      }

      return `${baseUrl}${path}`
    }

    try {
      const tokenCredential = new DefaultAzureCredential()
      const serviceClient = new DataLakeServiceClient(
        this.accountUrl,
        tokenCredential,
      )

      const fileSystemClient = serviceClient.getFileSystemClient(
        this.workSpaceName,
      )
      const dirPath = buildUrl(this.lakeHousePath, filePath)
      await this.logger.debug(
        `Creating directory if it does not exist: ${dirPath}`,
      )
      const directoryClient = fileSystemClient.getDirectoryClient(dirPath)
      await directoryClient.createIfNotExists()

      const fileClient = directoryClient.getFileClient(fileName)
      if (typeof content === 'string') {
        const readable_content = Readable.from([content])
        await fileClient.uploadStream(readable_content)
      } else {
        await fileClient.uploadStream(content)
      }
    } catch (error) {
      await this.logger.error(
        `Error uploading file: ${error}`,
        `${filePath}${fileName}`,
      )
      throw error
    }
    await this.logger.info(
      `File successfully received and stored in OneLake\n${filePath}${fileName}`,
    )
  }
}
