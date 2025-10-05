import { type Logger } from '@dbc-tech/logger'
import { serializeError } from 'serialize-error'
import {
  type ActionPut,
  type PagedActionChangeStep,
  type SingleAction,
} from './actionstep.schema'
import { ActionStepService } from './actionstep.service'
import { localDateISO } from './utils'

const cancellationFieldConfig = [
  // want to move this to a UI/datastore
  {
    description: 'How many clients have completed LiveSign',
    data_collection_name: 'engage',
    data_field_name: 'LiveSign',
    default: '0',
  },
  {
    description: 'Why did the client cancel?',
    data_collection_name: 'DebtRecovery',
    data_field_name: 'CancellationReason',
    default: 'Client MIA',
  },
  {
    description: 'How much work was done?',
    data_collection_name: 'DebtRecovery',
    data_field_name: 'CancellationWork',
    default: 'No work was done',
  },
  {
    description: 'Date of Cancellation',
    data_collection_name: 'DebtRecovery',
    data_field_name: 'DateCancelled',
    default: localDateISO(),
  },
  {
    description: 'Was the matter cancelled?',
    data_collection_name: 'DebtRecovery',
    data_field_name: 'MatterCancelled',
    default: 'Yes',
  },
  {
    description: 'Settlement date',
    data_collection_name: 'keydates',
    data_field_name: 'smtdateonly',
    default: '',
  },
]

export class CCAActionStepService {
  constructor(
    private actionstep: ActionStepService,
    private logger: Logger,
  ) {}

  async closeCancelledMatter(actionId: number): Promise<PagedActionChangeStep> {
    const action = await this.actionstep.getAction(actionId, {
      include: 'step',
    })
    if (!action.linked?.steps) {
      throw new Error(`Action: ${actionId} not found`)
    }
    const currentStep = action.linked.steps[0]
    if (currentStep.stepName !== 'Cancellation') {
      throw new Error(`Matter:${actionId} is not in Cancellation step`)
    }
    await this.actionstep.deleteIncompleteTasks(actionId)
    const getChangeStep = await this.actionstep.getActionChangeStep(actionId)
    const archiveStep = getChangeStep.linked!.steps.find(
      (step) => step.stepName === 'Archived',
    )
    if (!archiveStep) {
      throw new Error(`Matter:${actionId} does not have an Archived step`)
    }
    const archiveStepChange = getChangeStep.actionchangestep.find(
      (acs) => acs.links.step === archiveStep.id,
    )
    if (!archiveStepChange) {
      throw new Error(
        `Matter:${actionId} does not have an Archived step change`,
      )
    }
    const postBody = {
      actionchangestep: {
        status: 'Closed',
        links: {
          action: actionId,
          step: archiveStep.id,
          node: archiveStepChange.links.node,
        },
      },
    }
    const postChangeStep = await this.actionstep.postActionChangeStep(postBody)
    if (!postChangeStep) {
      throw new Error(`Failed to move Matter:${actionId} to Archived step`)
    }
    return postChangeStep
  }

  async deactivateMatter(actionId: number): Promise<SingleAction> {
    const postBody: ActionPut = {
      actions: {
        status: 'Inactive',
      },
    }
    const result = await this.actionstep.updateAction(actionId, postBody)
    if (!result) {
      throw new Error(`Failed to deactivate Matter:${actionId}`)
    }
    return result
  }

  async closeMatter(actionId: number): Promise<SingleAction> {
    const action = await this.actionstep.getAction(actionId, {
      include: 'step',
    })
    if (!action.linked?.steps) {
      throw new Error(`Action: ${actionId} not found`)
    }
    const currentStep = action.linked.steps[0]
    this.logger.debug(`Matter ${actionId} is in step ${currentStep}`)
    if (currentStep.stepName === 'Archived') {
      this.logger.info(`Matter:${actionId} is already closed`)
      return action
    }
    if (currentStep.stepName !== 'Cancellation') {
      await this.logger.info(`Moving Matter:${actionId} into cancelled step`)
      try {
        await this.cancelMatter(actionId)
      } catch (e) {
        const json = serializeError(e)
        await this.logger.error(`Error cancelling matter: ${actionId}`, json)
        throw new Error('Error cancelling matter', json)
      }
    }
    await this.logger.info(`Moving Matter:${actionId} into archived step`)
    try {
      await this.closeCancelledMatter(actionId)
    } catch (e) {
      const json = serializeError(e)
      await this.logger.error(`Error closing matter: ${actionId}`, json)
      throw new Error('Error closing matter', json)
    }

    const out = await this.actionstep.getAction(actionId, {
      include: 'step',
    })
    return out
  }

  async cancelMatter(actionId: number): Promise<PagedActionChangeStep> {
    // get the matter record so we can check what step it is currently in
    const action = await this.actionstep.getAction(actionId, {
      include: 'step',
    })
    if (!action.linked?.steps) {
      throw new Error(`Action: ${actionId} not found`)
    }
    // make sure the matter is not already cancelled or archived step
    const currentStep = action.linked.steps[0]
    if (currentStep.stepName! in ['Cancellation', 'Archived']) {
      throw new Error(`Matter:${actionId} is already cancelled or archived`)
    }

    await this.actionstep.deleteIncompleteTasks(actionId)

    // update all the required step change data fields prior to step change
    // using normal method to avoid magic numbers in step change post body
    for (const dfv of cancellationFieldConfig) {
      await this.logger.info('processing', dfv)
      try {
        await this.actionstep.updateDataCollectionRecordValuev2(
          actionId,
          dfv.data_collection_name,
          dfv.data_field_name,
          dfv.default,
        )
      } catch (e) {
        await this.logger.error(
          `Error updating data field ${dfv.data_field_name} for action ${actionId}`,
          e,
        )
      }
    }

    const changeStepData = await this.actionstep.getActionChangeStep(actionId)
    const cancellationStep = changeStepData.linked!.steps.find(
      (step) => step.stepName === 'Cancellation',
    )
    if (!cancellationStep) {
      throw new Error('Cancellation step not found')
    }
    const cancellationStepChange = changeStepData.actionchangestep.find(
      (acs) => acs.links.step === cancellationStep.id,
    )
    if (!cancellationStepChange) {
      throw new Error('Cancellation step change not found')
    }

    const postBody = {
      actionchangestep: {
        links: {
          action: actionId,
          node: cancellationStepChange.links.node,
          step: cancellationStep.id,
        },
      },
    }

    const response = await this.actionstep.postActionChangeStep(postBody)
    if (!response) {
      throw new Error(`Failed to move matter ${actionId} to cancellation step`)
    }

    return response
  }

  async reactivateMatter(actionId: number): Promise<SingleAction> {
    const postBody: ActionPut = {
      actions: {
        status: 'Active',
      },
    }
    const response = await this.actionstep.updateAction(actionId, postBody)
    if (!response) {
      throw new Error(`Failed to reactivate matter ${actionId}`)
    }
    return response
  }
}
