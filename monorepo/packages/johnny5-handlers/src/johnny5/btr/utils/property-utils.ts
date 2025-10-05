import { validateAddress } from '@dbc-tech/cca-common'
import type { AddressValidationService } from '@dbc-tech/google'
import type {
  AustralianState,
  PropertyAddress,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'

export const BTR_DEFAULT_AREA = 'Q00'

export const googleValidatedAddress = async (
  service: Pick<AddressValidationService, 'validateWithFormat'>,
  rawAddress: string,
  logger: Logger,
): Promise<PropertyAddress | undefined> => {
  if (!rawAddress) return undefined
  const addr = await validateAddress(service, rawAddress, logger)
  const { line1, suburb, state, postcode } = addr
  if (!line1 || !suburb || !state || !postcode) {
    await logger.error(
      `Invalid property address: ${rawAddress} - Missing required fields`,
    )
    return undefined
  }
  const validatedAddress: PropertyAddress = {
    addressLine1: line1,
    addressLine2: addr.line2,
    suburb,
    state: state.toUpperCase() as AustralianState,
    postcode,
  }
  await logger.debug(`Validated address: ${JSON.stringify(validatedAddress)}`)
  return validatedAddress
}
