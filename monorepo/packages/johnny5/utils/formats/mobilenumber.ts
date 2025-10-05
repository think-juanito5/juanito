import { parsePhoneNumberWithError } from 'libphonenumber-js'
import { serializeError } from 'serialize-error'

export interface MobileNumber {
  /** Returns true when the given mobile number conforms to Australian format */
  readonly isValid: boolean

  /** Returns the country code. Should be AU to be valid */
  readonly countryCode?: string

  /** Returns the given mobile number */
  readonly originalNumber: string

  /** Returns the mobile number in international format */
  readonly formattedNumber?: string

  /** Returns the detected type of phone number */
  readonly phoneNumberType?: string

  /** Returns the error message if result is invalid */
  readonly errorMessage?: string
}

export const validateMobileNumber = (mobileNumber: string): MobileNumber => {
  const isString = typeof mobileNumber === 'string'
  if (!mobileNumber || !isString) {
    return {
      isValid: false,
      originalNumber: mobileNumber,
      errorMessage: 'Invalid Mobile number',
    }
  }

  let phoneNumber
  try {
    phoneNumber = parsePhoneNumberWithError(mobileNumber, 'AU')
  } catch (error) {
    const errObj = serializeError(error)
    return {
      isValid: false,
      originalNumber: mobileNumber,
      errorMessage: `Error parsing mobile number: ${errObj.name}: ${errObj.message}`,
    }
  }
  if (!phoneNumber)
    return {
      isValid: false,
      originalNumber: mobileNumber,
      errorMessage: 'Mobile number format unknown',
    }

  const isValidMobileNumber =
    phoneNumber.isValid() &&
    phoneNumber.getType() === 'MOBILE' &&
    phoneNumber.country === 'AU'
  if (!isValidMobileNumber)
    return {
      isValid: false,
      originalNumber: mobileNumber,
      errorMessage:
        'Mobile number is not a recognised Australian mobile number',
    }

  return {
    isValid: true,
    originalNumber: mobileNumber,
    countryCode: phoneNumber.country,
    formattedNumber: <string>phoneNumber.number,
    phoneNumberType: phoneNumber.getType(),
  }
}

export const IsMobileNumber = (mobileNumber: string): boolean =>
  validateMobileNumber(mobileNumber).isValid
