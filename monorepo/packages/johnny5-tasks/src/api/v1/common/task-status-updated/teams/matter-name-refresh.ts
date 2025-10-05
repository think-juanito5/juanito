import {
  type DbFile,
  type DbTask,
  JobModel,
  MatterCreateModel,
} from '@dbc-tech/johnny5-mongodb'
import type { TaskStatusCloudEvent } from '@dbc-tech/johnny5/typebox'
import { truncateString } from '@dbc-tech/johnny5/utils'
import type { AdaptiveCard, Color, Fact } from '@dbc-tech/teams'
import { buildTeamsChatWebhook } from './teams-notifications'

export const buildRefreshMatterNameMessage = async (
  event: TaskStatusCloudEvent,
  task: DbTask,
  file: DbFile,
): Promise<AdaptiveCard> => {
  const { data } = event
  const { status, taskId, fileId } = data

  const { actionStepMatterId } = file
  const ccaDealText = '@CCA Deal Matter'

  const matterData = await MatterCreateModel.findOne({
    matterId: actionStepMatterId,
  })
  const { manifest } = matterData || {}

  const metaMap = new Map(manifest?.meta?.map(({ key, value }) => [key, value]))

  const pipedriveDealId = metaMap.get('dealId')
  const matterTypeName = metaMap.get('matterTypeName')
  const postCode = metaMap.get('postCode')
  const concierge = metaMap.get('concierge')
  const clientName = metaMap.get('clientName')

  const jobId = matterData?.jobId
  const job = await JobModel.findOne({ _id: jobId })
  const { meta } = job || {}
  const matterName = meta?.find((m) => m.key === 'matterName')?.value

  const facts: Fact[] = []

  if (matterName) {
    facts.push({
      title: 'Matter Created with Ref:',
      value: matterName,
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
    title: 'TaskId:',
    value: taskId,
  })

  facts.push({
    title: 'FileId:',
    value: fileId,
  })

  facts.push({
    title: 'Tenant:',
    value: data.tenant,
  })
  if (task.errorReason) {
    facts.push({
      title: 'Error Reason:',
      value: truncateString(task.errorReason, 300),
    })
  }

  const subject = `[Johnny5] ${ccaDealText} Creation`

  let message = `Status updated: ${status}`
  let color: Color = 'default'
  switch (task.status) {
    case 'completed':
      color = 'good'
      message = `Matter ${matterName} has been created for deal Id ${pipedriveDealId}`
      break

    case 'failed':
    case 'completed-with-errors':
      color = 'attention'
      message = `Error Processing ${ccaDealText} Task`
      break
  }

  return buildTeamsChatWebhook(event, facts, message, color, subject)
}
