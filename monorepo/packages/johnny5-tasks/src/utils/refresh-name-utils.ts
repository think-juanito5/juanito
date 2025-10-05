import {
  type ActionParticipantPost,
  type ActionStepService,
  type PagedActionParticipants,
  StepNameValues,
} from '@dbc-tech/actionstep'
import type { StepNameType } from '@dbc-tech/actionstep/actionstep.enhanced.schema'
import {
  type AdditionalInfoTypes,
  type EntityMatterNameParams,
  FilenotePipedriveService,
  type MatterDetails,
  MatterNameBuilder,
  MatterNamingMethod,
} from '@dbc-tech/cca-common'
import type { AustralianState, Intent } from '@dbc-tech/johnny5'
import { J5Config } from '@dbc-tech/johnny5'
import { JobModel, MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import type { Logger } from '@dbc-tech/logger'
import type { PipedriveV1Service } from '@dbc-tech/pipedrive'
import { serializeError } from 'serialize-error'

export type Person = {
  firstName: string
  lastName: string
}
export type Client = {
  isCompany: boolean
  companyName?: string | null
  lastName?: string | null
  firstName?: string | null
}

export type MatterStep = {
  current: StepNameType
  previous?: StepNameType
}

export type MatterNameParams = {
  stepName: MatterStep
  state: AustralianState
  intent: Intent
  matterId: number
  assignedTo?: Person
  client: Client
  additionalInfo?: AdditionalInfoTypes | undefined
}

type ParticipantTypeIds = {
  client?: number | undefined
  assignedLawyer?: number | undefined
  adminStaff?: number | undefined
  conveyancingManager?: number | undefined
}

type ParticipantIds = ParticipantTypeIds & {
  preSmtAssignedLawyer?: number | undefined
  preSmtConveyancingManager?: number | undefined
}

/**
 * Generates a matter name based on the provided parameters and business logic.
 *
 * Determines the naming method depending on the current and previous step names,
 * includes role initials if required, and constructs the matter name using the
 * `MatterNameBuilder`.
 *
 * @param params - The parameters required to generate the matter name.
 * @param params.matterId - The unique identifier for the matter.
 * @param params.stepName - The current and previous step names in the workflow.
 * @param params.state - The state associated with the matter.
 * @param params.intent - The intent or purpose of the matter.
 * @param params.assignedTo - The user assigned to the matter.
 * @param params.client - The client associated with the matter.
 * @param params.additionalInfo - Any additional information relevant to naming.
 * @returns A promise that resolves to the generated matter name string.
 */
export const getMatterName = async ({
  matterId,
  stepName,
  state,
  intent,
  assignedTo,
  client,
  additionalInfo,
}: MatterNameParams) => {
  const { previous, current } = stepName

  const initialSteps = [
    'Matter Preparation',
    'Contract Drafting',
    'Contract Review',
    'Seller Disclosure Statement',
  ]

  const initialStepsExcludingMatterPrep = initialSteps.filter(
    (step) => step !== 'Matter Preparation',
  )

  const nameMethod =
    previous && initialSteps.includes(current)
      ? (current as MatterNamingMethod)
      : initialSteps.includes(current)
        ? MatterNamingMethod.Initial
        : MatterNamingMethod.PreSettlement

  const isStageCancel = (): MatterNamingMethod | undefined => {
    if (current !== 'Cancellation') return

    return initialStepsExcludingMatterPrep.includes(String(previous))
      ? (previous as MatterNamingMethod)
      : undefined
  }

  const cancelNameMethod = isStageCancel()
  const shouldIncludeInitials =
    nameMethod !== MatterNamingMethod.Initial || additionalInfo === 'Conveyance'

  const roleInitials = shouldIncludeInitials
    ? `${assignedTo?.firstName.charAt(0)}${assignedTo?.lastName.charAt(0)}`
    : undefined

  const matterData: EntityMatterNameParams = {
    isCompany: client.isCompany,
    companyName: client.companyName ?? undefined,
    lastName: client.lastName ?? undefined,
    state,
    intent,
    matterId,
    roleInitials,
    testMode: process.env.APP_ENV !== 'prod',
    additionalInfo,
  }

  return MatterNameBuilder.fromData(matterData)
    .withMethod(cancelNameMethod ?? nameMethod)
    .build()
}

/**
 * Retrieves the client type ID from the Johnny5 configuration service.
 *
 * @param j5Config - An instance of the Johnny5ConfigService used to fetch configuration values.
 * @returns A promise that resolves to the client type ID.
 */

export const getParticipantTypeIds = async (
  j5Config: Johnny5ConfigService,
): Promise<ParticipantTypeIds> => {
  const getConfigValue = async (key: string) => {
    const res = await j5Config.get(key)
    return res ? +res.value : undefined
  }

  return {
    client: await getConfigValue(J5Config.actionstep.clientTypeId),
    assignedLawyer: await getConfigValue(
      J5Config.actionstep.assignedLawyerTypeId,
    ),
    adminStaff: await getConfigValue(J5Config.actionstep.adminStaffTypeId),
    conveyancingManager: await getConfigValue(
      J5Config.actionstep.conveyancingManagerTypeId,
    ),
  }
}

export const getNewTargetParticipantIds = async (
  j5Config: Johnny5ConfigService,
): Promise<ParticipantIds> => {
  const getConfigValue = async (key: string) => {
    const res = await j5Config.get(key)
    return res ? +res.value : undefined
  }

  return {
    assignedLawyer: await getConfigValue(J5Config.cca.actionstep.draftingId),
    adminStaff: await getConfigValue(
      J5Config.actionstep.conveyancingAdministrationId,
    ),
    preSmtAssignedLawyer: await getConfigValue(
      J5Config.actionstep.preSettlementAssignedLawyerId,
    ),
    preSmtConveyancingManager: await getConfigValue(
      J5Config.actionstep.preSettlementConveyancingManagerId,
    ),
  }
}

/**
 * Retrieves the participant ID of a client based on the specified client type ID.
 *
 * @param actionResponse - The response object containing a list of action participants.
 * @param clientTypeId - The ID of the client type to search for.
 * @returns The participant ID of the client if found, otherwise `undefined`.
 */
export const getParticipantId = (
  actionResponse: PagedActionParticipants,
  participantTypeId: number,
): number | undefined => {
  const participants = actionResponse.actionparticipants

  const client = participants.find(
    (p) => +p.links.participantType === participantTypeId,
  )
  if (!client) {
    return undefined
  }
  return +client?.links.participant
}

export const getParticipantIds = (
  actionResponse: PagedActionParticipants,
  participantTypeIds: ParticipantTypeIds,
): ParticipantIds => {
  const getId = (typeId: number | undefined) =>
    typeId ? getParticipantId(actionResponse, typeId) : undefined
  const { client, assignedLawyer, adminStaff, conveyancingManager } =
    participantTypeIds
  return {
    client: getId(client),
    assignedLawyer: getId(assignedLawyer),
    adminStaff: getId(adminStaff),
    conveyancingManager: getId(conveyancingManager),
  }
}

/**
 * Parameters for the `refreshMatterNotifyChannels` function.
 *
 * @property {number} matterId - The unique identifier of the matter to be updated.
 * @property {string} matterName - The new name of the matter to be updated in the database.
 * @property {boolean} [pdFileNotesEnabled] - A boolean indicating whether Pipedrive file notes are enabled.
 * @property {Person} [assignedTo] - An object containing details of the person assigned to the matter, including `firstName` and `lastName`.
 */
type SyncRefreshParams = {
  matterId: number
  matterName: string
  pdFileNotesEnabled?: boolean
  assignedTo?: Person
}

/**
 * Updates and synchronizes matter-related information in the database and Pipedrive.
 *
 * @param pipedrive - An instance of the PipedriveV2Service used for interacting with Pipedrive.
 * @param logger - A logger instance for logging information and warnings.
 * @param params - An object containing the following properties:
 *   @param params.matterId - The unique identifier of the matter to be updated.
 *   @param params.matterName - The new name of the matter to be updated in the database.
 *   @param params.pdFileNotesEnabled - A boolean indicating whether Pipedrive file notes are enabled.
 *   @param params.assignedTo - An object containing details of the person assigned to the matter, including `firstName` and `lastName`.
 *
 * @returns A promise that resolves when the matter information has been updated and synchronized.
 *
 * @remarks
 * - If the matter is not found in the `MatterCreateModel`, a warning is logged, and the function exits early.
 * - Updates the `matterName` in the `JobModel` if provided.
 * - Logs detailed meta information about the matter, including `dealId`, `matterTypeName`, `postCode`, `concierge`, `additionalInfo`, and `clientName`.
 * - Constructs a `MatterDetails` object and sends a notification to Pipedrive based on the value of `pdFileNotesEnabled`.
 * - Uses `logPipedriveStatus.Completed` or `logPipedriveStatus.Refreshed` to log the status in Pipedrive.
 */
export const refreshMatterNotifyChannels = async (
  pipedrive: PipedriveV1Service,
  logger: Logger,
  {
    matterId,
    matterName,
    pdFileNotesEnabled: pdFileNotesDone,
    assignedTo,
  }: SyncRefreshParams,
) => {
  const matterData = await MatterCreateModel.findOne({ matterId })
  if (!matterData) {
    await logger.warn(
      `refreshMatterNotifyChannels(+) MatterId:${matterId} not found in MatterCreateModel`,
    )
    return
  }
  const jobId = matterData.jobId
  await logger.info(
    `refreshMatterNotifyChannels(+) MatterId:${matterId} found in MatterCreateModel, updating matterName: ${matterName} to jobId: ${jobId}`,
  )
  if (matterName) {
    await JobModel.updateOne(
      { _id: jobId, 'meta.key': 'matterName' },
      { $set: { 'meta.$.value': matterName } },
    )
  }

  await logger.info(
    `refreshMatterNotifyChannels(+) MatterId:${matterId} pdFileNotesDone: ${pdFileNotesDone} assignedTo:`,
    { assignedTo },
  )

  const { manifest } = matterData
  const metaMap = new Map(manifest?.meta?.map(({ key, value }) => [key, value]))

  const dealId = metaMap.get('dealId')
  const matterTypeName = metaMap.get('matterTypeName')
  const postCode = metaMap.get('postCode')
  const concierge = metaMap.get('concierge')
  const additionalInfo = metaMap.get('additionalInfo') as
    | AdditionalInfoTypes
    | undefined
  const clientName = metaMap.get('clientName')

  await logger.info(
    `refreshMatterNotifyChannels(+) MatterId:${matterId} updated in MatterCreateModel, metaMap:`,
    {
      dealId,
      matterTypeName,
      postCode,
      concierge,
      additionalInfo,
      clientName,
    },
  )

  const assignedToName = assignedTo
    ? `${assignedTo.firstName} ${assignedTo.lastName}`
    : undefined

  const matterDetails: MatterDetails = {
    matterName,
    clientName,
    matterTypeName,
    postCode,
    concierge,
    additionalInfo,
    assignedToName,
  }
  const notesPipedriveService = new FilenotePipedriveService(pipedrive, logger)

  if (pdFileNotesDone) {
    await notesPipedriveService
      .deal(+dealId!)
      .details(matterDetails)
      .notify('matter-created-details')
      .handleCompleted()
      .exec()

    logger.info(
      `refreshMatterNotifyChannels(+) MatterId:${matterId} pdFileNotesDone: ${pdFileNotesDone}, notifying Pipedrive for dealId ${dealId}`,
      { type: 'matter-created-details' },
    )
  } else {
    await notesPipedriveService
      .deal(+dealId!)
      .details(matterDetails)
      .notify('matter-name-refreshed')
      .exec()
  }
}

type MatterParticipantToReplace = {
  actionStepMatterId: number
  participantTypeId: number | undefined
  oldParticipantId: number | undefined
  newParticipantId: number | undefined
}

const deleteLinkedParticipant = async (
  actionstep: ActionStepService,
  logger: Logger,
  actionStepMatterId: number,
  participantTypeId: number,
  participantId: number,
): Promise<void> => {
  const compositeId = `${actionStepMatterId}--${participantTypeId}--${participantId}`
  try {
    await logger.info(
      `MatterId:${actionStepMatterId} #Deleting Action Participant for type "${participantTypeId}" compositeId: "${compositeId}"`,
      { participantId },
    )
    await actionstep.deleteActionParticipant(compositeId)
    await logger.info(
      `MatterId:${actionStepMatterId} #Action Participant deleted successfully`,
      { participantId },
    )
  } catch (error) {
    const errMsg = serializeError(error)
    await logger.error(
      `IgnoreError: MatterId:${actionStepMatterId} #Unable to delete action participant for type "${participantTypeId}" participantId:${participantId}`,
      { errMsg },
    )
  }
}

const createLinkedParticipant = async (
  actionstep: ActionStepService,
  logger: Logger,
  actionStepMatterId: number,
  participantTypeId: number,
  participantId: number,
): Promise<void> => {
  const paramParams: ActionParticipantPost = {
    actionparticipants: {
      links: {
        action: `${actionStepMatterId}`,
        participantType: `${participantTypeId}`,
        participant: `${participantId}`,
      },
    },
  }

  try {
    await logger.info(
      `Linking new Action Participant for MatterId:${actionStepMatterId} with body:`,
      paramParams,
    )
    const res = await actionstep.linkActionParticipant(paramParams)
    if (!res.actionparticipants.id) {
      throw new Error(`Failed to link Participant, no participant id returned!`)
    }
    await logger.info(
      `MatterId:${actionStepMatterId} #Action Participant linked successfully`,
      { addedId: participantId },
    )
  } catch (error) {
    const errMsg = serializeError(error)
    await logger.error(
      `IgnoreError: MatterId:${actionStepMatterId} participantTypeId:${participantTypeId} participantId:${participantId} #Unable to link action participant`,
      { errMsg },
    )
  }
}

export const replaceMatterParticipant = async (
  actionstep: ActionStepService,
  logger: Logger,
  mptr: MatterParticipantToReplace,
): Promise<void> => {
  const { actionStepMatterId, participantTypeId } = mptr

  const participantIdToRemove = mptr.oldParticipantId
  const participantIdToAdd = mptr.newParticipantId

  await logger.info(`replaceMatterParticipant(+) mptr: `, { mptr })

  if (participantTypeId && participantIdToRemove) {
    await deleteLinkedParticipant(
      actionstep,
      logger,
      actionStepMatterId,
      participantTypeId,
      participantIdToRemove,
    )
  }

  if (participantTypeId && participantIdToAdd) {
    await createLinkedParticipant(
      actionstep,
      logger,
      actionStepMatterId,
      participantTypeId,
      participantIdToAdd,
    )
  }
}

export const getCurrentStepTarget = (
  cur: StepNameType,
  prev: StepNameType | undefined,
) => {
  const isSdsToContractDrafting =
    cur === StepNameValues.ContractDrafting &&
    prev === StepNameValues.SellerDisclosureStatement

  return {
    isSdsToContractDrafting,
  }
}
