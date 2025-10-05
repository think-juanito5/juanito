import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import type {
  CcaMatterNameRefresh,
  Meta,
  TeamsSubscriber,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import {
  ccaMatterCreatedTeamsSubscribers,
  defaultTeamsSubscribers,
} from './teams-utils'

export const buildMeta = (nameRefreshParam: CcaMatterNameRefresh): Meta[] => {
  const meta: Meta[] = []
  if (nameRefreshParam.pipedriveFileNotesEnabled)
    meta.push({ key: 'pipedriveFileNotesEnabled', value: 'true' })
  if (nameRefreshParam.teamsNotifyEnabled)
    meta.push({ key: 'teamsNotifyEnabled', value: 'true' })
  if (nameRefreshParam.assignedToId)
    meta.push({
      key: 'assignedToParticipantId',
      value: nameRefreshParam.assignedToId,
    })

  return meta
}

export const getTeamsSubscribers = async (
  config: Johnny5ConfigService,
  logger: Logger,
): Promise<TeamsSubscriber[]> => {
  const base = await defaultTeamsSubscribers(config, logger)
  const extra = await ccaMatterCreatedTeamsSubscribers(config, logger)
  return [...base, ...extra]
}
