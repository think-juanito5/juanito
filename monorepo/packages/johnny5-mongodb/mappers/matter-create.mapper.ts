import type { MatterCreate } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbMatterCreate } from '../schema'

export const mapMatterCreate = (
  matterCreate: FlattenMaps<DbMatterCreate> & { _id: Types.ObjectId },
): MatterCreate => {
  const { _id, ...rest } = matterCreate
  return {
    ...rest,
    fileId: matterCreate.fileId.toString(),
    jobId: matterCreate.jobId.toString(),
    id: matterCreate._id.toString(),
  }
}
