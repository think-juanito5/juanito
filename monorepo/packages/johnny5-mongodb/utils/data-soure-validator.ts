import { type DataItem, getIntent, validateDataSource } from '@dbc-tech/johnny5'
import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import type { Logger } from '@dbc-tech/logger'
import { type Result } from 'ts-results-es'
import { RefdataContractDataQuery } from '../queries'
import { JobModel } from '../schema'

export class DataSourceValidator {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async validate(jobId: string): Promise<Result<boolean, DataItem[]>> {
    const job = await JobModel.findById(jobId)
    if (!job) throw new Error(`Job not found for job Id:${jobId}`)

    if (!job.serviceType)
      throw new Error(
        `Unable to fetch correct RefData as Service Type not found for file Id:${jobId}`,
      )

    const intent = getIntent(job.serviceType)
    const refData = await RefdataContractDataQuery.getRefdataContractData(
      job.tenant,
      [intent],
    )

    return validateDataSource(refData, this.dataSource)
  }
}
