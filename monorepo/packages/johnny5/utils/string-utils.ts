import type { Logger } from '@dbc-tech/logger'
import parsePhoneNumberFromString, {
  parsePhoneNumber,
} from 'libphonenumber-js/min'
import _ from 'lodash'
import { AllEnvironments, type Environment } from '../typebox'
import type { SelectionMarkValues } from '../typebox/selection-mark.schema'
import { parseDateOnly } from './date-utils'

export function extractFirstNumber(input: string): number | undefined {
  if (!input) return undefined
  const match = input.match(/\d+/)
  return match ? +match[0] : undefined
}

export const extractNumbers = (
  address: string | undefined,
): number | undefined => {
  if (!address) return undefined
  const regex = /\d+/g
  const matches = address.match(regex)
  return matches ? matches.length : 0
}

export function extractFirstNumberInDays(input: string): number | undefined {
  if (!input) return undefined

  const match = input.match(
    /(\d+)\s*(days|hour|hours|weeks|week|months|month)?/i,
  )
  if (!match) return undefined

  const value = +match[1]
  const unit = match[2]?.toLowerCase()

  if (unit === 'hours' || unit === 'hour') {
    return Math.ceil(value / 24)
  } else if (unit === 'weeks' || unit === 'week') {
    return value * 7
  } else if (unit === 'months' || unit === 'month') {
    return value * 30
  }
  return value // Default is days
}

export function containsBusinessOrWorking(input: string): boolean {
  const regex = /(biz|business|work|working)/i

  return regex.test(input)
}

export function containsDays(input: string): boolean {
  const regex = /days/i

  return regex.test(input)
}

export type DateOrDays =
  | Date
  | { numberOfDays: number; type: 'business' | 'calendar' }
  | undefined

/**
 * Extracts a date or a number of days from the given input string.
 *
 * @param input - The input string to parse.
 * @param logger - The logger instance for logging debug information.
 * @returns A promise that resolves to a `DateOrDays` object if a date or number of days is found, otherwise `undefined`.
 *
 * The function first attempts to parse the input as a date. If successful, it returns the parsed date.
 * If the input does not contain a date, it then checks if the input contains a number of days.
 * If a number of days is found, it returns an object containing the number of days and the type (business or calendar).
 * If neither a date nor a number of days is found, it returns `undefined`.
 */
export const extractDateOrDays = async (
  input: string,
  logger: Logger,
): Promise<DateOrDays> => {
  if (!input) return undefined

  await logger.debug('#extractDateOrNumberOfDays Parsing field as a date', {
    input,
  })
  const parsedDate = parseDateOnly(input)
  if (parsedDate) {
    await logger.debug('#extractDateOrNumberOfDays Returning a date', {
      input,
      parsedDate,
    })
    return parsedDate
  }

  await logger.debug(
    '#extractDateOrNumberOfDays Date not found. Attempting to locate number (of days)',
    {
      input,
    },
  )
  if (!containsDays(input)) {
    await logger.debug(
      '#extractDateOrNumberOfDays "days" not found. Returning undefined',
      {
        input,
      },
    )
    return undefined
  }

  const nDays = extractFirstNumber(input)
  if (!nDays) {
    await logger.debug(
      '#extractDateOrNumberOfDays Unable to locate number of days. Returning undefined',
      {
        input,
      },
    )
    return undefined
  }

  const isBusinessDays = containsBusinessOrWorking(input)
  const response: DateOrDays = {
    numberOfDays: nDays,
    type: isBusinessDays ? 'business' : 'calendar',
  }

  await logger.debug(
    '#extractDateOrNumberOfDays Returning number of days',
    response,
  )

  return response
}

export function StreetNameAbbreviationExpander(str: string): string {
  if (!str) return str

  const lookup: Record<string, string> = {
    Ave: 'Avenue',
    Bvd: 'Boulevard',
    Cct: 'Circuit',
    Cl: 'Close',
    Crn: 'Corner',
    Ct: 'Court',
    Cres: 'Crescent',
    Dr: 'Drive',
    Esp: 'Esplanade',
    Gr: 'Grove',
    Hwy: 'Highway',
    Ln: 'Lane',
    Pde: 'Parade',
    Pl: 'Place',
    Rdge: 'Ridge',
    Rd: 'Road',
    Sq: 'Square',
    St: 'Street',
    Tce: 'Terrace',
  }
  let outStr: string = str
  Object.keys(lookup).forEach((key) => {
    const pat = new RegExp(`\\b${key}\\b`, 'gi')
    outStr = outStr.replace(pat, lookup[key])
  })
  return outStr
}

export const capitalise = (input: string): string => {
  if (!input) return input
  return input.split(' ').map(_.capitalize).join(' ')
}

