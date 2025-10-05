import { type DbFile, type DbJob } from '@dbc-tech/johnny5-mongodb'
import type { JobStatus } from '@dbc-tech/johnny5/typebox'
import type { HydratedDocument } from 'mongoose'

export const buildRaqDealMessage = async (
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
  const { pipedriveDealId } = file

  let subject = `[Johnny5] CCA RAQ Deal`
  let messageHeader = `Status updated: ${status}`
  switch (job.status) {
    case 'created':
      messageHeader = `We have received your RAQ Deal request`
      break
    case 'completed':
      messageHeader = `Deal Created ${pipedriveDealId} for RAQ request`
      subject = `[Johnny5] CCA RAQ Deal DEAL ID: ${pipedriveDealId} created`
      break
    case 'error-processing':
      messageHeader = `Error Processing RAQ Deal`
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
  if (pipedriveDealId) message += `Pipedrive Deal: ${pipedriveDealId}\n`
  if (errorReason) message += `Error Reason: ${errorReason}\n`
  if (process.env.APP_ENV !== 'prod')
    message += `\nEnvironment: ${process.env.APP_ENV}`

  return { subject, message }
}
