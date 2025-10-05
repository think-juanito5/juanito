import type { CcaRaq } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbCcaRaq } from '../schema'

export const mapRaq = (
  raq: FlattenMaps<DbCcaRaq> & { _id: Types.ObjectId },
): CcaRaq => {
  const { _id, ...rest } = raq
  return {
    ...rest,
    fileId: raq.fileId.toString(),
    jobId: raq.jobId.toString(),
    id: raq._id.toString(),
    createdOn: raq.createdOn.toISOString(),
  }
}
