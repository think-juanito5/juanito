import type { AdaptiveCard, Fact } from '@dbc-tech/teams'
import { formatRFC7231 } from 'date-fns'
import type { QueueDetail } from './sb'
import type { Namespace } from './sb.schema'

export const createTeamsMessage = (
  ns: Namespace,
  queueDetails: QueueDetail[],
): AdaptiveCard => {
  const now = formatRFC7231(new Date())

  const dataFacts: Fact[] = []
  queueDetails.forEach((qd) => {
    dataFacts.push({
      title: qd.name,
      value: `Active: ${qd.active}, DLQ: ${qd.dlq}`,
    })
  })

  const basicFacts: Fact[] = [
    {
      title: 'subscription:',
      value: ns.subscription,
    },
    {
      title: 'resourceGroup:',
      value: ns.resourceGroup,
    },
    {
      title: 'namespace:',
      value: ns.namespace,
    },
    {
      title: 'environment:',
      value: ns.environment || 'N/A',
    },
  ]

  const adaptiveContent: AdaptiveCard = {
    type: 'AdaptiveCard',
    msteams: { width: 'Full' },
    body: [
      {
        type: 'TextBlock',
        text: 'Queue Message Alert',
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
                color: 'attention',
                text: 'Status: Unprocessed Messages',
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
        text: 'There are some unprocessed or dead-lettered messages in the Service Bus queues & topics.',
        wrap: true,
      },
      {
        type: 'FactSet',
        facts: dataFacts,
      },
      {
        type: 'FactSet',
        facts: basicFacts,
      },
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
  }

  return adaptiveContent
}
