import type { CacheService } from '@dbc-tech/azure-storage'
import { AzureStorageCacheService } from '@dbc-tech/azure-storage'
import { ContainerClientFactory } from '@dbc-tech/azure-storage'
import {
  type MatterReadinessState,
  MatterReadinessStateSchema,
} from '@dbc-tech/johnny5'
import { type Result } from 'ts-results-es'

const storageConnection = process.env.CCA_AZURE_STORAGE_CONNECTION!
const DefaultContainerName = 'documents'
const DefaultStatusPrefix = 'johnny5/matter-status/action'

export class MatterStatusService {
  private readonly azService: CacheService

  constructor(factory?: ContainerClientFactory) {
    const actualFactory =
      factory ??
      new ContainerClientFactory(storageConnection, DefaultContainerName)

    this.azService = new AzureStorageCacheService(actualFactory)
  }

  private getPrefixedKey(matterId: number): string {
    return `${DefaultStatusPrefix}-${matterId}`
  }

  public async updateReadinessStatus(
    matterId: number,
    statusData: MatterReadinessState,
  ): Promise<Result<boolean, string>> {
    const fullKey = this.getPrefixedKey(matterId)
    return this.azService.set(fullKey, statusData)
  }

  public async getDataValue(
    matterId: number,
  ): Promise<MatterReadinessState | undefined> {
    try {
      const fullKey = this.getPrefixedKey(matterId)
      const result = await this.azService.getValue(
        fullKey,
        MatterReadinessStateSchema,
      )

      if (!result) {
        throw new Error(
          `Matter readiness state data not found for matter ${matterId}`,
        )
      }

      return result
    } catch (_) {
      return undefined
    }
  }
}
