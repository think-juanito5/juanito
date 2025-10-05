import {
  type CloudEvent,
  J5Config,
  cloudEventSchema,
  component,
  dapr,
  getEnvironment,
  publish,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import type { AdaptiveCard, Fact } from '@dbc-tech/teams'
import { Value } from '@sinclair/typebox/value'
import { formatRFC7231 } from 'date-fns'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const undelivered_handler = new Elysia()
  .use(appContext({ name: 'v1.undelivered' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/undelivered',
    async ({ body, ctx }) => {
      const { logger, johnny5Config } = ctx

      await logger.info(`Processing undelivered message`)

      if (Value.Check(cloudEventSchema, body)) {
        await logger.debug(
          `Creating CloudEvent Teams Alert from message id:${body.id}`,
        )
        const adaptiveCard = createTeamsMessage(body)

        const configService = johnny5Config('CCA')

        const powerAppsUrlConfig = await configService.get(
          J5Config.teams.powerAutomateTeamsServiceUrl,
        )
        if (!powerAppsUrlConfig) {
          await logger.warn(
            `${J5Config.teams.powerAutomateTeamsServiceUrl} is not set. Unable to send Teams notification for undelivered message`,
          )
          return dapr.drop
        }
        const powerAppsUrl = powerAppsUrlConfig.value

        const teamsIdConfig = await configService.get(
          J5Config.teams.undeliveredMessages.teamsId,
        )
        if (!teamsIdConfig) {
          await logger.warn(
            `Config: ${J5Config.teams.undeliveredMessages.teamsId} is not set. Unable to send Teams notification for undelivered message`,
          )
          return dapr.drop
        }
        const teamsId = teamsIdConfig.value

        const channelIdConfig = await configService.get(
          J5Config.teams.undeliveredMessages.channelId,
        )
        if (!channelIdConfig) {
          await logger.warn(
            `Config: ${J5Config.teams.undeliveredMessages.channelId} is not set. Unable to send Teams notification for undelivered message`,
          )
          return dapr.drop
        }
        const channelId = channelIdConfig.value

        await ctx.powerappTeams().sendTeamsMessage({
          powerAppsUrl,
          teamsId,
          channelId,
          adaptiveCard,
        })
      }

      await logger.debug(`Publishing message to dlq queue`, body)

      await publish({
        pubsub: component.longQueues,
        topicOrQueue: 'johnny5-dlq',
        message: body,
        logger,
        correlationId: ctx.correlationId,
      })

      return dapr.success
    },
    {
      body: t.Object({}, { additionalProperties: true }),
      response: {
        200: daprResponseSchema,
      },
    },
  )

export const createTeamsMessage = (cloudEvent: CloudEvent): AdaptiveCard => {
  const now = formatRFC7231(new Date())
  const cloudEventFacts: Fact[] = [
    {
      title: 'id:',
      value: cloudEvent.id,
    },
    {
      title: 'pubsub:',
      value: cloudEvent.pubsubname ?? '',
    },
    {
      title: 'topic:',
      value: cloudEvent.topic ?? '',
    },
    {
      title: 'source:',
      value: cloudEvent.source,
    },
    {
      title: 'type:',
      value: cloudEvent.type,
    },
    {
      title: 'traceid:',
      value: cloudEvent.traceid ?? '',
    },
    {
      title: 'traceparent:',
      value: cloudEvent.traceparent ?? '',
    },
    {
      title: 'tracestate:',
      value: cloudEvent.tracestate ?? '',
    },
    {
      title: 'time:',
      value: cloudEvent.time,
    },
  ]

  const dataFacts: Fact[] = []
  if ('data' in cloudEvent) {
    const data = cloudEvent.data as object

    if ('fileId' in data) {
      dataFacts.push({ title: 'fileId:', value: `${data.fileId}` })
    }
    if ('jobId' in data) {
      dataFacts.push({ title: 'jobId:', value: `${data.jobId}` })
    }
    if ('taskId' in data) {
      dataFacts.push({ title: 'taskId:', value: `${data.taskId}` })
    }
    if ('tenant' in data) {
      dataFacts.push({ title: 'tenant:', value: `${data.tenant}` })
    }
  }

  const envFacts: Fact[] = [
    {
      title: 'environment:',
      value: getEnvironment(),
    },
  ]

  const adaptiveCard: AdaptiveCard = {
    type: 'AdaptiveCard',
    msteams: { width: 'Full' },
    body: [
      {
        type: 'TextBlock',
        text: '[Johnny5] Undelivered Message Alert',
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
                text: 'Status: Undelivered',
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
        text: 'A CloudEvent message could not be processed by Johnny5.',
        wrap: true,
      },
      {
        type: 'FactSet',
        facts: cloudEventFacts,
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
