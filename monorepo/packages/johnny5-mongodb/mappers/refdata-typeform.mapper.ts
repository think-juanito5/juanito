import type { FlattenMaps, Types } from 'mongoose'
import type { DbRefdataTypeForm, RefdataTypeForm } from '../schema'

export const mapRefdataTypeform = (
  refdata: FlattenMaps<DbRefdataTypeForm> & { _id: Types.ObjectId },
): RefdataTypeForm => {
  const { _id, ...rest } = refdata
  return {
    ...rest,
  }
}
