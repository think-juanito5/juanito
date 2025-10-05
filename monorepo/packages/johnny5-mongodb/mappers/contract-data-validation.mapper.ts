import type { ContractDataValidation } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbContractDataValidation } from '../schema'

export const mapContractDataValidation = (
  contractDataValidation: FlattenMaps<DbContractDataValidation> & {
    _id: Types.ObjectId
  },
): ContractDataValidation => {
  const { _id, ...rest } = contractDataValidation
  return {
    ...rest,
    fileId: contractDataValidation.fileId.toString(),
    jobId: contractDataValidation.jobId.toString(),
    id: contractDataValidation._id.toString(),
  }
}
