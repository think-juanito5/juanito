import type { File } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbFile } from '../schema'

export const mapFile = (
  job: FlattenMaps<DbFile> & { _id: Types.ObjectId },
): File => {
  const { _id, ...rest } = job
  return {
    ...rest,
    id: _id.toString(),
  }
}
