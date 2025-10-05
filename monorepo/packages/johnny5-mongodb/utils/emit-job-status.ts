import {
  component,
  createJohnny5CloudEvent,
  publish,
} from '@dbc-tech/johnny5/dapr'
import type {
  JobStatus,
  JobStatusCloudEvent,
  Tenant,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { type DbJob, JobModel } from '../schema'

export const emitJobStatus = async (
  status: JobStatus,
  errorReason: string | undefined,
  logger: Logger,
  jobId: string,
  fileId: string,
  correlationId: string,
  name: string,
  tenant: Tenant,
) => {
  await logger.debug(`Updating Job ${jobId} status to ${status}`)

  const update: Partial<DbJob> = {
    status,
    erroredOn: errorReason ? new Date() : undefined,
    errorReason,
  }

  await logger.debug(`Updating Job ${jobId} status`, update)

  await JobModel.findByIdAndUpdate(jobId, update)

  const cloudEvent = createJohnny5CloudEvent({
    id: correlationId,
    source: name,
    type: 'v1.job-status-updated',
  })
  const message: JobStatusCloudEvent = {
    ...cloudEvent,
    data: {
      tenant,
      fileId,
      jobId,
      status,
    },
  }

  const pubsub = component.topics
  const topicName = 'johnny5-events'
  await logger.debug(`Publishing to topic:${topicName} at ${pubsub}`, message)

  await publish<JobStatusCloudEvent>({
    pubsub,
    topicOrQueue: topicName,
    message,
    logger,
    correlationId,
  })
}
