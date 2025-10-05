import { type Static, t } from 'elysia'
import { tenantSchema } from './common.schema'

export const emailData = t.Object({
  email: t.String(),
  name: t.String(),
})

export type EmailLog = Static<typeof emailLogSchema>
export const emailLogSchema = t.Object({
  // The unique identifier for the record
  id: t.String(),
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: tenantSchema,
  // The Document Id of the File
  fileId: t.String(),
  // The Document Id of the Job
  jobId: t.Optional(t.String()),
  // The Document Id of the Task
  taskId: t.Optional(t.String()),
  recipients: t.Array(emailData),
  subject: t.String(),
  message: t.String(),
  sender: emailData,
  email_id: t.String(),
  email_status: t.String(),
  createdOn: t.Date(),
})
