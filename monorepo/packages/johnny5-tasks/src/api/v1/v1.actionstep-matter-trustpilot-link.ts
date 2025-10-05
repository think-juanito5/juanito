import { type PagedActionParticipants } from '@dbc-tech/actionstep'
import { TrustPilotLinkManager } from '@dbc-tech/cca-common'
import { TaskModel } from '@dbc-tech/johnny5-mongodb'
import { J5Config } from '@dbc-tech/johnny5/constants'
import type { Meta, TPLinkParams } from '@dbc-tech/johnny5/typebox'
import { getString } from '@dbc-tech/johnny5/utils'
import { handlerStatus, taskHandler } from '../plugins/task-handler-plugin'

export const v1_actionstep_matter_trustpilot_link = taskHandler({
  path: '/actionstep-matter-trustpilot-link',
  handler: async ({ ctx }) => {
    const {
      logger,
      file: { actionStepMatterId },
      task: { id: taskId, meta },
      johnny5Config: j5config,
    } = ctx

    if (!actionStepMatterId) {
      return handlerStatus.fail(
        `File does not have matterId: ${actionStepMatterId}`,
      )
    }

    const paramParticipantId = meta
      ? getString(meta, 'personId', false)
      : undefined
    await logger.info(
      `Starting MatterTrustpilotLink for File matterId:${actionStepMatterId} #debug ${paramParticipantId ? `with participantId:${paramParticipantId}` : 'without participantId'}`,
    )

    const clientTypeId = await j5config.get(J5Config.actionstep.clientTypeId)
    if (!clientTypeId) {
      const msg = `ClientTypeId not found in J5 Config, skipping this task!`
      await logger.warn(msg)
      return handlerStatus.fail(msg)
    }

    const as = ctx.actionstep()
    const actionParticipantsResult = await as.getActionParticipants({
      filter: `action = ${actionStepMatterId}`,
      include: 'action',
    })

    if (
      !actionParticipantsResult ||
      !actionParticipantsResult.linked?.actions
    ) {
      const msg = `Action Participants for matterId: ${actionStepMatterId} not found!`
      await logger.error(msg)
      return handlerStatus.fail(msg)
    }

    if (actionParticipantsResult.linked?.actions[0].status !== 'Active') {
      const msg = `Action for matterId: ${actionStepMatterId} is not Active, it is: ${actionParticipantsResult.linked?.actions[0].status}`
      await logger.warn(msg)
      return handlerStatus.ignore(msg)
    }

    const getClientParticipantId = (
      actionResponse: PagedActionParticipants,
      clientTypeId: number,
    ): number | undefined => {
      const participants = actionResponse.actionparticipants

      const client = participants.find(
        (p) => +p.links.participantType === clientTypeId,
      )
      if (!client) {
        return undefined
      }
      return +client?.links.participant
    }

    const clientParticipantId = getClientParticipantId(
      actionParticipantsResult,
      +clientTypeId.value,
    )
    if (!clientParticipantId) {
      const msg = `Client participant not found for MatterId:${actionStepMatterId} in Actionstep`
      await logger.warn(msg)
      return handlerStatus.ignore(msg)
    }

    if (paramParticipantId && clientParticipantId !== +paramParticipantId) {
      const msg = `Client participant Id:${clientParticipantId} does not match the provided participantId:${paramParticipantId} for MatterId:${actionStepMatterId}`
      await logger.warn(msg)
      return handlerStatus.ignore(msg)
    }

    const clientResponse = await as.getParticipant(clientParticipantId)
    if (!clientResponse) {
      return handlerStatus.fail(`Client Id:${clientParticipantId} not found`)
    }
    const { isCompany, companyName, firstName, lastName, email, middleName } =
      clientResponse.participants

    await logger.info(
      `MatterId:${actionStepMatterId} Client Id:${clientParticipantId} Trustpilot client details: `,
      {
        firstName,
        lastName,
        middleName,
        companyName,
        isCompany,
        email,
        phone: clientResponse.participants.phone1Number,
        phoneType: clientResponse.participants.phone1Label,
      },
    )

    const tpLink = ctx
      .trustpilot()
      .setPayload({
        email: email ?? '',
        name:
          isCompany === 'T'
            ? companyName!
            : [firstName, middleName, lastName].filter(Boolean).join(' '),
        ref: String(actionStepMatterId),
      })
      .generateLink()

    await logger.info(
      `MatterId:${actionStepMatterId} Trustpilot Link: ${tpLink}`,
    )
    await as.updateDataCollectionRecordValuev2(
      actionStepMatterId,
      'DebtRecovery',
      'trustpilotencryptpayl',
      tpLink,
    )

    const xmeta: Meta[] = (meta ?? []).filter(
      (m) => !['clientParticipantId'].includes(m.key),
    )

    xmeta.push({
      key: 'clientParticipantId',
      value: String(clientParticipantId),
    })
    await TaskModel.updateOne({ _id: taskId }, { $set: { meta: xmeta } })

    await logger.info(
      `MatterId:${actionStepMatterId} #Trustpilot link created!`,
    )

    const tplink: TPLinkParams = {
      matterId: String(actionStepMatterId),
      client: {
        id: String(clientParticipantId),
        name:
          isCompany === 'T'
            ? companyName!
            : [firstName, middleName, lastName].filter(Boolean).join(' '),
        email: email ?? '',
      },
    }
    const linkMgr = new TrustPilotLinkManager(logger)
    await linkMgr.storeLink(clientParticipantId, actionStepMatterId, tplink)
    await logger.info(
      `MatterId:${actionStepMatterId} #Trustpilot link cached for clientParticipantId:${clientParticipantId}`,
    )

    await linkMgr.createSymlinkForMatter(
      actionStepMatterId,
      `${clientParticipantId}`,
    )
    await logger.info(
      `MatterId:${actionStepMatterId} #Trustpilot symlink created for clientId:${clientParticipantId}`,
    )
  },
})
