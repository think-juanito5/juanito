import { StepNameValues } from '@dbc-tech/actionstep'
import type {
  ActionChangeStep,
  PagedActionChangeStep,
} from '@dbc-tech/actionstep/actionstep.enhanced.schema'
import type { Logger } from '@dbc-tech/logger'

export type Links = {
  action: string | number
  node: string | number
  step: string
  stepMessages: string[]
  stepTasks: number[]
}

export type SDSActionChangeStep = {
  assignedToParticipant: number
  links: Links
  [key: `stepDataField${number}`]: string | number | undefined
}

export type ChangeStepParam = {
  actionchangestep: SDSActionChangeStep
}

export const prepareStepchangeToSds = async (
  res: PagedActionChangeStep,
  logger: Logger,
  matterId: number,
  changestepAssignedId: number,
): Promise<ChangeStepParam> => {
  const appEnv = process.env.APP_ENV!

  await logger.info(
    `prepareStepchangeToSds(+) #Action matterId: ${matterId} Change Step Node Id =>`,
    res.actionchangestep?.[0].id,
  )

  const {
    linked: { steps: stepsArr = [], nodes: nodesArr = [] } = {},
    actionchangestep = [] as ActionChangeStep[],
  } = res || {}

  const sdsStep = stepsArr.find(
    (item) => item.stepName === StepNameValues.SellerDisclosureStatement,
  )

  if (!sdsStep) {
    throw new Error('Seller Disclosure Step is empty for matterId: ' + matterId)
  }

  await logger.debug(
    `prepareStepchangeToSds(*) #Seller Disclosure Step =>`,
    JSON.stringify(sdsStep),
  )

  const {
    stepNumber,
    links: { actionType },
  } = sdsStep

  const sdsNode = nodesArr.find(
    (item) => item.stepNumber === Number(stepNumber),
  )
  if (!sdsNode) {
    throw new Error('SDS Node is empty for matterId: ' + matterId)
  }

  await logger.debug(
    `prepareStepchangeToSds(*) SDS-Step.Node =>`,
    JSON.stringify(sdsNode),
  )

  const nodeId = sdsNode.id
  const stepTo = actionchangestep.find(
    (item) => parseInt(item.links.node) === nodeId,
  )

  if (!stepTo) {
    throw new Error('SDS StepTo is empty for matterId: ' + matterId)
  }
  let myStepTasks: number[] = []
  await logger.debug(
    `prepareStepchangeToSds(*) SDSNode.Step To =>`,
    JSON.stringify(stepTo),
  )

  const { stepMessages = [], stepTasks = [] } = stepTo.links || {}

  //StepMessages is supported in prod environment only
  const isProd = ['prod'].includes(appEnv)
  const sdsStepMessages: string[] = isProd
    ? (stepMessages || []).map((item) => item.split('--')[2])
    : []

  const filterEmpty = <T extends number>(array: (T | undefined)[]): T[] => {
    return array.filter((item): item is T => item !== undefined)
  }
  myStepTasks = filterEmpty(stepTasks)

  const changeStepParam: ChangeStepParam = {
    actionchangestep: {
      assignedToParticipant: changestepAssignedId,
      links: {
        action: `${matterId}`,
        node: `${nodeId}`,
        step: `${actionType}--${stepNumber}`,
        stepMessages: sdsStepMessages,
        stepTasks: myStepTasks,
      },
    },
  }

  await logger.info(
    `prepareStepchangeToSds(*) @matterId:${matterId} #Debug changeStepParam =>`,
    JSON.stringify(changeStepParam),
  )
  return changeStepParam
}
