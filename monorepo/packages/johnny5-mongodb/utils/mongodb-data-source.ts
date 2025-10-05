import {
  type DataItem,
  type DataItemType,
  type ServiceType,
  type Tenant,
  getIntent,
} from '@dbc-tech/johnny5'
import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import type { Logger } from '@dbc-tech/logger'
import { RefdataContractDataQuery } from '../queries'
import { ContractDataModel, ContractDataValidationModel } from '../schema'

export class MongoDbContractDataSource implements DataSource {
  private items: DataItem[] = []

  constructor(
    private readonly tenant: Tenant,
    private readonly jobId: string,
    private readonly serviceType: ServiceType | undefined,
    private readonly logger: Logger,
  ) {}

  async get(name: string): Promise<DataItem> {
    if (this.items.length === 0) {
      const contractData = await ContractDataModel.findOne({
        jobId: this.jobId,
        tenant: this.tenant,
      }).lean()
      if (!contractData)
        throw new Error(`Contract Data not found for Job Id:${this.jobId}`)

      if (!this.serviceType)
        throw new Error(
          `Unable to fetch correct RefData as Service Type not found for Job Id:${this.jobId}`,
        )

      const intent = getIntent(this.serviceType)
      const refData = await RefdataContractDataQuery.getRefdataContractData(
        this.tenant,
        [intent],
      )

      this.items = refData.map((item) => ({
        name: item.name,
        type: item.data_type as DataItemType,
        required: item.required_for_matter_creation,
        value: (() => {
          const dataItem = contractData.contractDataItems?.find(
            (i) => i.fieldName === item.name,
          )
          if (dataItem?.value && dataItem.value !== 'undefined') {
            return dataItem.value
          }
          return dataItem?.text
        })(),
        rawText: (() => {
          const dataItem = contractData.contractDataItems?.find(
            (i) => i.fieldName === item.name,
          )
          return dataItem?.text
        })(),
      }))
    }

    const item = this.items.find((item) => item.name === name)
    if (!item) throw new Error(`Data item not found for name:${name}`)

    return item
  }
}

export class MongoDbCorrectionDataSource implements DataSource {
  private items: DataItem[] = []

  constructor(
    private readonly tenant: Tenant,
    private readonly jobId: string,
    private readonly serviceType: ServiceType | undefined,
    private readonly logger: Logger,
  ) {}

  async get(name: string): Promise<DataItem> {
    if (this.items.length === 0) {
      const correctionData = await ContractDataValidationModel.findOne({
        jobId: this.jobId,
        tenant: this.tenant,
      }).lean()
      if (!correctionData)
        throw new Error(`Validation Data not found for Job Id:${this.jobId}`)

      if (!this.serviceType)
        throw new Error(
          `Unable to fetch correct RefData as Service Type not found for Job Id:${this.jobId}`,
        )

      const intent = getIntent(this.serviceType)
      const refData = await RefdataContractDataQuery.getRefdataContractData(
        this.tenant,
        [intent],
      )

      this.items = refData.map((item) => ({
        name: item.name,
        type: item.data_type as DataItemType,
        required: item.required_for_matter_creation,
        value: correctionData.correctionDataItems?.find(
          (i) => i.fieldName === item.name,
        )?.value,
      }))
    }

    const item = this.items.find((item) => item.name === name)
    if (!item) throw new Error(`Data item not found for name:${name}`)

    return item
  }
}
