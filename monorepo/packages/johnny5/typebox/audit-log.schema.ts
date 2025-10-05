import { type Static, t } from 'elysia'
import { logLevelSchema, tenantSchema } from './common.schema'

export type AuditLog = Static<typeof auditLogSchema>
export const auditLogSchema = t.Object({
  // The unique identifier for the File
  id: t.String(),
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: tenantSchema,
  // The Document Id of the File
  fileId: t.Optional(t.String()),
  // The Document Id of the Job
  jobId: t.Optional(t.String()),
  // The Document Id of the Task
  taskId: t.Optional(t.String()),
  // A note which can be passed to ActionStep
  logLevel: logLevelSchema,
  // The key/values of the items that were corrected
  message: t.String(),
  // The name of the person who created the correction data
  tags: t.Optional(t.Array(t.String())),
  // The date the correction data was created
  createdOn: t.Date(),
})
