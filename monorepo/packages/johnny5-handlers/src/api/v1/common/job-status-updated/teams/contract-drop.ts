import {
  ContractDataValidationModel,
  type DbFile,
  type DbJob,
  JobModel,
} from '@dbc-tech/johnny5-mongodb'
import type { JobStatusCloudEvent } from '@dbc-tech/johnny5/typebox'
import { truncateString } from '@dbc-tech/johnny5/utils'
import type { AdaptiveCard, Color, Fact } from '@dbc-tech/teams'
import { basicFacts, buildTeamsChatWebhook } from './teams-notifications'
import { getMarkdownEmail, getTeamsDisplayDate } from './utils'

export const buildContractDropMessage = async (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
): Promise<AdaptiveCard> => {
  const { data } = event
  const { status } = data

  const { blobs, tenant, fileId } = job
  const { actionStepMatterId } = file

  const blob = blobs?.find((blob) => blob.type === 'contract')
  const fileUrl = blob?.name || ''
  const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1)

  const facts =
    job.status == 'error-processing'
      ? basicFacts(event, job, file)
      : await contractDropFacts(event, job, file)

  const corrections = await ContractDataValidationModel.findOne({
    tenant,
    fileId,
  })
  const correctionsNote = corrections?.note
  if (correctionsNote) {
    facts.push({
      title: 'Note:',
      value: correctionsNote,
    })
  }

  const subject = `[Johnny5] BTR Contract Drop (${filename})`

  let message = `Status updated: ${status}`
  let color: Color = 'default'
  switch (job.status) {
    case 'created':
      message = `We have received your request to process Contract: ${filename} for Matter: ${actionStepMatterId}.`
      break
    case 'completed': {
      color = 'good'
      message = `Matter ${actionStepMatterId} has been updated from Contract: ${filename}`
      break
    }
    case 'hitl-waiting': {
      color = 'warning'
      message = `Contract: ${filename} is ready to be checked for Matter: ${actionStepMatterId}`
      break
    }
    case 'hitl-rejected': {
      message = `Contract: ${filename} for Matter: ${actionStepMatterId} was rejected because: ${correctionsNote || 'Reason unknown'}`
      break
    }
    case 'error-processing':
      color = 'attention'
      message = `Error Processing Contract: ${filename} for Matter: ${actionStepMatterId}`
      break
  }

  return buildTeamsChatWebhook(event, facts, message, color, subject)
}

export const contractDropFacts = async (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
): Promise<Fact[]> => {
  const { data } = event
  const email = job.meta?.find((m) => m.key === 'createdByEmail')?.value || ''
  const matterOpeningJob = await JobModel.findOne({
    fileId: data.fileId,
    type: 'matter-opening',
  })

  const facts: Fact[] = [
    {
      title: 'Matter Ref:',
      value:
        matterOpeningJob?.meta?.find((m) => m.key === 'matterName')?.value ||
        'N/A',
    },
    {
      title: 'Matter Id:',
      value: `${file.actionStepMatterId}`,
    },
    {
      title: 'BTR Conveyancer:',
      value: email ? getMarkdownEmail(email) : 'N/A',
    },
    {
      title: 'Job Id (Matter Create):',
      value: matterOpeningJob?.id || 'N/A',
    },
    {
      title: 'Job Id (Contract Drop):',
      value: data.jobId,
    },
    {
      title: 'File Id:',
      value: data.fileId,
    },
    {
      title: 'Status:',
      value: data.status,
    },
    {
      title: 'Type:',
      value: job.type,
    },
    {
      title: 'Service Type:',
      value: job.serviceType,
    },
    {
      title: 'Tenant:',
      value: data.tenant,
    },
    {
      title: 'Created On:',
      value: getTeamsDisplayDate(job.createdOn),
    },
  ]

  if (job.completedOn)
    facts.push({
      title: 'Completed On:',
      value: getTeamsDisplayDate(job.completedOn),
    })

  if (job.errorReason)
    facts.push({
      title: 'Error Reason:',
      value: truncateString(job.errorReason, 300),
    })

  return facts
}
