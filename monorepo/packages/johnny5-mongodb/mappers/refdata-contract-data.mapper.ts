import type { RefdataContractData } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbRefdataContractData } from '../schema'

export const mapRefdataContractData = (
  refdata: FlattenMaps<DbRefdataContractData> & { _id: Types.ObjectId },
): RefdataContractData => {
  const { _id, ...rest } = refdata
  return {
    ...rest,
    id: refdata._id.toString(),
  }
}
