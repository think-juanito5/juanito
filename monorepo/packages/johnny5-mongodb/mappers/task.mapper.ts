import type { Task } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbTask } from '../schema'

export const mapTask = (
  task: FlattenMaps<DbTask> & { _id: Types.ObjectId },
): Task => {
  const { _id, ...rest } = task
  return {
    ...rest,
    fileId: task.fileId.toString(),
    id: _id.toString(),
  }
}
