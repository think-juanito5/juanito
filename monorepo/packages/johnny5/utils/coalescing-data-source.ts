import type { DataSource } from '../interfaces'
import type { DataItem } from '../typebox'

export class CoalescingDataSource implements DataSource {
  constructor(
    private readonly originalDataSource: DataSource,
    private readonly overrideDataSource: DataSource,
  ) {}

  async get(name: string): Promise<DataItem> {
    const originalItem = await this.originalDataSource.get(name)
    const overrideItem = await this.overrideDataSource.get(name)
    return overrideItem.value || overrideItem.value === ''
      ? overrideItem
      : originalItem
  }
}
