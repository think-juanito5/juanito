import { type AddressValidationService } from '@dbc-tech/google'
import { type MatterCreateDetailAddress } from '@dbc-tech/johnny5/typebox'
import { type Logger } from '@dbc-tech/logger'

export async function validateAddress(
  service: Pick<AddressValidationService, 'validateWithFormat'>,
  rawAddress: string,
  logger: Logger,
): Promise<MatterCreateDetailAddress> {
  await logger.info(`validateAddress(*) Raw address: ${rawAddress}`)
  const result = await service.validateWithFormat([rawAddress], true)

  if (!result.ok) {
    await logger.error(`Error validating address: ${result.val}`)
    return {
      line1: undefined,
      suburb: undefined,
      state: undefined,
      postcode: undefined,
      type: 'physical',
    }
  }

  await logger.debug(
    `validateAddress(*) Address validation result:`,
    result.val,
  )
  const { components, postal, allValid } = result.val

  const cfMap = new Map<string, string>()
  for (const { type, text } of components ?? []) {
    cfMap.set(type, text)
  }

  const getFallback = (
    postalVal: string | undefined,
    key: string,
  ): string | undefined => postalVal || cfMap.get(key) || undefined

  const unitNo = cfMap.get('subpremise')
  const streetNumber = cfMap.get('streetNumber')
  const streetName = cfMap.get('streetName')

  await logger.info(
    `validateAddress(*) #cfMap unitNo: ${unitNo} streetNumber: ${streetNumber} streetName: ${streetName}`,
  )
  const theStreet =
    [unitNo, streetNumber].filter(Boolean).join('/') || undefined

  const longFormatLine1 =
    [theStreet, streetName].filter(Boolean).join(' ') ||
    postal?.addressLines?.[0] ||
    undefined

  await logger.info(
    `validateAddress(*) allValid:(${allValid}) Formatted address line1: ${longFormatLine1} suburb: ${postal?.suburb} state: ${postal?.state} postcode: ${postal?.postalCode}`,
  )

  if (allValid) {
    return {
      line1: longFormatLine1,
      suburb: postal?.suburb,
      state: postal?.state,
      postcode: postal?.postalCode,
      type: 'physical',
    }
  }

  const suburbResult = getFallback(postal?.suburb, 'suburb')
  const stateResult = getFallback(postal?.state, 'state')
  const postcodeResult = getFallback(postal?.postalCode, 'postalCode')

  await logger.info(
    `validateAddress(*) Fallback values - suburb: ${suburbResult}, state: ${stateResult}, postcode: ${postcodeResult}`,
  )

  return {
    line1: longFormatLine1,
    suburb: suburbResult || undefined,
    state: stateResult || undefined,
    postcode: postcodeResult || undefined,
    type: 'physical',
  }
}
