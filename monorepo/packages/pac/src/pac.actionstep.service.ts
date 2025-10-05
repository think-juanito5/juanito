import {
  type ActionParticipant,
  type ActionParticipantPostConstructor,
  type ActionParticipantPostMultiple,
  ActionStepService,
  type PagedActionParticipants,
} from '@dbc-tech/actionstep'
import { type Logger } from '@dbc-tech/logger'
import type { MergeActionParticipants } from './schema'
import { ExcludeKey } from './utils/object-utils'

export class PACActionStepService {
  constructor(
    private actionstep: ActionStepService,
    private logger: Logger,
  ) {}

  async mergeActionParticipants(
    body: MergeActionParticipants,
  ): Promise<PagedActionParticipants> {
    // want to do chunking on lots of 50
    const out: ActionParticipant[] = []
    let recordCount: number = 0
    const chunkSize = 50
    const chunks: MergeActionParticipants[] = []
    for (let i = 0; i < body.length; i += chunkSize) {
      chunks.push(body.slice(i, i + chunkSize))
    }

    for (const chunk of chunks) {
      const postInner: ActionParticipantPostConstructor[] = []
      const getInner: number[] = []
      const deleteInner: string[] = []
      const newParty = chunk[0].participant
      const participantType = chunk[0].participantType
      chunk.forEach((inner) => {
        deleteInner.push(
          `${inner.action}--${inner.participantType}--${inner.oldParty}`,
        )
        getInner.push(+inner.action)
        postInner.push({
          links: ExcludeKey(inner, 'oldParty'),
        })
      })
      await this.logger.debug(`\n\npostInner before: ${postInner.length}\n`)
      const getResult = await this.actionstep.getActionParticipants({
        filter: `action in (${getInner.join(',')}) AND participantType=${participantType} AND participant=${newParty}`,
      })
      const data = getResult.actionparticipants
      // loop through postInner backwards, if it exists in getResult, remove it from postInner
      await this.logger.debug(
        `getResult: ${data.length}\n${JSON.stringify(data)}`,
      )
      for (let i = postInner.length - 1; i >= 0; i--) {
        const inner = postInner[i]
        const index = data.findIndex(
          (ap) =>
            inner.links.action === ap.links.action &&
            inner.links.participantType === ap.links.participantType &&
            inner.links.participant === ap.links.participant,
        )
        if (index !== -1) {
          postInner.splice(index, 1)
        }
      }

      await this.logger.debug(`postInner after: ${postInner.length}\n`)

      if (postInner.length > 0) {
        const postBody: ActionParticipantPostMultiple = {
          actionparticipants: postInner,
        }
        const postResult =
          await this.actionstep.createActionParticipants(postBody)
        const data = postResult.actionparticipants
        out.push(...data)
        recordCount =
          postResult.meta?.paging.actionparticipants.recordCount || 0
      }
      await this.logger.debug(`\n\ndeleteInner: ${deleteInner.join(',')}\n\n`)
      await this.actionstep.deleteActionParticipant(deleteInner.join(','))
    }

    return {
      links: {},
      actionparticipants: out,
      meta: {
        paging: {
          actionparticipants: {
            recordCount: recordCount,
            pageCount: 1,
            page: 1,
            pageSize: recordCount,
          },
        },
      },
    }
  }
}
