import type { Job } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbJob } from '../schema'

export const mapJob = (
  job: FlattenMaps<DbJob> & { _id: Types.ObjectId },
): Job => {
  const { _id, ...rest } = job
  return {
    ...rest,
    fileId: job.fileId.toString(),
    id: _id.toString(),
  }
}
