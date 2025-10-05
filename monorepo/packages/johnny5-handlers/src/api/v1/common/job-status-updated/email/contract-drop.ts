import {
  ContractDataValidationModel,
  type DbFile,
  type DbJob,
} from '@dbc-tech/johnny5-mongodb'
import type { JobStatus } from '@dbc-tech/johnny5/typebox'
import type { HydratedDocument } from 'mongoose'

export const buildContractDropMessage = async (
  job: HydratedDocument<DbJob>,
  file: HydratedDocument<DbFile>,
  status: JobStatus,
): Promise<{ subject: string; message: string }> => {
  const {
    blobs,
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
  const blob = blobs?.find((blob) => blob.type === 'contract')
  const fileUrl = blob?.name || ''
  const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1)

  const corrections = await ContractDataValidationModel.findOne({
    tenant,
    fileId,
  })

  const correctionsNote = corrections?.note
  let subject = `[Johnny5] Contract Drop for Matter ID: ${actionStepMatterId} is in progress (${filename})`
  let messageHeader = `Status updated: ${status}`
  switch (job.status) {
    case 'created':
      messageHeader = `We have received your request to process Contract: ${filename} for Matter: ${actionStepMatterId}.`
      break
    case 'completed':
      messageHeader = `Matter ${actionStepMatterId} has been updated from Contract: ${filename}`
      subject = `[Johnny5] Contract Drop for Matter ID: ${actionStepMatterId} has been updated and ready to check (${filename})`

      break
    case 'hitl-rejected': {
      messageHeader = `Contract: ${filename} for Matter: ${actionStepMatterId} was rejected because: ${correctionsNote || 'Reason unknown'}`
      subject = `[Johnny5] Contract Drop for Matter ID: ${actionStepMatterId} has been rejected (${filename})`
      break
    }
    case 'error-processing':
      messageHeader = `Error Processing Contract: ${filename} for Matter: ${actionStepMatterId}`
      break
  }

  let message = `${messageHeader}

Job: ${id}
Type: ${type}
Status: ${status}
File: ${fileId}
Service Type: ${serviceType}
Tenant: ${tenant}
Contract: ${filename}
Created On: ${createdOn}
`

  if (completedOn) message += `Completed On: ${completedOn}\n`
  if (correctionsNote) message += `Note: ${correctionsNote}\n`
  if (actionStepMatterId) message += `Matter: ${actionStepMatterId}\n`
  if (pipedriveDealId) message += `Pipedrive Deal: ${pipedriveDealId}\n`
  if (errorReason) message += `Error Reason: ${errorReason}\n`
  if (process.env.APP_ENV !== 'prod')
    message += `\nEnvironment: ${process.env.APP_ENV}`

  return { subject, message }
}
