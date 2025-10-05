import { type Static, t } from 'elysia'
import { cloudEventSchema } from './cloud-event.schema'
import { tenantSchema } from './common.schema'

export type EmailRecipient = Static<typeof emailRecipientSchema>
export const emailRecipientSchema = t.Object({
  email: t.String(),
  name: t.String(),
})

export type JobEmailMessage = Static<typeof jobEmailMessageSchema>
export const jobEmailMessageSchema = t.Object({
  fileId: t.String(),
  jobId: t.String(),
  tenant: tenantSchema,
  recipients: t.Array(emailRecipientSchema),
  subject: t.String(),
  message: t.String(),
})

export type JobEmailCloudEvent = Static<typeof jobEmailCloudEventSchema>
export const jobEmailCloudEventSchema = t.Composite([
  cloudEventSchema,
  t.Object({
    data: jobEmailMessageSchema,
  }),
])

export type TaskEmailMessage = Static<typeof taskEmailMessageSchema>
export const taskEmailMessageSchema = t.Object({
  fileId: t.String(),
  taskId: t.String(),
  tenant: tenantSchema,
  recipients: t.Array(emailRecipientSchema),
  subject: t.String(),
  message: t.String(),
})

export type TaskEmailCloudEvent = Static<typeof taskEmailCloudEventSchema>
export const taskEmailCloudEventSchema = t.Composite([
  cloudEventSchema,
  t.Object({
    data: taskEmailMessageSchema,
  }),
])
