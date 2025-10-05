import { type DbFile, type DbJob } from '@dbc-tech/johnny5-mongodb'
import type { JobStatusCloudEvent } from '@dbc-tech/johnny5/typebox'
import { getEnvironment, truncateString } from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'
import type {
  AdaptiveCard,
  Color,
  Fact,
  PowerappTeamsService,
} from '@dbc-tech/teams'
import { buildBatchMatterCloseMessage } from './batch-matter-close'
import { buildCcaDealMatterCreatMessage } from './cca-deal-matter'
import { buildContractDropMessage } from './contract-drop'
import { buildMatterOpeningMessage } from './matter-opening'
import { getMarkdownEmail, getTeamsDisplayDate } from './utils'

export const teamsNotifications = async (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
  logger: Logger,
  teams: PowerappTeamsService,
) => {
  const { data } = event
  const { fileId, jobId, status } = data
  const { teamsSubscribers } = job

  const message = await buildTeamsMessage(event, job, file)

  if (!teamsSubscribers || teamsSubscribers.length === 0) {
    await logger.warn(
      `No teams subscribers found for File Id:${fileId}, Job Id:${jobId}`,
    )
    return
  }

  for (const subscriber of teamsSubscribers) {
    if (!subscriber.events.includes(status)) {
      continue
    }

    if (subscriber.teamsId && subscriber.channelId) {
      await teams.sendTeamsMessage({
        powerAppsUrl: subscriber.teamsUrl,
        adaptiveCard: message,
        channelId: subscriber.channelId,
        teamsId: subscriber.teamsId,
      })
    } else {
      await teams.sendChatMessage({
        powerAppsUrl: subscriber.teamsUrl,
        adaptiveCard: message,
      })
    }
  }
}

export const buildTeamsMessage = async (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
): Promise<AdaptiveCard> => {
  switch (job.type) {
    case 'matter-opening':
      return buildMatterOpeningMessage(event, job, file)
    case 'contract-drop':
      return buildContractDropMessage(event, job, file)
    case 'batch-matter-close':
      return buildBatchMatterCloseMessage(event, job, file)
    case 'deal-matter':
      return buildCcaDealMatterCreatMessage(event, job, file)
    default:
      return buildDefaultMessage(event, job, file)
  }
}

export const buildDefaultMessage = async (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
): Promise<AdaptiveCard> => {
  const { data } = event
  const { status } = data

  const facts = basicFacts(event, job, file)

  let message = `Status updated: ${status}`
  let color: Color = 'default'
  switch (status) {
    case 'error-processing':
      message = `Error Processing Job`
      color = 'attention'
      break

    case 'hitl-rejected':
      message = `HITL Job was rejected`
      color = 'warning'
      break

    case 'completed':
      color = 'good'
  }

  return buildTeamsChatWebhook(event, facts, message, color)
}

export const basicFacts = (
  event: JobStatusCloudEvent,
  job: DbJob,
  file: DbFile,
): Fact[] => {
  const { data } = event
  const facts: Fact[] = [
    {
      title: 'Job:',
      value: data.jobId,
    },
    {
      title: 'Type:',
      value: job.type,
    },
    {
      title: 'Status:',
      value: data.status,
    },
    {
      title: 'File:',
      value: data.fileId,
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

  if (job.meta?.some((m) => m.key === 'createdByEmail')) {
    const email = job.meta?.find((m) => m.key === 'createdByEmail')?.value || ''
    facts.push({
      title: 'Created By:',
      value: getMarkdownEmail(email),
    })
  }

  if (job.completedOn)
    facts.push({
      title: 'Completed On:',
      value: getTeamsDisplayDate(job.completedOn),
    })

  if (file.actionStepMatterId)
    facts.push({
      title: 'Matter:',
      value: `${file.actionStepMatterId}`,
    })

  if (file.pipedriveDealId)
    facts.push({
      title: 'Pipedrive Deal:',
      value: `${file.pipedriveDealId}`,
    })

  if (job.errorReason)
    facts.push({
      title: 'Error Reason:',
      value: truncateString(job.errorReason, 300),
    })

  return facts
}

export const buildTeamsChatWebhook = async (
  event: JobStatusCloudEvent,
  dataFacts: Fact[],
  message: string,
  statusColor: Color = 'default',
  subject: string = '[Johnny5] Status Update',
): Promise<AdaptiveCard> => {
  const now = getTeamsDisplayDate(new Date())

  const { data } = event

  const envFacts: Fact[] = []
  envFacts.push({
    title: 'Environment:',
    value: getEnvironment(),
  })

  const adaptiveCard: AdaptiveCard = {
    type: 'AdaptiveCard',
    msteams: { width: 'Full' },
    body: [
      {
        type: 'TextBlock',
        text: subject,
        style: 'Heading',
        weight: 'Bolder',
      },
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            items: [
              {
                type: 'Image',
                style: 'Person',
                url: 'https://cdn.conveyancing.com.au/public/johnny5/images/johnny5-logo.jpg',
                altText: 'johnny5',
                size: 'Small',
              },
            ],
            width: 'auto',
          },
          {
            type: 'Column',
            items: [
              {
                type: 'TextBlock',
                weight: 'Bolder',
                color: statusColor,
                text: `Status: ${data.status}`,
                wrap: true,
              },
              {
                type: 'TextBlock',
                spacing: 'None',
                text: `Updated: ${now}`,
                isSubtle: true,
                wrap: true,
              },
            ],
            width: 'stretch',
          },
        ],
      },
      {
        type: 'TextBlock',
        text: message,
        wrap: true,
      },
      {
        type: 'FactSet',
        facts: dataFacts,
      },
      {
        type: 'FactSet',
        facts: envFacts,
      },
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
  }

  return adaptiveCard
}
