import type { CacheService } from '@dbc-tech/azure-storage'
import { AzureStorageCacheService } from '@dbc-tech/azure-storage'
import { ContainerClientFactory } from '@dbc-tech/azure-storage'
import {
  type SymlinkBlob,
  SymlinkBlobSchema,
  type TPLinkParams,
  TPLinkParamsSchema,
} from '@dbc-tech/johnny5'
import type { Logger } from '@dbc-tech/logger'
import { Err, Ok, type Result } from 'ts-results-es'

const storageConnection = process.env.CCA_AZURE_STORAGE_CONNECTION!
const DefaultContainerName = 'documents'
const DefaultTPLinkPrefix = 'johnny5/trustpilot-link/client'
const DefaultMatterTPLinkPrefix = 'johnny5/trustpilot-link/matters'

export class TrustPilotLinkManager {
  private readonly tpLinkService: CacheService

  constructor(
    private readonly logger: Logger,
    factory?: ContainerClientFactory,
  ) {
    const actualFactory =
      factory ??
      new ContainerClientFactory(storageConnection, DefaultContainerName)

    this.tpLinkService = new AzureStorageCacheService(actualFactory)
  }

  private getPrefixedKey(
    clientParticipantId: number,
    matterId: number,
  ): string {
    return `${DefaultTPLinkPrefix}-${clientParticipantId}/matter:${matterId}`
  }

  private getClientPrefix(clientParticipantId: number): string {
    return `${DefaultTPLinkPrefix}-${clientParticipantId}`
  }

  public async storeLink(
    clientParticipantId: number,
    matterId: number,
    tpData: TPLinkParams,
  ): Promise<Result<boolean, string>> {
    const fullKey = this.getPrefixedKey(clientParticipantId, matterId)
    return this.tpLinkService.set(fullKey, tpData)
  }

  public async getLinks(
    clientParticipantId: string,
  ): Promise<Result<string[], string>> {
    const fullKey = this.getClientPrefix(+clientParticipantId)
    return this.tpLinkService.listKeys(fullKey)
  }

  public async hasLink(
    clientParticipantId: string,
  ): Promise<Result<boolean, string>> {
    const result = await this.getLinks(clientParticipantId)
    if (result.err) {
      return result
    }
    return Ok(result.val.length > 0)
  }

  public async getDataValue(
    matterId: string,
    clientParticipantId?: string,
  ): Promise<TPLinkParams | undefined> {
    let targetKey: string

    try {
      if (clientParticipantId) {
        targetKey = this.getPrefixedKey(+clientParticipantId, +matterId)
      } else {
        const resolvedKeyResult = await this.resolveMatterSymlink(+matterId)
        if (resolvedKeyResult.err) {
          throw new Error(resolvedKeyResult.val)
        }
        targetKey = resolvedKeyResult.val
      }

      const result = await this.tpLinkService.getValue(
        targetKey,
        TPLinkParamsSchema,
      )
      if (!result) {
        throw new Error(`TrustPilot link data not found for matter ${matterId}`)
      }
      return result
    } catch (err: unknown) {
      await this.logger.warn(
        `Error retrieving TrustPilot link data for matter ${matterId}: ${err}`,
      )
      return undefined
    }
  }

  private getMatterKeySymlink(matterId: number): string {
    return `${DefaultMatterTPLinkPrefix}/${matterId}.symlink`
  }

  public async createSymlinkForMatter(
    matterId: number,
    clientParticipantId: string,
  ): Promise<Result<boolean, string>> {
    const targetKey = this.getPrefixedKey(+clientParticipantId, matterId)
    const symlinkKey = this.getMatterKeySymlink(matterId)
    const symlink: SymlinkBlob = {
      type: 'symlink',
      target: targetKey,
      createdAt: new Date().toISOString(),
    }
    return this.tpLinkService.set(symlinkKey, symlink)
  }

  public async resolveMatterSymlink(
    matterId: number,
  ): Promise<Result<string, string>> {
    const symlinkKey = this.getMatterKeySymlink(matterId)
    const raw = await this.tpLinkService.getValue(symlinkKey, SymlinkBlobSchema)

    if (!raw || raw.type !== 'symlink') {
      return Err(
        `Could not resolve symlink for matter ${matterId}. Symlink not found or invalid.`,
      )
    }
    return Ok(raw.target)
  }
}
