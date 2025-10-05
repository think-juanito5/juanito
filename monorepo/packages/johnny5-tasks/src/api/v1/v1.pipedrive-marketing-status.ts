import { getNumber } from '@dbc-tech/johnny5/utils'
import { serializeError } from 'serialize-error'
import { handlerStatus, taskHandler } from '../plugins/task-handler-plugin'

export const v1_pipedrive_marketing_status_archive = taskHandler({
  path: '/pipedrive-marketing-status-archive',
  handler: async ({ ctx }) => {
    const {
      logger,
      file: { pipedriveDealId },
      task: { meta },
    } = ctx

    if (!pipedriveDealId) {
      return handlerStatus.fail(
        `File does not have pipedriveDealId: ${pipedriveDealId}`,
      )
    }

    await logger.info(
      `Starting MarketingStatusArchive for File pipedriveDealId:${pipedriveDealId} debug notifications:`,
    )

    const pdServiceV2 = ctx.pipedriveV2()
    if (!pdServiceV2) {
      return handlerStatus.fail('Pipedrive service not available')
    }
    if (!meta) {
      return handlerStatus.fail('No meta provided')
    }
    const personId = getNumber(meta, 'personId')

    if (!personId) {
      return handlerStatus.fail('Person ID not found in task metadata')
    }

    try {
      await logger.info(
        `Updating marketing status for personId:${personId} to archived`,
      )
      await pdServiceV2.updatePerson(personId, {
        marketing_status: 'archived',
      })
    } catch (error) {
      await logger.warn(
        `Failed to update marketing status for personId:${personId}`,
        serializeError(error),
      )
      return handlerStatus.fail(
        `Failed to update marketing status for personId:${personId}`,
      )
    }
  },
})
