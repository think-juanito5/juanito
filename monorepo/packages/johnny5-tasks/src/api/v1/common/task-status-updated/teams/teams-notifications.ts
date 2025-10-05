import { type DbFile, type DbTask } from '@dbc-tech/johnny5-mongodb'
import type { TaskStatusCloudEvent } from '@dbc-tech/johnny5/typebox'
import { getEnvironment } from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'
import type {
  AdaptiveCard,
  Color,
  Fact,
  PowerappTeamsService,
} from '@dbc-tech/teams'
import { buildRefreshMatterNameMessage } from './matter-name-refresh'
import { getMarkdownEmail, getTeamsDisplayDate } from './utils'

export const teamsNotifications = async (
  event: TaskStatusCloudEvent,
  task: DbTask,
  file: DbFile,
  logger: Logger,
  teams: PowerappTeamsService,
) => {
  const { data } = event
  const { fileId, taskId, status } = data
  const { teamsSubscribers } = task
  const { meta } = task

  switch (task.type) {
    case 'matter-name-refresh': {
      const enabledNotif = meta?.find(
        (m) => m.key === 'teamsNotifyEnabled',
      )?.value

      if (!enabledNotif || enabledNotif === 'false') {
        await logger.warn(
          `Notifications disabled for matter-name-refresh. Skipping Teams message for File Id:${fileId}, Task Id:${taskId}`,
        )
        return
      }
      break
    }
    default:
      break
  }

  const message = await buildTeamsMessage(event, task, file)

  if (!teamsSubscribers || teamsSubscribers.length === 0) {
    await logger.warn(
      `No teams subscribers found for File Id:${fileId}, Task Id:${taskId}`,
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
  event: TaskStatusCloudEvent,
  task: DbTask,
  file: DbFile,
): Promise<AdaptiveCard> => {
  switch (task.type) {
    case 'matter-name-refresh':
      return buildRefreshMatterNameMessage(event, task, file)
    default:
      return buildDefaultMessage(event, task, file)
  }
}

export const buildDefaultMessage = async (
  event: TaskStatusCloudEvent,
  task: DbTask,
  file: DbFile,
): Promise<AdaptiveCard> => {
  const { data } = event
  const { status } = data

  const facts = basicFacts(event, task, file)

  let message = `Status updated: ${status}`
  let color: Color = 'default'
  switch (status) {
    case 'failed':
      message = `Failed Task`
      color = 'attention'
      break

    case 'abandoned':
      message = `Abandoned Task`
      color = 'warning'
      break

    case 'completed':
      color = 'good'
      break

    case 'completed-with-errors':
      color = 'warning'
      break
  }

  return buildTeamsChatWebhook(event, facts, message, color)
}

export const basicFacts = (
  event: TaskStatusCloudEvent,
  task: DbTask,
  file: DbFile,
): Fact[] => {
  const { data } = event
  const facts: Fact[] = [
    {
      title: 'Task:',
      value: data.taskId,
    },
    {
      title: 'Type:',
      value: task.type,
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
      title: 'Tenant:',
      value: data.tenant,
    },
    {
      title: 'Created On:',
      value: getTeamsDisplayDate(task.createdOn),
    },
  ]

  if (task.meta?.some((m) => m.key === 'createdByEmail')) {
    const email =
      task.meta?.find((m) => m.key === 'createdByEmail')?.value || ''
    facts.push({
      title: 'Created By:',
      value: getMarkdownEmail(email),
    })
  }

  if (task.completedOn)
    facts.push({
      title: 'Completed On:',
      value: getTeamsDisplayDate(task.completedOn),
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

  if (task.errorReason)
    facts.push({
      title: 'Error Reason:',
      value: task.errorReason,
    })

  return facts
}

export const buildTeamsChatWebhook = async (
  event: TaskStatusCloudEvent,
  dataFacts: Fact[],
  message: string,
  statusColor: Color = 'default',
  subject: string = '[Johnny5] Status Update',
): Promise<AdaptiveCard> => {
  const now = getTeamsDisplayDate(new Date())

  const { data } = event

  const envFacts: Fact[] = []
  envFacts.push({
    title: 'environment:',
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
