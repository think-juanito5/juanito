import { type Logger, NullLogger } from '@dbc-tech/logger'
import {
  type Action,
  type ActionParticipantPostMultiple,
} from './actionstep.schema'
import { ActionStepService } from './actionstep.service'
import type { MatterCreateBasics } from './interfaces'

export type MatterData = {
  name: string
  notes?: string
}

export class BTRActionStepService {
  private logger: Logger
  constructor(private actionstep: ActionStepService) {
    this.logger = NullLogger()
  }

  async createMatterFromTemplate(
    templateId: number,
    matterData: MatterData,
    trustAccounts: string[],
  ): Promise<number> {
    const templateAP = await this.actionstep.getActionParticipants({
      filter: `action = ${templateId}`,
      include: 'action',
    })
    if (!templateAP || !templateAP.linked?.actions)
      throw new Error(`file template: ${templateId} not found`)

    const action: Action = templateAP.linked.actions[0]
    const newMatterPostBody: MatterCreateBasics = {
      name: matterData.name,
      reference: action.reference!,
      matter_type_id: +action.links.actionType!,
      notes: matterData.notes,
    }
    const newMatter = await this.actionstep.createMatter(
      newMatterPostBody,
      trustAccounts,
    )

    const ap: ActionParticipantPostMultiple = {
      actionparticipants: templateAP.actionparticipants.map((ap) => {
        return {
          links: {
            action: `${newMatter}`,
            participant: ap.links.participant,
            participantType: ap.links.participantType,
          },
        }
      }),
    }
    await this.actionstep.linkMultipleActionParticipants(ap)

    return newMatter
  }
}
