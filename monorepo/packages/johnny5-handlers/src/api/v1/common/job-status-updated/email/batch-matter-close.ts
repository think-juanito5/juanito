import type { DbJob } from '@dbc-tech/johnny5-mongodb'
import type { JobStatus } from '@dbc-tech/johnny5/typebox'
import type { HydratedDocument } from 'mongoose'

export const buildBatchMatterCloseMessage = async (
  job: HydratedDocument<DbJob>,
  status: JobStatus,
): Promise<{ subject: string; message: string }> => {
  const {
    matterIds,
    completedOn,
    createdOn,
    errorReason,
    fileId,
    id,
    serviceType,
    tenant,
    type,
  } = job

  const subject = `[Johnny5] Batch Matter Close`
  const closedMatters = matterIds
    ? matterIds.filter((m) => m.status === 'closed').length
    : 0
  const allMatters = matterIds ? matterIds.length : 0

  let messageHeader = `Status updated: ${status}`
  switch (job.status) {
    case 'created':
      messageHeader = `Starting to close ${allMatters} matters.`
      break
    case 'completed': {
      messageHeader = `Finished closing ${closedMatters} of ${allMatters} matters.`
      break
    }
    case 'error-processing':
      messageHeader = `Error Processing. Finished closing ${closedMatters} of ${allMatters}`
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
  if (errorReason) message += `Error Reason: ${errorReason}\n`
  if (process.env.APP_ENV !== 'prod')
    message += `\nEnvironment: ${process.env.APP_ENV}`

  return { subject, message }
}
