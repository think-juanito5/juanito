import { J5Config } from '@dbc-tech/johnny5/constants'
import type {
  JobStatus,
  TaskStatus,
  TeamsSubscriber,
} from '@dbc-tech/johnny5/typebox'
import { errorMissingJ5Config } from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'
import type { Johnny5ConfigService } from './johnny5-config-service'

export const getTeamsChannelSubscriber = async (
  configService: Johnny5ConfigService,
  teamsIdKey: string,
  channelIdKey: string,
  events: (JobStatus | TaskStatus)[],
  logger: Logger,
): Promise<TeamsSubscriber | undefined> => {
  const teamsConfig = await configService.get(
    J5Config.teams.powerAutomateTeamsServiceUrl,
  )
  if (!teamsConfig) {
    await errorMissingJ5Config(
      logger,
      J5Config.teams.powerAutomateTeamsServiceUrl,
    )
    return undefined
  }

  const teamsId = await configService.get(teamsIdKey)
  if (!teamsId) {
    await errorMissingJ5Config(logger, teamsIdKey)
    return undefined
  }

  const channelId = await configService.get(channelIdKey)
  if (!channelId) {
    await errorMissingJ5Config(logger, channelIdKey)
    return undefined
  }

  return {
    teamsUrl: teamsConfig.value,
    teamsId: teamsId.value,
    channelId: channelId.value,
    events,
  }
}
