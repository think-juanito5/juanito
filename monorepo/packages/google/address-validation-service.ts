import { AddressValidationClient } from '@googlemaps/addressvalidation'
import { JWT } from 'google-auth-library'
import { Err, Ok, Result } from 'ts-results-es'
import {
  type ValidateAddressMinimal,
  formatAddressValidation,
} from './address-validation-helper'

export type AddressValidationServiceConfig = {
  apiKey: string
}
export class AddressValidationService {
  private client: AddressValidationClient

  constructor(config: AddressValidationServiceConfig) {
    const authClient = new JWT()
    authClient.fromAPIKey(config.apiKey)

    this.client = new AddressValidationClient({ authClient })
  }

  /**
   * Validates an Australian address using the Google Address Validation API.
   *
   * @param addressLines An array of strings representing the lines of the Australian address.
   * @returns A promise that resolves to an `Ok` result containing the validation response if successful, or an `Err` result with an error message if validation fails or the API returns no response.
   */
  async validate(addressLines: string[]) {
    const request = {
      address: {
        regionCode: 'AU',
        addressLines,
      },
    }

    try {
      const response = await this.client.validateAddress(request)
      return response
        ? Ok(response)
        : Err('No response from Google Address Validation API')
    } catch (error) {
      return Err(
        `Error validating address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Validates the provided address lines and formats the validation result.
   *
   * @param addressLines - An array of address lines to be validated.
   * @param verbose - Optional flag to determine if the formatted result should include verbose details. Defaults to `false`.
   * @returns A promise that resolves to a `Result` containing either the minimal validated address or an error message string.
   */
  async validateWithFormat(
    addressLines: string[],
    verbose = false,
  ): Promise<Result<ValidateAddressMinimal, string>> {
    try {
      const res = await this.validate(addressLines)
      return formatAddressValidation(res, verbose)
    } catch (error) {
      return Err(
        `Error validating address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
