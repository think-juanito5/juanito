import { ServiceBusManagementClient } from '@azure/arm-servicebus'
import { DefaultAzureCredential } from '@azure/identity'
import { PowerappTeamsService } from '@dbc-tech/teams'
import chalk from 'chalk'
import type { CliConfig } from '../cli.schema'
import {
  ChalkTable,
  MarkdownTable,
  type Table,
  type TableSpec,
} from '../ui/table'
import type { ServiceBus } from './sb.schema'
import { createTeamsMessage } from './teams-message'

export type QueueDetail = {
  name: string
  active: number
  dlq: number
}

const createTableSpec = (queueNameWidth: number): TableSpec => {
  const width = queueNameWidth < 23 ? 23 : queueNameWidth
  return {
    columns: [
      {
        name: 'queueName',
        width,
        style: chalk.white,
        headerStyle: chalk.cyan,
        header: 'Queue or (Topic > Sub)',
      },
      {
        name: 'active',
        width: 10,
        style: chalk.green,
        headerStyle: chalk.cyan,
        header: 'Active',
      },
      {
        name: 'dlq',
        width: 10,
        style: chalk.red,
        headerStyle: chalk.cyan,
        header: 'DLQ',
      },
    ],
  }
}

const getQueueDetails = async (
  client: ServiceBusManagementClient,
  resourceGroup: string,
  namespace: string,
): Promise<QueueDetail[]> => {
  const itenms: QueueDetail[] = []

  const queues = client.queues.listByNamespace(resourceGroup, namespace)
  for await (const queue of queues) {
    const queuesGetResponse = await client.queues.get(
      resourceGroup,
      namespace,
      queue.name!,
    )
    const { countDetails } = queuesGetResponse
    if (!countDetails) continue
    itenms.push({
      name: queue.name ?? 'unknown',
      active: countDetails.activeMessageCount ?? 0,
      dlq: countDetails.deadLetterMessageCount ?? 0,
    })
  }

  const topics = client.topics.listByNamespace(resourceGroup, namespace)
  for await (const topic of topics) {
    const subscriptions = client.subscriptions.listByTopic(
      resourceGroup,
      namespace,
      topic.name!,
    )
    for await (const subscription of subscriptions) {
      const subscriptionsGetResponse = await client.subscriptions.get(
        resourceGroup,
        namespace,
        topic.name!,
        subscription.name!,
      )
      const { countDetails } = subscriptionsGetResponse
      if (!countDetails) continue
      itenms.push({
        name: `${topic.name} > ${subscription.name}`,
        active: countDetails.activeMessageCount ?? 0,
        dlq: countDetails.deadLetterMessageCount ?? 0,
      })
    }
  }

  return itenms
}

const get = async (
  { subscriptionId, markdown, teamsAlert }: Args,
  serviceBus: ServiceBus,
) => {
  const ns = serviceBus.namespaces.find(
    (n) => n.subscription === subscriptionId,
  )
  if (!ns) {
    throw new Error(
      `Namespace not found for subscription ID: ${subscriptionId}`,
    )
  }

  const { resourceGroup, namespace, thresholds, overrides } = ns
  const client = new ServiceBusManagementClient(
    new DefaultAzureCredential(),
    subscriptionId,
  )

  const queueDetails = await getQueueDetails(client, resourceGroup, namespace)
  const filteredQueueDetails = queueDetails.filter((queue) => {
    const override = overrides?.find(
      (o) =>
        queue.name === o.queue ||
        queue.name === `${o.topic} > ${o.subscription}`,
    )
    const minActiveMessageCount =
      override?.thresholds.minActiveMessageCount ??
      thresholds?.minActiveMessageCount ??
      0
    const minDeadLetterCount =
      override?.thresholds.minDeadLetterCount ??
      thresholds?.minDeadLetterCount ??
      0
    return (
      queue.active >= minActiveMessageCount || queue.dlq >= minDeadLetterCount
    )
  })

  if (
    teamsAlert &&
    filteredQueueDetails.length > 0 &&
    serviceBus.teamsAlertUrl
  ) {
    const adaptiveCard = createTeamsMessage(ns, filteredQueueDetails)
    const teams = new PowerappTeamsService({})
    try {
      if (serviceBus.teamsId && serviceBus.channelId) {
        await teams.sendTeamsMessage({
          powerAppsUrl: serviceBus.teamsAlertUrl,
          adaptiveCard,
          channelId: serviceBus.channelId,
          teamsId: serviceBus.teamsId,
        })
      } else {
        // Send as a chat message if teamsId and channelId are not provided
        // This is a fallback and should be used with caution
        await teams.sendChatMessage({
          powerAppsUrl: serviceBus.teamsAlertUrl,
          adaptiveCard,
        })
      }
    } catch (error) {
      console.error('Error sending Teams message:', error)
    }
  }

  const maxQueueNameWidth =
    Math.max(...filteredQueueDetails.map((q) => q.name.length)) + 1
  const tableSpec = createTableSpec(maxQueueNameWidth)
  const table: Table = markdown
    ? new MarkdownTable(tableSpec)
    : new ChalkTable(tableSpec)
  const header = table.writeHeader()
  if (!markdown) {
    console.log(header)
  } else {
    process.stdout.write(`${header}\n`)
  }
  filteredQueueDetails.forEach(({ name, active, dlq }) => {
    const row = table.writeRow([
      name,
      active?.toString() ?? '0',
      dlq.toString(),
    ])
    if (!markdown) {
      console.log(row)
    } else {
      process.stdout.write(`${row}\n`)
    }
  })
}

export type Args = {
  subscriptionId: string
  markdown: boolean
  teamsAlert: boolean
}

export const sb = async (args: Args, { serviceBus }: CliConfig) => {
  if (!serviceBus) {
    throw new Error('No service bus configuration found')
  }

  return get(args, serviceBus)
}
