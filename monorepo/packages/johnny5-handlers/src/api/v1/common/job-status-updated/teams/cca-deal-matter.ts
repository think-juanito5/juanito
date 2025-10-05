import { getTodayDealMatterCreatedCount } from '@dbc-tech/cca-common'
import {
  type DbFile,
  type DbJob,
  MatterCreateModel,
} from '@dbc-tech/johnny5-mongodb'
import type { JobStatusCloudEvent } from '@dbc-tech/johnny5/typebox'
import { truncateString } from '@dbc-tech/johnny5/utils'
import type { AdaptiveCard, Color, Fact } from '@dbc-tech/teams'
import { buildTeamsChatWebhook } from './teams-notifications'

export const buildCcaDealMatterCreatMessage = async (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
): Promise<AdaptiveCard> => {
  const { data } = event
  const { status, jobId, fileId } = data

  const { meta, errorReason } = job
  const { actionStepMatterId, pipedriveDealId } = file
  const ccaDealText = 'CCA Deal Matter'

  const matterData = await MatterCreateModel.findOne({ jobId })

  const postCode = matterData?.manifest?.meta?.find(
    (m) => m.key === 'postCode',
  )?.value
  const concierge = matterData?.manifest?.meta?.find(
    (m) => m.key === 'concierge',
  )?.value
  const matterTypeName = matterData?.manifest?.meta?.find(
    (m) => m.key === 'matterTypeName',
  )?.value
  const clientName = matterData?.manifest?.meta?.find(
    (m) => m.key === 'clientName',
  )?.value

  const matterName = meta?.find((m) => m.key === 'matterName')?.value
  const facts: Fact[] = []

  const count = await getTodayDealMatterCreatedCount()

  if (count) {
    facts.push({
      title: 'MC Count:',
      value: `#${count}`,
    })
  }

  if (matterName) {
    facts.push({
      title: 'Matter Created with Ref:',
      value:
        matterName === 'Pending'
          ? `Matter ${actionStepMatterId} (name pending) has been created for deal Id ${pipedriveDealId}`
          : matterName,
    })
  }
  if (actionStepMatterId) {
    facts.push({
      title: 'Matter Id:',
      value: `${actionStepMatterId}`,
    })
  }

  if (clientName) {
    facts.push({
      title: 'Client:',
      value: clientName,
    })
  }

  if (matterTypeName) {
    facts.push({
      title: 'Matter Type:',
      value: matterTypeName,
    })
  }

  if (concierge) {
    facts.push({
      title: 'Client Services:',
      value: concierge,
    })
  }

  if (postCode) {
    facts.push({
      title: 'Postcode:',
      value: postCode,
    })
  }

  facts.push({
    title: 'JobId:',
    value: jobId,
  })

  facts.push({
    title: 'FileId:',
    value: fileId,
  })

  facts.push({
    title: 'Tenant:',
    value: data.tenant,
  })

  if (errorReason) {
    facts.push({
      title: 'Error Reason:',
      value: truncateString(errorReason, 300),
    })
  }

  const subject = `[Johnny5] ${ccaDealText} Creation`

  let message = `Status updated: ${status}`
  let color: Color = 'default'
  switch (job.status) {
    case 'error-processing':
      color = 'attention'
      message = `Error Processing ${ccaDealText} Job`
      break

    case 'completed': {
      color = 'good'
      message = `Matter ${matterName} has been created for deal Id ${pipedriveDealId}`
      break
    }
  }

  return buildTeamsChatWebhook(event, facts, message, color, subject)
}
