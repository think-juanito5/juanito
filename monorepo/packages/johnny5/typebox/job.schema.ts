import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from 'elysia/type-system'
import { blobSchema } from './blob.schema'
import { tenantSchema } from './common.schema'
import { emailSubscriberSchema } from './email-subscriber.schema'
import { jobStatusSchema } from './job-status.schema'
import { jobTestModeSchema } from './job-test-mode.schema'
import { jobTypeSchema } from './job-type.schema'
import { matterIdSchema } from './matter.schema'
import { metaSchema } from './meta.schema'
import { serviceTypeSchema } from './service-type.schema'
import { teamsSubscriberSchema } from './teams-subscriber.schema'

export type Job = Static<typeof jobSchema>
export const jobSchema = Type.Object({
  // The unique identifier for the Job
  id: Type.String(),
  // Tenant Key: CCA, BTR, FCL etc.
  tenant: tenantSchema,
  // File Id
  fileId: Type.String(),
  // The type of service being offered or quoted
  serviceType: serviceTypeSchema,
  // The client provided unique identifier
  clientId: Type.Optional(Type.String()),
  // The type of Job
  type: jobTypeSchema,
  // The attached blobs (stored in Azure)
  blobs: Type.Optional(Type.Array(blobSchema)),
  // Additional metadata (key / value pairs)
  meta: Type.Optional(Type.Array(metaSchema)),
  // The matters to be processed
  matterIds: Type.Optional(Type.Array(matterIdSchema)),
  // Job status: created, extraction, hitl-waiting, hitl-in-progress, hitl-completed, hitl-rejected, matter-created, error-processing etc.
  status: jobStatusSchema,
  // The date the Job was created
  createdOn: Type.Date(),
  // The date the Job was completed
  completedOn: Type.Optional(Type.Date()),
  // The date the Job moved to error status
  erroredOn: Type.Optional(Type.Date()),
  // The reason for the error
  errorReason: Type.Optional(Type.String()),
  // The email subscribers for this job
  emailSubscribers: Type.Optional(Type.Array(emailSubscriberSchema)),
  // The teams subscribers for this job
  teamsSubscribers: Type.Optional(Type.Array(teamsSubscriberSchema)),
  // Test mode
  testMode: Type.Optional(jobTestModeSchema),
})

export const CJob = TypeCompiler.Compile(jobSchema)
