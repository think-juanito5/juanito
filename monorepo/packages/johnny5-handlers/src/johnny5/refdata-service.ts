import type { Tenant } from '@dbc-tech/johnny5'
import {
  type RefdataContractData,
  RefdataContractDataModel,
} from '@dbc-tech/johnny5-mongodb'

export class RefdataContractDataService {
  constructor(readonly tenant: Tenant) {}

  async findOneBySubSection(
    location: string,
    sub_section: string,
    tags?: string[],
  ): Promise<RefdataContractData | undefined> {
    const q = RefdataContractDataModel.findOne({
      tenant: this.tenant,
      location,
      sub_section,
    })
    if (tags && tags.length > 0) {
      q.where('tags', {
        $all: tags,
      })
    }
    const config = await q.lean().exec()
    return config ?? undefined
  }

  async findAllByLocation(
    location: string,
    tags?: string[],
  ): Promise<RefdataContractData[]> {
    const q = RefdataContractDataModel.find({
      tenant: this.tenant,
      location,
    })
    if (tags && tags.length > 0) {
      q.where('tags', {
        $all: tags,
      })
    }

    const config = await q.lean().exec()
    return config
  }
}
