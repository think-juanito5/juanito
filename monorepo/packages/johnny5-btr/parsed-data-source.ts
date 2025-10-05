import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import type { DataItem } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { filterDataItem, parseDataItem } from './data-item-parser'

export class ParsedDataSource implements DataSource {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  get = async (name: string): Promise<DataItem> => {
    return this.dataSource.get(name).then(this.filter).then(this.parse)
  }

  private filter = async (item: DataItem): Promise<DataItem> => {
    return filterDataItem(item, this.logger)
  }

  private parse = async (item: DataItem): Promise<DataItem> => {
    return parseDataItem(item, this, this.logger)
  }
}
