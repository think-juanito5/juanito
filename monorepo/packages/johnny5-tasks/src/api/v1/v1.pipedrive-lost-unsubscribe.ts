import { datalakeQuery } from '@dbc-tech/datalake'
import { dbTimestampMelbourne, getNumber } from '@dbc-tech/johnny5/utils'
import { customFields, yesNoOptionsEnableMarketing } from '@dbc-tech/pipedrive'
import { pgPoolDatalake } from '../plugins/db.datalake.plugin'
import { handlerStatus, taskHandler } from '../plugins/task-handler-plugin'

export const v1_pipedrive_lost_unsubscribe = taskHandler({
  path: '/pipedrive-lost-unsubscribe',
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
      `Starting DealLostUnsubscribe for File pipedriveDealId:${pipedriveDealId} debug notifications:`,
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

    await logger.info(
      `Updating enable marketing for dealId:${pipedriveDealId} to No, marketing status to unsubscribed for personId:${personId}`,
    )

    const enableMarketingNoKey =
      Object.entries(yesNoOptionsEnableMarketing).find(
        ([, v]) => v === 'No',
      )?.[0] || '184'

    const pipeDriveUpdate = {
      custom_fields: {
        [customFields.enableMarketing]: +enableMarketingNoKey, // enable marketing
      },
    }
    await pdServiceV2.updateDeal(pipedriveDealId, pipeDriveUpdate)

    await pdServiceV2.updatePerson(personId, {
      marketing_status: 'unsubscribed',
    })

    await logger.info(
      `Updating UserSubscription for dealId:${pipedriveDealId}, personId:${personId}`,
    )

    const clientDL = await pgPoolDatalake.connect()
    if (!clientDL) {
      return handlerStatus.fail('Datalake client not available')
    }
    const dlQuery = datalakeQuery(clientDL)

    const userIdentity = await dlQuery.userIdentity.findByCrmPersonID(personId)

    if (!userIdentity || userIdentity.length === 0 || !userIdentity[0].userId) {
      await logger.warn(
        `UserIdentity for personId:${personId} not found, skipping UserSubscription update`,
      )
      return handlerStatus.ignore(
        `UserIdentity for personId:${personId} not found`,
      )
    }

    const userId = userIdentity[0].userId
    await dlQuery.userSubscription.update(userId, {
      emailUnsubscribed: dbTimestampMelbourne(),
      smsUnsubscribed: dbTimestampMelbourne(),
      phoneUnsubscribed: dbTimestampMelbourne(),
    })
  },
})
