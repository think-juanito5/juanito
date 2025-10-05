import {
  type CorrectionDataItem,
  RefdataContractDataQuery,
} from '@dbc-tech/johnny5-mongodb'
import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import type { DataItem, DataItemType, Tenant } from '@dbc-tech/johnny5/typebox'
import { type Intent } from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'

export class CorrectionDataItemsDataSource implements DataSource {
  private items: DataItem[] = []

  constructor(
    private readonly tenant: Tenant,
    private readonly intent: Intent,
    private readonly correctionDataItems: CorrectionDataItem[],
    private readonly logger: Logger,
  ) {}

  async get(name: string): Promise<DataItem> {
    if (this.items.length === 0) {
      const refData = await RefdataContractDataQuery.getRefdataContractData(
        this.tenant,
        [this.intent],
      )

      this.items = refData.map((item) => ({
        name: item.name,
        type: item.data_type as DataItemType,
        required: item.required_for_matter_creation,
        value: this.correctionDataItems.find((i) => i.fieldName === item.name)
          ?.value,
      }))
    }

    const item = this.items.find((item) => item.name === name)
    if (!item) throw new Error(`Data item not found for name:${name}`)

    return item
  }
}
