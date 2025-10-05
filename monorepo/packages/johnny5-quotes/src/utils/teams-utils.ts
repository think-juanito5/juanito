import { getTeamsChannelSubscriber } from '@dbc-tech/johnny5-mongodb'
import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { J5Config } from '@dbc-tech/johnny5/constants'
import type { TeamsSubscriber } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'

export const defaultTeamsSubscribers = async (
  configService: Johnny5ConfigService,
  logger: Logger,
): Promise<TeamsSubscriber[]> => {
  const subscribers: TeamsSubscriber[] = []
  const errorProcessingSubscriber = await getTeamsChannelSubscriber(
    configService,
    J5Config.teams.undeliveredMessages.teamsId,
    J5Config.teams.undeliveredMessages.channelId,
    ['error-processing'],
    logger,
  )
  if (errorProcessingSubscriber) {
    subscribers.push(errorProcessingSubscriber)
  }
  return subscribers
}

export const ccaMatterCreatedTeamsSubscribers = async (
  configService: Johnny5ConfigService,
  logger: Logger,
): Promise<TeamsSubscriber[]> => {
  const subscribers: TeamsSubscriber[] = []
  const matterCreatedSubscriber = await getTeamsChannelSubscriber(
    configService,
    J5Config.cca.teams.matterCreatedMessages.teamsId,
    J5Config.cca.teams.matterCreatedMessages.channelId,
    ['completed'],
    logger,
  )
  if (matterCreatedSubscriber) {
    subscribers.push(matterCreatedSubscriber)
  }
  return subscribers
}

export const btrContractDropHitlWaitingSubscribers = async (
  configService: Johnny5ConfigService,
  logger: Logger,
): Promise<TeamsSubscriber[]> => {
  const subscribers: TeamsSubscriber[] = []
  const contractDropHitlWaitingSubscriber = await getTeamsChannelSubscriber(
    configService,
    J5Config.btr.teams.contractDropHitlWaitingMessages.teamsId,
    J5Config.btr.teams.contractDropHitlWaitingMessages.channelId,
    ['hitl-waiting'],
    logger,
  )
  if (contractDropHitlWaitingSubscriber) {
    subscribers.push(contractDropHitlWaitingSubscriber)
  }
  return subscribers
}
