import type { Logger } from '@dbc-tech/logger'
import type { PipedriveWebhookV2 } from '@dbc-tech/pipedrive'
import {
  OnlineConversionNotes,
  PipedriveAdditionalInfo,
  bst,
  customFields,
  pipedriveAdditionalInfoTypes,
} from '@dbc-tech/pipedrive'

export const PROPERTY_TYPE_CODE = {
  APARTMENT_TOWNHOUSE_VILLA: 19,
  EXISTING_HOUSE: 20,
  LAND_ONLY: 21,
  OFF_THE_PLAN: 22,
} as const

export type PropertyData = {
  propertyCode?: string | null
  postCode: string | null
  stateId: string | null
  streetName: string | null
  streetNo: string | null
  streetType: string | null
  suburb: string | null
  unitNo?: string | null
}

export type PropertyValidationResult = {
  isValid: boolean
  missingFields: string[]
  data: PropertyData
}

export const validatePropertyData = (
  data: PropertyData,
): PropertyValidationResult => {
  const missingFields: string[] = []

  const isMissing = (val: unknown): boolean =>
    val === null || val === undefined || val === ''

  const { propertyCode, unitNo, ...rest } = data

  if (isMissing(propertyCode)) {
    missingFields.push('propertyCode')
  }

  if (
    propertyCode &&
    +propertyCode === PROPERTY_TYPE_CODE.APARTMENT_TOWNHOUSE_VILLA &&
    isMissing(unitNo)
  ) {
    missingFields.push('unitNo')
  }

  for (const [key, value] of Object.entries(rest)) {
    if (isMissing(value)) {
      missingFields.push(key)
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    data,
  }
}

export const validateProperty = async (
  webhook: PipedriveWebhookV2,
  logger: Logger,
): Promise<PropertyValidationResult> => {
  const webhookCf = webhook.data.custom_fields
  const getDataValue = (
    val: string | number | boolean | null | undefined,
  ): string | null => {
    if (typeof val === 'string' || typeof val === 'number') {
      return String(val)
    }
    return null
  }

  const data: PropertyData = {
    propertyCode: getDataValue(webhookCf?.[customFields.propertyDetIndex]?.id),
    postCode: getDataValue(webhookCf?.[customFields.postcode]?.value),
    stateId: getDataValue(webhookCf?.[customFields.state]?.id),
    streetName: getDataValue(
      webhookCf?.[customFields.propertyStreetName]?.value,
    ),
    streetNo: getDataValue(webhookCf?.[customFields.propertyStreetNo]?.value),
    streetType: getDataValue(
      webhookCf?.[customFields.propertyStreetType]?.value,
    ),
    suburb: getDataValue(webhookCf?.[customFields.propertySuburb]?.value),
    unitNo: getDataValue(webhookCf?.[customFields.propertyUnitNo]?.value),
  }
  await logger.info(
    `validateProperty(*) Pipedrive property data: ${JSON.stringify(data)} for dealId ${webhook.data.id}`,
  )
  return validatePropertyData(data)
}

export const isSdsTransaction = async (
  webhook: PipedriveWebhookV2,
  logger: Logger,
): Promise<boolean> => {
  const webhookCf = webhook.data.custom_fields
  const additionalInfoCode = webhookCf?.[customFields.additionalInfo]?.id
  const leadJourney = webhookCf?.[customFields.leadJourney]?.value as
    | string
    | undefined

  const additionalInfo = additionalInfoCode
    ? pipedriveAdditionalInfoTypes[+additionalInfoCode]
    : undefined
  await logger.info(
    `isSdsTransaction(*) Pipedrive additional info: ${additionalInfo}, leadJourney: ${leadJourney} for dealId ${webhook.data.id}`,
  )
  return (
    additionalInfo === PipedriveAdditionalInfo.sds ||
    leadJourney === OnlineConversionNotes.sds
  )
}

export const isBuyTransaction = async (
  webhook: PipedriveWebhookV2,
  logger: Logger,
): Promise<boolean> => {
  const bstId = webhook.data.custom_fields?.[customFields.bst]?.id
  await logger.info(
    `isBuyTransaction(*) Pipedrive bstId: ${bstId} for dealId ${webhook.data.id}`,
  )
  return !!bstId && bst[bstId] === 'Buying'
}
