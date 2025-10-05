import { type DbFile, type DbJob } from '@dbc-tech/johnny5-mongodb'
import {
  component,
  createJohnny5CloudEvent,
  publish,
} from '@dbc-tech/johnny5/dapr'
import type {
  JobEmailCloudEvent,
  JobEmailMessage,
  JobStatus,
  JobStatusCloudEvent,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import type { HydratedDocument } from 'mongoose'
import { buildBatchMatterCloseMessage } from './batch-matter-close'
import { buildRaqDealMessage } from './cca-raq-deal'
import { buildContractDropMessage } from './contract-drop'
import { buildMatterOpeningMessage } from './matter-opening'

export const emailNotifications = async (
  event: JobStatusCloudEvent,
  job: HydratedDocument<DbJob>,
  file: HydratedDocument<DbFile>,
  logger: Logger,
  source: string,
  correlationId: string,
) => {
  const { data } = event
  const { fileId, jobId, tenant, status } = data
  const { emailSubscribers } = job

  if (!emailSubscribers || emailSubscribers.length === 0) {
    await logger.warn(
      `No email subscribers found for File Id:${fileId}, Job Id:${jobId}`,
    )
    return
  }

  const { subject, message } = await buildEmailMessage(job, file, status)

  for (const subscriber of emailSubscribers) {
    if (!subscriber.events.includes(status)) {
      continue
    }
    const messageSendEmail: JobEmailMessage = {
      tenant,
      fileId,
      jobId,
      recipients: [
        {
          email: subscriber.email,
          name: subscriber.name,
        },
      ],
      subject,
      message,
    }

    const cloudEvent = createJohnny5CloudEvent({
      id: correlationId,
      source,
      type: 'v1.send-email',
    })
    const emailCloudEvent: JobEmailCloudEvent = {
      ...cloudEvent,
      data: messageSendEmail,
    }

    await logger.debug(`Publishing message`, emailCloudEvent)

    await publish<JobEmailCloudEvent>({
      pubsub: component.longQueues,
      topicOrQueue: 'johnny5',
      message: emailCloudEvent,
      logger,
      correlationId,
    })
  }
}

export const buildEmailMessage = async (
  job: HydratedDocument<DbJob>,
  file: HydratedDocument<DbFile>,
  status: JobStatus,
): Promise<{ subject: string; message: string }> => {
  switch (job.type) {
    case 'matter-opening':
      return buildMatterOpeningMessage(job, file, status)
    case 'contract-drop':
      return buildContractDropMessage(job, file, status)
    case 'batch-matter-close':
      return buildBatchMatterCloseMessage(job, status)
    case 'raq-deal':
      return buildRaqDealMessage(job, file, status)
    default:
      return buildDefaultMessage(job, file, status)
  }
}

export const buildDefaultMessage = async (
  job: HydratedDocument<DbJob>,
  file: HydratedDocument<DbFile>,
  status: JobStatus,
): Promise<{ subject: string; message: string }> => {
  const {
    completedOn,
    createdOn,
    errorReason,
    fileId,
    id,
    serviceType,
    tenant,
    type,
  } = job
  const { actionStepMatterId, pipedriveDealId } = file

  const subject = `[Johnny5] ${type} Job Updated`
  let messageHeader = `Status updated: ${status}`
  switch (job.status) {
    case 'error-processing':
      messageHeader = `Error Processing Job`
      break
  }

  let message = `${messageHeader}

Job: ${id}
Type: ${type}
Status: ${status}
File: ${fileId}
Service Type: ${serviceType}
Tenant: ${tenant}
Created On: ${createdOn}
`

  if (completedOn) message += `Completed On: ${completedOn}\n`
  if (actionStepMatterId) message += `Matter: ${actionStepMatterId}\n`
  if (pipedriveDealId) message += `Pipedrive Deal: ${pipedriveDealId}\n`
  if (errorReason) message += `Error Reason: ${errorReason}\n`
  if (process.env.APP_ENV !== 'prod')
    message += `\nEnvironment: ${process.env.APP_ENV}`

  return { subject, message }
}
