import type { HttpServiceConfig, HttpServiceError } from '@dbc-tech/http'
import { HttpService } from '@dbc-tech/http'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import { NotFoundError } from 'elysia'
import type { AdaptiveCard, TeamsChatWebhook } from './schema'
import {
  CPowerappTeamsResponse,
  type PowerappTeamsNotificationsBody,
} from './schema/powerapp-teams.schema'

export type TeamsServiceConfig = {
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}

export type SendTeamsMessageConfig = {
  powerAppsUrl: string
  teamsId: string
  channelId: string
  adaptiveCard: AdaptiveCard
}

export type SendChatMessageConfig = {
  powerAppsUrl: string
  adaptiveCard: AdaptiveCard
}

export const errorFrom = (err: HttpServiceError) => {
  if (err.response.status === 404) return new NotFoundError(err.statusText)
  return new Error(err.statusText)
}
export class PowerappTeamsService {
  private logger: Logger

  constructor(private readonly config: TeamsServiceConfig) {
    this.logger = config.logger ?? NullLogger()
  }

  private createHttpService(url: URL): HttpService {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-client-id': this.config.clientId || 'TeamsService',
    }
    if (this.config.correlationId)
      headers['x-correlation-id'] = this.config.correlationId

    const httpServiceConfig: HttpServiceConfig = {
      baseUrl: url.origin,
      defaultHeaders: headers,
      logger: this.logger,
      retries: this.config.retries ?? 5,
      disableResponseLogging: true,
    }
    return new HttpService(httpServiceConfig)
  }

  async sendTeamsMessage({
    powerAppsUrl,
    teamsId,
    channelId,
    adaptiveCard,
  }: SendTeamsMessageConfig) {
    const url = new URL(powerAppsUrl)
    const httpService = this.createHttpService(url)
    const query: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })

    const body: PowerappTeamsNotificationsBody = {
      teamsId,
      channelId,
      body: {
        adaptiveCard,
      },
    }

    const result = await httpService.post(
      {
        path: url.pathname,
        query,
        body,
      },
      CPowerappTeamsResponse,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async sendChatMessage({ powerAppsUrl, adaptiveCard }: SendChatMessageConfig) {
    const url = new URL(powerAppsUrl)
    const httpService = this.createHttpService(url)
    const query: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })

    const body: TeamsChatWebhook = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: adaptiveCard,
        },
      ],
    }

    const result = await httpService.post({
      path: url.pathname,
      query,
      body,
    })
    if (!result.ok) throw errorFrom(result.val)

    return result.val
  }
}
