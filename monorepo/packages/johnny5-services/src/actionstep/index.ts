import type { ActionCreatePost, ActionStepService } from '@dbc-tech/actionstep'
import { J5Config, type MatterCreateBasics } from '@dbc-tech/johnny5'
import { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { serializeError } from 'serialize-error'

export const createMatter = async (
  actionstep: ActionStepService,
  j5config: Johnny5ConfigService,
  payload: MatterCreateBasics,
) => {
  const trustAccount = await j5config.get(J5Config.actionstep.trustAccount)
  if (!trustAccount) {
    throw new Error('Failed to get trust account from Johnny5 Config!')
  }

  const param: ActionCreatePost = {
    actioncreate: {
      actionName: payload.name,
      links: {
        actionType: payload.matter_type_id,
        trustAccounts: [trustAccount.value],
      },
    },
  }

  param.actioncreate.fileReference = payload.reference || undefined
  param.actioncreate.fileNote = payload.notes || undefined

  try {
    const matterResponse = await actionstep.createAction(param)
    if (!matterResponse.actioncreate.id) {
      throw new Error('Failed to create Action, no action id returned!')
    }
    return matterResponse.actioncreate.id // Matter Id
  } catch (error) {
    const errMsg = serializeError(error)
    throw new Error('Failed to create Action. Error: ' + errMsg)
  }
}
