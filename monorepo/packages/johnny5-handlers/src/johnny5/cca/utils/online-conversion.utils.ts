import {
  type ActionChangeStep,
  type LinkedStepDataFieldsSchema,
  type PagedActionChangeStep,
} from '@dbc-tech/actionstep'
import { AllowedOnlineConversionStates } from '@dbc-tech/cca-common'
import type { AustralianState } from '@dbc-tech/johnny5/typebox'
import type { Intent } from '@dbc-tech/johnny5/utils'
import { type Logger } from '@dbc-tech/logger'
import {
  type V2DealCustomFields,
  customFields,
  pipedriveCampaignTrigger,
} from '@dbc-tech/pipedrive'
import { type OnlineConversionType, OnlineConversionTypes } from '../constants'

export type GetPropertyDFIdsResult = {
  natureId: number | undefined
  propTypeId: number | undefined
}

export type NewParticipant = {
  type_id: number
  value: number
}

export type Links = {
  action: string | number
  node: string | number
  step: string
  stepMessages: string[]
  stepTasks: number[]
}

export type EmcActionChangeStep = {
  assignedToParticipant: number
  links: Links
  [key: `stepDataField${number}`]: string | number | undefined //stepDataField (stepDataField1, stepDataField2...)
}

export type ChangeStepParam = {
  actionchangestep: EmcActionChangeStep
}

export const getPropertyDFIds = (
  stepDFArr: LinkedStepDataFieldsSchema[],
  stepDFs: number[],
): GetPropertyDFIdsResult => {
  const xproperty = stepDFArr.filter(
    (item) => item.groupLabel === 'Property Details',
  )

  const getFieldId = (fieldLabel: string) => {
    const res = xproperty
      .map((item) => {
        return {
          fieldLabel: item.fieldLabel,
          id: item.id,
        }
      })
      .find(
        (item) => item.fieldLabel === fieldLabel && stepDFs.includes(item.id),
      )?.id
    return res
  }

  const natureId = getFieldId('Nature of Property')
  const propTypeId = getFieldId('Property Type')

  return {
    natureId,
    propTypeId,
  }
}

export type OnlineConvParam = {
  matterId: number
  natureProperty: string | undefined
  changestepAssignedId: number
}

export const buildOnlineConversionData = async (
  res: PagedActionChangeStep,
  logger: Logger,
  ocParam: OnlineConvParam,
): Promise<ChangeStepParam> => {
  const appEnv = process.env.APP_ENV!

  await logger.info(
    `onlineConversionProcess(+) #Action matterId: ${ocParam.matterId} Change Step Node Id =>`,
    res.actionchangestep?.[0].id,
  )

  const {
    linked: {
      steps: stepsArr = [],
      nodes: nodesArr = [],
      stepdatafields: stepDataFieldsArr = [],
    } = {},
    actionchangestep = [] as ActionChangeStep[],
  } = res || {}

  const contractStep = stepsArr.find(
    (item) => item.stepName === 'Contract Drafting',
  )

  if (!contractStep) {
    throw new Error('Contract Step is empty for matterId: ' + ocParam.matterId)
  }

  await logger.debug(
    `onlineConversionProcess(*) #Contract Step =>`,
    JSON.stringify(contractStep),
  )

  const {
    stepNumber,
    links: { actionType },
  } = contractStep

  const contractNode = nodesArr.find(
    (item) => item.stepNumber === Number(stepNumber),
  )
  if (!contractNode) {
    throw new Error('Contract Node is empty for matterId: ' + ocParam.matterId)
  }

  await logger.debug(
    `onlineConversionProcess(*) contractStep.Contract Node =>`,
    JSON.stringify(contractNode),
  )

  const nodeId = contractNode.id
  const stepTo = actionchangestep.find(
    (item) => parseInt(item.links.node) === nodeId,
  )

  if (!stepTo) {
    throw new Error('StepTo is empty for matterId: ' + ocParam.matterId)
  }

  let myStepMessages: string[] = []
  let myStepTasks: number[] = []
  let myNatureId: number | undefined

  await logger.debug(
    `onlineConversionProcess(*) contractNode.Step To =>`,
    JSON.stringify(stepTo),
  )

  const {
    stepMessages = [],
    stepTasks = [],
    stepDataFields = [],
  } = stepTo.links || {}

  //StepMessages is supported in prod environment only
  const isProd = ['prod'].includes(appEnv)
  if (isProd) {
    myStepMessages = (stepMessages || []).map((item) => item.split('--')[2])
  }

  const filterEmpty = <T extends number>(array: (T | undefined)[]): T[] => {
    return array.filter((item): item is T => item !== undefined)
  }

  myStepTasks = filterEmpty(stepTasks)
  const srcStepDataFieldsArr = (stepDataFields || []).map((field) =>
    parseInt(field, 10),
  )

  await logger.debug(
    `onlineConversionProcess(*) #Source StepDataFieldsArr =>`,
    JSON.stringify(srcStepDataFieldsArr),
  )

  const { natureId } = getPropertyDFIds(stepDataFieldsArr, srcStepDataFieldsArr)
  myNatureId = natureId
  // myPropTypeId = propTypeId
  await logger.info(`onlineConversionProcess(*) #getPropertyDFIds: #natureId`, {
    myNatureId,
    natureProperty: ocParam.natureProperty,
  })

  const changeStepParam: ChangeStepParam = {
    actionchangestep: {
      assignedToParticipant: ocParam.changestepAssignedId,
      links: {
        action: `${ocParam.matterId}`,
        node: `${nodeId}`,
        step: `${actionType}--${stepNumber}`,
        stepMessages: myStepMessages,
        stepTasks: myStepTasks,
      },
    },
  }

  if (myNatureId && ocParam.natureProperty) {
    changeStepParam.actionchangestep[`stepDataField${myNatureId}`] =
      ocParam.natureProperty
  }

  await logger.info(
    `onlineConversionProcess(*) @matterId:${ocParam.matterId} #Debug changeStepParam =>`,
    JSON.stringify(changeStepParam),
  )
  return changeStepParam
}

export type OnlineConversionParam = {
  intent: Intent
  state: AustralianState
}

export const getOnlineConversionType = (
  state: AustralianState,
  leadJourney?: string,
  campaignTriggerId?: string,
): OnlineConversionType | undefined => {
  const isOnlineConversion = (val: string | undefined) => {
    if (!val) return false
    return val.toLowerCase().startsWith('online conversion')
  }

  if (!isOnlineConversion(leadJourney)) return undefined

  if (leadJourney?.toLowerCase() === 'online conversion') {
    return OnlineConversionTypes.leadJourney
  }

  if (campaignTriggerId && AllowedOnlineConversionStates.includes(state)) {
    const trigger = pipedriveCampaignTrigger[+campaignTriggerId]

    switch (trigger) {
      case 'RACV':
        return OnlineConversionTypes.racv
      case 'Wavie':
        return OnlineConversionTypes.wavie
    }
  }
  return undefined
}

export const checkOnlineConversion = async (
  ocp: OnlineConversionParam,
  cf: V2DealCustomFields['custom_fields'],
): Promise<OnlineConversionType | undefined> => {
  if (ocp.intent !== 'sell') return undefined

  const leadJourney = cf?.[customFields.leadJourney] as string | undefined
  const campaignTriggerId = cf?.[customFields.campaignTrigger] as
    | string
    | undefined
  return getOnlineConversionType(ocp.state, leadJourney, campaignTriggerId)
}
