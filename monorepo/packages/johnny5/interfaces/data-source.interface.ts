import type { DataItem } from '../typebox'

export interface DataSource {
  get(name: string): Promise<DataItem>
}
