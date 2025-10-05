import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { J5Config } from '@dbc-tech/johnny5/constants'
import type { EmailSubscriber } from '@dbc-tech/johnny5/typebox'

export const defaultEmailSubscribers = async (
  configService: Johnny5ConfigService,
): Promise<EmailSubscriber[]> => {
  const emailConfig = await configService.get(
    J5Config.email.defaultEmailSubscriber,
  )
  if (!emailConfig) {
    return []
  }

  return [
    {
      email: emailConfig.value,
      name: emailConfig.value,
      events: ['error-processing'],
    },
  ]
}
