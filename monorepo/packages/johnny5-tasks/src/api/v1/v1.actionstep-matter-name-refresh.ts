import type {
  SingleAction,
  StepNameType,
} from '@dbc-tech/actionstep/actionstep.enhanced.schema'
import { type AdditionalInfoTypes } from '@dbc-tech/cca-common/utils/matter-name-builder'
import { TaskModel } from '@dbc-tech/johnny5-mongodb'
import type { AustralianState } from '@dbc-tech/johnny5/typebox'
import { type Intent } from '@dbc-tech/johnny5/utils'
import {
  getCurrentStepTarget,
  getMatterName,
  getNewTargetParticipantIds,
  getParticipantIds,
  getParticipantTypeIds,
  refreshMatterNotifyChannels,
  replaceMatterParticipant,
} from '../../utils/refresh-name-utils'
import { handlerStatus, taskHandler } from '../plugins/task-handler-plugin'

export const v1_actionstep_matter_name_refresh = taskHandler({
  path: '/actionstep-matter-name-refresh',
  handler: async ({ ctx }) => {
    const {
      logger,
      file: { actionStepMatterId },
      task: { meta },
      johnny5Config,
    } = ctx

    if (!actionStepMatterId) {
      return handlerStatus.fail(
        `File does not have matterId: ${actionStepMatterId}`,
      )
    }
    if (!meta) {
      return handlerStatus.fail('No meta provided')
    }

    const pdFileNotesEnabled = meta.find(
      (m) => m.key === 'pipedriveFileNotesEnabled',
    )?.value
    const teamsNotifyEnabled = meta.find(
      (m) => m.key === 'teamsNotifyEnabled',
    )?.value

    const prevStepName = meta.find((m) => m.key === 'stepName')?.value as
      | StepNameType
      | undefined
    await logger.info(
      `Starting MatterNameRefresh for File matterId:${actionStepMatterId} debug notifications:`,
      { pdFileNotesEnabled, teamsNotifyEnabled, prevStepName },
    )

    const participantTypesIds = await getParticipantTypeIds(johnny5Config)
    if (!participantTypesIds.client) {
      await logger.warn(
        `participantClientTypeId not found in J5 Config, skipping this task!`,
      )
      return handlerStatus.fail(
        'participantClientTypeId not found in J5 Config',
      )
    }

    const as = ctx.actionstep()
    const action = (await as.getAction(actionStepMatterId, {
      include: 'step',
    })) as SingleAction
    if (!action.actions.id) {
      return handlerStatus.fail(
        `MatterId: ${actionStepMatterId} not found in ActionStep!`,
      )
    }

    const matterTypeId = action.actions.links.actionType
    if (!matterTypeId) {
      return handlerStatus.fail(
        `ActionTypeId not found for MatterId: ${actionStepMatterId}`,
      )
    }

    const state = ccaMatterTypeStates[+matterTypeId]
    if (!action.linked?.steps?.[0]?.stepName) {
      return handlerStatus.fail(
        `MatterId:${actionStepMatterId} does not have a stepName in the first linked step`,
      )
    }

    const currentStepName = action.linked.steps[0].stepName
    await logger.info(
      `MatterId:${actionStepMatterId} current name: ${action.actions.name} current step: ${currentStepName} state: ${state} `,
    )

    const assignedToId = action.actions.links.assignedTo
    if (!assignedToId) {
      const errMsg = `MatterId:${actionStepMatterId} does not have an assignedToId`
      await logger.warn(errMsg)

      return handlerStatus.fail(errMsg)
    }
    const assignedToResponse = await as.getParticipant(+assignedToId)
    if (!assignedToResponse) {
      return handlerStatus.fail(`AssignedTo Id:${assignedToId} not found`)
    }
    const { firstName: AssignedToFirstname, lastName: AssignedToLastname } =
      assignedToResponse.participants
    await logger.info(
      `MatterId:${actionStepMatterId} AssignedTo Id:${assignedToId} assignedTo details: `,
      {
        AssignedToFirstname,
        AssignedToLastname,
      },
    )

    const actionParticipantsResult = await as.getActionParticipants({
      filter: `action = ${actionStepMatterId}`,
      include: 'action',
    })

    if (!actionParticipantsResult || !actionParticipantsResult.linked?.actions)
      return handlerStatus.fail(
        `Matter Participants for matterId: ${actionStepMatterId} not found!`,
      )

    const currentMatterParticipantIds = getParticipantIds(
      actionParticipantsResult,
      participantTypesIds,
    )
    await logger.info(
      `MatterId:${actionStepMatterId} participantIds: `,
      currentMatterParticipantIds,
    )

    if (!currentMatterParticipantIds.client) {
      await logger.warn(
        `MatterId:${actionStepMatterId} does not have a Client or Conveyancer in ActionStep`,
      )
      return handlerStatus.ignore()
    }

    const clientResponse = await as.getParticipant(
      currentMatterParticipantIds.client,
    )
    if (!clientResponse) {
      return handlerStatus.fail(
        `Client Id:${currentMatterParticipantIds.client} not found`,
      )
    }
    const { isCompany, companyName, firstName, lastName } =
      clientResponse.participants
    await logger.info(
      `MatterId:${actionStepMatterId} Client Id:${currentMatterParticipantIds.client} client details: `,
      {
        firstName,
        lastName,
      },
    )
    const intent = await as.getIntent(actionStepMatterId)
    if (!intent) {
      await logger.warn(
        `MatterId:${actionStepMatterId} does not have an intent`,
      )
      return handlerStatus.ignore()
    }

    const assignedTo = {
      firstName: AssignedToFirstname!,
      lastName: AssignedToLastname!,
    }

    const additionalInfoResult = await as.getFirstDataCollectionRecordValue(
      actionStepMatterId,
      'engage',
      'AdditionalInfo',
    )
    const additionalInfo = additionalInfoResult?.datacollectionrecordvalues
      .stringValue as AdditionalInfoTypes | undefined
    await logger.info(
      `MatterId:${actionStepMatterId} additionalInfo value: ${additionalInfo} `,
    )

    const matterName = await getMatterName({
      matterId: actionStepMatterId,
      stepName: {
        current: currentStepName,
        previous: prevStepName,
      },
      assignedTo,
      client: {
        isCompany: isCompany === 'T' ? true : false,
        lastName,
        companyName,
        firstName,
      },
      state,
      intent: intent as Intent,
      additionalInfo,
    })

    await logger.info(`MatterId:${actionStepMatterId} new name: ${matterName} `)

    const result = await as.updateAction(actionStepMatterId, {
      actions: {
        name: matterName,
      },
    })

    if (!result.actions.id) {
      await logger.warn(
        `MatterId:${actionStepMatterId} #Failed updating Matter name!`,
      )
      return handlerStatus.fail('Failed to update Matter name!')
    }

    await refreshMatterNotifyChannels(ctx.pipedriveV1(), logger, {
      matterId: actionStepMatterId,
      matterName,
      pdFileNotesEnabled: pdFileNotesEnabled === 'true',
      assignedTo,
    })

    const xmeta = (meta ?? []).filter((m) => !['stepName'].includes(m.key))
    xmeta.push({ key: 'stepName', value: currentStepName })
    await TaskModel.updateOne({ _id: ctx.task.id }, { $set: { meta: xmeta } })

    await logger.info(
      `MatterId:${actionStepMatterId} #Matter Name Updated to AS and updated to J5-MatterCreateModel!`,
      {
        matterId: result.actions.id,
        matterName: result.actions.name,
      },
    )

    const newTargetIds = await getNewTargetParticipantIds(johnny5Config)
    await logger.info(
      `MatterId:${actionStepMatterId} newTargetIds: `,
      newTargetIds,
    )

    const { isSdsToContractDrafting } = getCurrentStepTarget(
      currentStepName,
      prevStepName,
    )

    await logger.info(
      `*Updating Participants #MatterId:${actionStepMatterId} isSdsToContractDrafting: ${isSdsToContractDrafting}`,
    )

    if (isSdsToContractDrafting) {
      await replaceMatterParticipant(as, logger, {
        actionStepMatterId,
        participantTypeId: participantTypesIds.assignedLawyer,
        oldParticipantId: currentMatterParticipantIds.assignedLawyer,
        newParticipantId: newTargetIds.assignedLawyer,
      })

      await replaceMatterParticipant(as, logger, {
        actionStepMatterId,
        participantTypeId: participantTypesIds.adminStaff,
        oldParticipantId: currentMatterParticipantIds.adminStaff,
        newParticipantId: newTargetIds.adminStaff,
      })
    }
  },
})

const ccaMatterTypeStates: { [key: number]: AustralianState } = {
  67: 'QLD',
  68: 'NSW',
  69: 'VIC',
  70: 'SA',
  71: 'TAS',
  72: 'WA',
}
