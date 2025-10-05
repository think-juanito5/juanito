import { type DbFile, type DbJob } from '@dbc-tech/johnny5-mongodb'
import type { JobStatusCloudEvent } from '@dbc-tech/johnny5/typebox'
import type { AdaptiveCard, Color } from '@dbc-tech/teams'
import { basicFacts, buildTeamsChatWebhook } from './teams-notifications'

export const buildMatterOpeningMessage = async (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
): Promise<AdaptiveCard> => {
  const { data } = event
  const { status } = data

  const { meta } = job
  const { actionStepMatterId } = file

  const matterName = meta?.find((m) => m.key === 'matterName')?.value

  const facts = basicFacts(event, job, file)

  const subject = `[Johnny5] Matter Opening`

  let message = `Status updated: ${status}`
  let color: Color = 'default'
  switch (job.status) {
    case 'created':
      message = `We have received your request to create a Matter with name: ${matterName}`
      break
    case 'completed': {
      color = 'good'
      message = `Matter ${actionStepMatterId} has been created with name: ${matterName}`
      break
    }
    case 'error-processing':
      color = 'attention'
      message = `Error Processing Matter with name: ${matterName}`
      break
  }

  return buildTeamsChatWebhook(event, facts, message, color, subject)
}
