import { beforeAll, describe, expect, it } from 'bun:test'
import { createMongoDbConnection } from '@dbc-tech/johnny5-mongodb'
import { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { J5Config } from '@dbc-tech/johnny5/constants'
import { type AdaptiveCard, PowerappTeamsService } from '@dbc-tech/teams'
import { format, parseISO } from 'date-fns'

function formatDateTime(
  dateInput: string | Date,
  formatString: string,
): string {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput
  return format(date, formatString)
}

describe('PowerappService', async () => {
  let powerapp: PowerappTeamsService
  let j5config: Johnny5ConfigService
  const teamsId = '0b99a735-022c-4a8c-ba16-77071886086f' //Technology
  const channelId = '19:149b99b5afcc4699a6fc9f938dea7cd4@thread.tacv2' //DevTest

  await createMongoDbConnection()

  beforeAll(() => {
    powerapp = new PowerappTeamsService({})
    j5config = new Johnny5ConfigService('BTR')
  })

  it(
    'should send message (adaptive cards format) to teams',
    async () => {
      const start = '2024-11-01T11:33'
      const end = '2024-11-01T13:33'

      const adaptiveCard: AdaptiveCard = {
        type: 'AdaptiveCard',
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        version: '1.3',
        body: [
          {
            text: 'Adaptive Cards - Date Formatting Sample Card - Test1',
            type: 'TextBlock',
            size: 'Medium',
            weight: 'Bolder',
          },
          {
            text: 'Lets just use various date formats:',
            type: 'TextBlock',
            separator: true,
            weight: 'Bolder',
          },
          {
            facts: [
              {
                title: 'Date Only',
                value: `${formatDateTime(start, 'yyyy-MM-dd')}`,
              },
              {
                title: 'Time Only',
                value: `${formatDateTime(start, 'HH:mm')}`,
              },
              {
                title: 'Date and Time',
                value: `${formatDateTime(start, 'dd.MM.yyyy HH:mm')}`,
              },
              {
                title: 'Long Date',
                value: `${formatDateTime(start, 'dddd dd. MMMM yyyy')}`,
              },
              {
                title: 'Short Date',
                value: `${formatDateTime(start, 'MM MMMM y')}`,
              },
              {
                title: 'Short Date with Time',
                value: `${formatDateTime(start, 'dd.MM.yy - hh:mm')}`,
              },
              {
                title: 'With Timezone',
                value: `${formatDateTime(start, 'dd MMM yyyy hh:mm tt zz')}`,
              },
              {
                title: 'Duration',
                value: `${Number(formatDateTime(end, 'hh')) - Number(formatDateTime(start, 'hh'))} hour`,
              },
            ],
            type: 'FactSet',
          },
          {
            text: 'Lets play with Dates',
            type: 'TextBlock',
            separator: true,
            weight: 'Bolder',
          },
        ],
      }

      const paTeamsServiceUrl = await j5config.get(
        J5Config.teams.powerAutomateTeamsServiceUrl,
      )
      if (!paTeamsServiceUrl) {
        throw new Error('Power Automate Teams Service URL not found')
      }

      const response = await powerapp.sendTeamsMessage({
        powerAppsUrl: paTeamsServiceUrl?.value,
        teamsId,
        channelId,
        adaptiveCard,
      })
      expect(response).toBeDefined()
      expect(response.operationStatus).toEqual('Success')
      expect(response.teamsId).toEqual(teamsId)
      expect(response.channelId).toEqual(channelId)
    },
    { timeout: 60000 },
  )
})
