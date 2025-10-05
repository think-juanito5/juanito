import { promises as fs, createWriteStream } from 'fs'
import { Readable } from 'stream'
import { type MatterCreateDetailAddress } from '@dbc-tech/johnny5/typebox'
import { pipdriveState } from '@dbc-tech/pipedrive'

export const saveStreamToFile = async (
  stream: Readable,
  filePath: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(filePath)
    stream.pipe(writeStream)
    writeStream.on('finish', () => {
      resolve()
    })
    writeStream.on('error', (error) => {
      reject(error)
    })
    stream.on('error', (error) => {
      reject(error)
    })
  })
}

export async function checkFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath)
  return stats.size
}

export async function removeFile(testFilePath: string) {
  await fs.unlink(testFilePath)
}

export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export const isCompany = (name: string): boolean => {
  const companyIdentifiers = [
    'Pty Ltd',
    'Limited',
    'Ltd',
    'Agency',
    'Inc',
    'Co',
    'Co.',
    'Corp',
    'Corporation',
    'Offices',
    'Law',
    'Group',
    'Associates',
    'Partners',
    'Firm',
    'Consultants',
    'Holdings',
    'Enterprises',
    'Investments',
    'Trust',
    'Management',
    'Foundation',
    'Incorporated',
    'LLP',
    'Cooperative',
    'Co-op',
    'Association',
    'Board',
    'Consortium',
    'Conveyancing',
    'Federation',
    'Syndicate',
    'Club',
    'PLC',
    'Rural',
    'Realty',
    'Solutions',
    'Services',
    'Systems',
    'Technologies',
    'Rules',
  ]

  const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (domainPattern.test(name)) {
    return true
  }

  return companyIdentifiers.some((identifier) =>
    new RegExp(`\\b${identifier}\\b`, 'i').test(name),
  )
}

export const isIndividual = (inputName: string): boolean => {
  const name = inputName.toLowerCase()

  const individualHints = [
    'mr',
    'mrs',
    'ms',
    'miss',
    'dr',
    'prof',
    'esq',
    'sr',
    'jr',
    'rev',
    'sir',
    'lord',
    'chief',
    'mx.',
    'madam',
    'madame',
  ]

  const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (domainPattern.test(name)) {
    return false
  }

  const hasTitle = individualHints.some((title) => name.includes(title))

  const isLikelyIndividual = /^[A-Z][a-z]*\s[A-Z][a-z]*$/.test(name)
  const containsInitials = /\b[A-Z]\.?\s[A-Z][a-z]*\b/.test(name)

  if (hasTitle || isLikelyIndividual || containsInitials) {
    return true
  }

  if (isCompany(name)) {
    return false
  }

  return true
}

interface INameFields {
  firstname: string
  middlename?: string
  lastname: string
  prefix?: string
  suffix?: string
}

export const extractName = (name: string): INameFields => {
  const suffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV']
  const nameArr = name.trim().split(/\s+/)
  const nameDetails: INameFields = {
    firstname: '',
    lastname: '',
  }

  if (nameArr[0].endsWith('.')) {
    nameDetails.prefix = nameArr.shift()
  }

  if (suffixes.includes(nameArr[nameArr.length - 1])) {
    nameDetails.suffix = nameArr.pop()
  }

  if (nameArr.length >= 3) {
    nameDetails.firstname = nameArr[0]
    nameDetails.middlename = nameArr[1]

    // Assigning everything after the first and middlename as lastname(s)
    nameDetails.lastname = nameArr.slice(2, nameArr.length).join(' ')
  } else if (nameArr.length === 2) {
    nameDetails.firstname = nameArr[0]
    nameDetails.lastname = nameArr[1]
  } else {
    nameDetails.firstname = nameDetails.lastname = nameArr[0]
  }
  return nameDetails
}

export const splitName = (fullName: string): string[] => {
  const nameParts = fullName.trim().split(/\s+/)
  if (nameParts.length === 1) {
    return [fullName]
  }

  const firstName = nameParts[0]
  const lastName =
    nameParts.length > 1 ? nameParts[nameParts.length - 1] : undefined
  const middleName =
    nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined

  return [
    fullName,
    firstName,
    ...(middleName ? [middleName] : []),
    ...(lastName ? [lastName] : []),
  ]
}

export const createPropertyParticipantName = (
  address?: MatterCreateDetailAddress,
): string | undefined => {
  if (!address) return undefined

  const { line1, line2, suburb, state, postcode } = address

  const parts = [line1, line2, suburb, state, postcode]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v))

  return parts.length > 0 ? parts.join(', ') : undefined
}

export const formatUnitAndStreetNumber = (
  unitNo?: string,
  streetNo?: string,
): string | undefined => {
  const unit = unitNo?.trim()
  const street = streetNo?.trim()

  if (unit && street) return `${unit}/${street}`
  return unit || street || undefined
}

export type DealAddressRaw = {
  postCode?: string
  stateId?: string
  streetName?: string
  streetNo?: string
  streetType?: string
  suburb?: string
  unitNo?: string
}

export const buildDealAddress = ({
  postCode,
  stateId,
  streetName,
  streetNo,
  streetType,
  suburb,
  unitNo,
}: DealAddressRaw): MatterCreateDetailAddress | undefined => {
  const unitStreet = formatUnitAndStreetNumber(unitNo, streetNo)
  const addressParts = [unitStreet, streetName, streetType]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v))

  if (!postCode && !stateId && addressParts.length === 0 && !suburb) {
    return undefined
  }

  const state = stateId ? pipdriveState[+stateId] : undefined

  return {
    line1: addressParts.length > 0 ? addressParts.join(' ') : undefined,
    postcode: postCode?.trim(),
    state: state?.trim(),
    suburb: suburb?.trim(),
    type: 'physical',
  }
}

export type ExtractedNameResponse = {
  firstName?: string
  lastName?: string
}

/**
 * Extracts and formats a person's first name and/or last name from the provided inputs.
 *
 * @param firstName - The first name of the person, or `undefined` if not provided.
 * @param lastName - The last name of the person, or `undefined` if not provided.
 * @returns An object containing the extracted `firstName` and/or `lastName`, or `undefined` if both inputs are missing.
 *
 * @remarks
 * - If only `lastName` is provided, it splits the name into a first name and last name if possible.
 * - If only `firstName` is provided, it assumes the last word is the last name and the rest is the first name.
 * - If both `firstName` and `lastName` are provided, it returns them as-is.
 *
 * @example
 * ```typescript
 * getFirstnameOrLastname(undefined, "Doe");
 * // Returns: { firstName: "Doe" }
 *
 * getFirstnameOrLastname("John", undefined);
 * // Returns: { firstName: "John" }
 *
 * getFirstnameOrLastname("John", "Doe");
 * // Returns: { firstName: "John", lastName: "Doe" }
 * ```
 */
export function getFirstnameOrLastname(
  firstName: string | undefined,
  lastName: string | undefined,
): ExtractedNameResponse | undefined {
  const splitName = (name: string) => name.trim().split(' ')

  if (!firstName && !lastName) return undefined

  if (!firstName && lastName) {
    const [first, ...last] = splitName(lastName)
    return last.length
      ? { firstName: first, lastName: last.join(' ') }
      : { lastName }
  }

  if (!lastName && firstName) {
    const parts = splitName(firstName)
    return parts.length > 1
      ? {
          firstName: parts.slice(0, -1).join(' '),
          lastName: parts.at(-1) ?? '',
        }
      : { firstName }
  }

  return { firstName, lastName }
}