export const capitalizePlus = (
  input: string | undefined,
): string | undefined => {
  if (!input) return undefined

  return input
    .toLowerCase()
    .replace(/\((.*?)\)/g, (_match, group) => {
      const capitalized = group
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      return `(${capitalized})`
    })
    .split(' ')
    .map((word) => {
      if (word.startsWith('mc')) {
        return 'Mc' + word.charAt(2).toUpperCase() + word.slice(3)
      }
      return word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-')
    })
    .join(' ')
}

export const franchiseConveyancerRegex = (
  franchise: string,
  conveyancer: string,
) => new RegExp(`^\\d+_-_Franchise [-–] ${franchise} \\(${conveyancer}\\)`, 'i')

export function parseSelectionMark(
  value: string | undefined,
): SelectionMarkValues {
  if (!value) return ''

  const selectionMap: Record<string, SelectionMarkValues> = {
    selected: 'Yes',
    true: 'Yes',
    T: 'Yes',
    yes: 'Yes',
    unselected: 'No',
    false: 'No',
    F: 'No',
    no: 'No',
  }

  const sanitizeInput = (input: string | undefined): string =>
    (input || '').replace(/[:]/g, '').trim().toLowerCase()

  const cleanedValue = sanitizeInput(value)
  return selectionMap[cleanedValue] || ''
}

export function removePhonePrefix(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined

  try {
    const phoneNumber = parsePhoneNumber(value, 'AU')
    if (phoneNumber) return phoneNumber.nationalNumber
    return value
  } catch (_) {
    return value
  }
}

/**
 * Removes the country prefix from an Australian phone number string and formats it in national format without parentheses.
 * If the input is undefined or cannot be parsed as a valid Australian phone number, the original value is returned.
 *
 * @param value - The phone number string to process.
 * @returns The formatted phone number without country prefix and parentheses, or the original value if parsing fails.
 */
export function formatPhoneNumberwithSpacing(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined

  try {
    const phoneNumber = parsePhoneNumber(value, 'AU')
    const formatted = phoneNumber.formatNational().replace(/[()]/g, '')
    return formatted
  } catch (_) {
    return value
  }
}

export const getEnvironment = (): Environment => {
  let env: Environment = (process.env.APP_ENV || 'dev') as Environment
  if (!AllEnvironments.includes(env as Environment)) env = 'dev'
  return env
}

export function formatPhoneIntl(phone: string | undefined): string | undefined {
  if (!phone) return undefined
  try {
    const parsed = parsePhoneNumber(phone, 'AU')
    return parsed.format('E.164') //returns intl phone format ie: +61412345678
  } catch (_) {
    return undefined
  }
}

/**
 * Formats a given phone number string to an Australian local mobile format.
 *
 * @param value - The phone number string to format. If undefined, the function returns undefined.
 * @returns The formatted phone number as a string without spaces if it is a valid Australian mobile number.
 *          If the input is invalid or not a mobile number, the original value is returned.
 *
 * @remarks
 * This function uses `parsePhoneNumberFromString` to parse and validate the phone number.
 * It ensures the number is a valid Australian mobile number before formatting it.
 * If an error occurs during parsing, the original value is returned.
 */
export function formatToAULocalMobile(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined

  try {
    const phoneNumber = parsePhoneNumberFromString(value, 'AU')
    if (phoneNumber?.isValid() && phoneNumber.getType() === 'MOBILE') {
      return phoneNumber.formatNational().replace(/\s+/g, '')
    }
  } catch (_) {
    return value
  }
}

/**
 * Truncates a string to a specified maximum length and appends a suffix if necessary.
 * Ensures the returned string's length does not exceed maxLength.
 *
 * @param str - The string to truncate. Can be null or undefined.
 * @param maxLength - The maximum length of the truncated string. Must be non-negative.
 * @param suffix - The suffix to append if the string is truncated. Defaults to '...'.
 * @returns The truncated string, or the original string if it is shorter than or equal to the maximum length.
 *          Returns an empty string if the input string is null/undefined or maxLength is 0.
 *          If maxLength is less than the suffix length, the suffix itself is truncated.
 */
export function truncateString(
  str: string | null | undefined,
  maxLength: number,
  suffix: string = '...',
): string {
  // Handle invalid inputs
  if (!str) return ''
  if (maxLength <= 0) return ''

  // If string is already short enough, return it
  if (str.length <= maxLength) return str

  // If maxLength is too short to even hold the suffix, truncate the suffix
  if (maxLength <= suffix.length) {
    return suffix.slice(0, maxLength)
  }

  // Otherwise, truncate the string and append the full suffix
  return str.slice(0, maxLength - suffix.length) + suffix
}
