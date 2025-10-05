import type { EmailLog } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbEmailLog } from '../schema'

export const mapEmailLog = (
  log: FlattenMaps<DbEmailLog> & { _id: Types.ObjectId },
): EmailLog => {
  const { _id, ...rest } = log
  return {
    ...rest,
    fileId: log.fileId?.toString(),
    jobId: log.jobId?.toString(),
    taskId: log.taskId?.toString(),
    id: log._id.toString(),
  }
}
