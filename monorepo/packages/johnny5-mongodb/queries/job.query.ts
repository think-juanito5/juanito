import type { JobStatusCloudEvent } from '@dbc-tech/johnny5'
import { component, createJohnny5CloudEvent, publish } from '@dbc-tech/johnny5'
import { type DbJob, JobModel } from '@dbc-tech/johnny5-mongodb'
import type { Logger } from '@dbc-tech/logger'
import { Err, Ok, Result } from 'ts-results-es'

export type JobQuery = typeof JobQuery
export const JobQuery = {
  /**
   * Creates a Job document in the database and publishes an event with the changes.
   *
   * @param id - The ID of the Job to update.
   * @param payload - The partial Job object containing the fields to create.
   * @returns A promise that resolves to a Result object containing the created Job, or an error if the Job could not be created.
   */
  createAndPublishChangedEvent: async (
    payload: Partial<DbJob>,
    source: string,
    correlationId: string,
    logger: Logger,
  ): Promise<Result<string, string>> => {
    if (!payload.fileId)
      return Err(`File Id is unspecified in payload ${payload}`)
    const createdJob = await JobModel.create(payload)
    if (!createdJob) return Err(`Job was not created with payload ${payload}`)

    const cloudEvent = createJohnny5CloudEvent({
      id: correlationId,
      source,
      type: 'v1.job-status-updated',
    })
    const message: JobStatusCloudEvent = {
      ...cloudEvent,
      data: {
        tenant: createdJob.tenant,
        fileId: payload.fileId.toString(),
        jobId: createdJob.id,
        status: createdJob.status,
      },
    }

    await publish<JobStatusCloudEvent>({
      pubsub: component.topics,
      topicOrQueue: 'johnny5-events',
      message,
      logger,
      correlationId,
    })

    return Ok(createdJob.id)
  },
  /**
   * Updates a Job document in the database and publishes an event if the changes contains a status change.
   *
   * @param id - The ID of the Job to update.
   * @param payload - The partial Job object containing the fields to update.
   * @param source - The source of the event emitted in the Cloud Event message.
   * @param correlationId - The correlation ID of the event emitted in the Cloud Event message.
   * @returns A promise that resolves to a Result object containing true, or an error if the Job is not found.
   */
  updateAndPublishChangedEvent: async (
    id: string,
    payload: Partial<DbJob>,
    source: string,
    correlationId: string,
    logger: Logger,
  ): Promise<Result<true, string>> => {
    const originalJob = await JobModel.findByIdAndUpdate(id, payload)
    if (!originalJob) return Err(`Job with id ${id} not found`)

    if (payload.status) {
      const cloudEvent = createJohnny5CloudEvent({
        id: correlationId,
        source,
        type: 'v1.job-status-updated',
      })
      const message: JobStatusCloudEvent = {
        ...cloudEvent,
        data: {
          tenant: originalJob.tenant,
          fileId: originalJob.fileId.toString(),
          jobId: id,
          status: payload.status,
        },
      }

      await publish<JobStatusCloudEvent>({
        pubsub: component.topics,
        topicOrQueue: 'johnny5-events',
        message,
        logger,
        correlationId,
      })
    }

    return Ok(true)
  },
}
