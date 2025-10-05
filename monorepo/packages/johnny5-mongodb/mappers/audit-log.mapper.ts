import type { AuditLog } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbAuditLog } from '../schema'

export const mapAuditLog = (
  log: FlattenMaps<DbAuditLog> & { _id: Types.ObjectId },
): AuditLog => {
  const { _id, ...rest } = log
  return {
    ...rest,
    fileId: log.fileId?.toString(),
    jobId: log.jobId?.toString(),
    taskId: log.taskId?.toString(),
    id: log._id.toString(),
  }
}
