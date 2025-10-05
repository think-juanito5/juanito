import { type DbFile, type DbJob } from '@dbc-tech/johnny5-mongodb'
import type { JobStatusCloudEvent } from '@dbc-tech/johnny5/typebox'
import type { AdaptiveCard, Color } from '@dbc-tech/teams'
import { basicFacts, buildTeamsChatWebhook } from './teams-notifications'

export const buildBatchMatterCloseMessage = async (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
): Promise<AdaptiveCard> => {
  const { data } = event
  const { status } = data

  const { matterIds } = job

  const facts = basicFacts(event, job, file)

  const subject = `[Johnny5] Batch Matter Close`
  const closedMatters = matterIds
    ? matterIds.filter((m) => m.status === 'closed').length
    : 0
  const allMatters = matterIds ? matterIds.length : 0

  let message = `Status updated: ${status}`
  let color: Color = 'default'
  switch (job.status) {
    case 'created':
      message = `Starting to close ${allMatters} matters.`
      break
    case 'completed': {
      color = 'good'
      message = `Finished closing ${closedMatters} of ${allMatters} matters.`
      break
    }
    case 'error-processing':
      color = 'attention'
      message = `Error Processing. Finished closing ${closedMatters} of ${allMatters}`
      break
  }

  return buildTeamsChatWebhook(event, facts, message, color, subject)
}
