import type { ContractData } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbContractData } from '../schema'

export const mapContractData = (
  contractData: FlattenMaps<DbContractData> & { _id: Types.ObjectId },
): ContractData => {
  const { _id, ...rest } = contractData
  return {
    ...rest,
    fileId: contractData.fileId.toString(),
    jobId: contractData.jobId.toString(),
    id: contractData._id.toString(),
  }
}
