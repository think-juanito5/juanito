import type { BtrSdsPerson } from '@dbc-tech/johnny5/typebox'
import { type Intent, extractNumbers } from '@dbc-tech/johnny5/utils'
import { isCompany } from '../../../utils/data-utils'

export type PersonName = {
  firstname?: string
  middlename?: string
  lastname?: string
}

export type PersonOrCompanyName = PersonName & {
  is_company?: boolean
  company_name?: string
}
export interface NaturePropertySubConvType {
  natureOfProperty: NatureType
  conveyancingSubtype: SubType
  filenotes?: string
}

export type SubType = 'House' | 'Unit' | 'Land' | 'No Sale Options Available'
export type NatureType = 'Dwelling' | 'Vacant Land' | 'Home/Unit' | 'Multi Unit'
export type LayoutNameType =
  | 'QLD-REIQ-House_and_Land'
  | 'QLD-REIQ-Community_Titles'
  | 'QLD-ADL-Community_Titles'
  | 'QLD-ADL-House_and_Land'

export const propertyNoteMsgs = {
  ctsHomeUnitNature: `This matter has been marked as Home/Unit for "nature of property". Please check and update if required.`,
  ctsUnitNatureNConveyancing: `This matter has been marked as a Unit for "Conveyancing Sub type" and "nature of property" as Home/Unit. Please check and update if required.`,
  cstMultipleLotsForNature: `This matter has been marked as Multi/Unit for nature of property as multiple lots found. Please check and update if required.`,
  landNeitherEnabledForNature: `Vacant and built on were not indicated, this matter has been marked as a Dwelling for "nature of property". Please check and update if required.`,
  landNeitherEnabledForNatureSub: `Vacant and built on were not indicated, this matter has been marked as a Dwelling for "nature of property" and a House for "Conveyancing Sub type". Please check and update if required.`,
  landBothEnabledForNature: `Both Vacant and Built on were indicated as applicable, this matter has been marked as a Dwelling for "nature of property". Please check and update if required.`,
  landBothEnabledForNatureSub: `Both Vacant and Built on were indicated as applicable, this matter has been marked as a Dwelling for "nature of property" and a House for "Conveyancing Sub type". Please check and update if required.`,
}

export type OcrPropertyFields = {
  propertyAddress: string | undefined
  isVacantLand: boolean | undefined
  isBuiltOn: boolean | undefined
  numberOfLots: number
}

/**
 * Extracts lot numbers from a string.
 *
 * The function searches for lot numbers within the input string using a regular expression that accounts for various prefixes like "lot", "lot no.", "lot number", and "L.".
 * It returns an array of numbers, each representing a lot number found in the string.
 *
 * @param input - The string to extract lot numbers from. Can be undefined.
 * @returns An array of extracted lot numbers as numbers. Returns an empty array if no lot numbers are found or if the input is undefined.
 */
export const extractLotNumbers = (input: string | undefined): number[] => {
  if (!input) return []

  // Regular expression to match lot numbers with various prefixes
  const regex = /(?:lot\s*(?:no\.?|number)?:?\s*|L\.?\s*)?(\d+)/gi

  const matches: number[] = []
  let match: RegExpExecArray | null

  // Find all matches in the input string
  while ((match = regex.exec(input)) !== null) {
    // Extract the number part (captured group) and convert it to a number
    const lotNumber = parseInt(match[1], 10)
    if (!isNaN(lotNumber)) {
      matches.push(lotNumber)
    }
  }

  return matches
}

/**
 * Extracts an array of title references from a given string.
 * The input string is split based on delimiters such as '&', 'and', or '|'.
 *
 * @param titleRef - The string containing title references separated by delimiters.
 * @returns An array of trimmed title references.
 */
export const extractTitleReference = (
  titleRef: string | undefined,
): string[] | undefined => {
  const delmtrRegex = /\s*(?:&|and|\|)\s*/i
  if (!titleRef) return undefined
  return titleRef.split(delmtrRegex).map((ref) => ref.trim())
}

/**
 * Extracts email addresses from a given string.
 * The input string is split based on delimiters such as ',', ';', '/', '|', or 'and'.
 * The extracted emails are then trimmed and validated using a regular expression.
 *
 * @param input - The string containing email addresses separated by delimiters.
 * @returns An array of trimmed and valid email addresses.
 */
export const extractEmails = (
  input: string | undefined,
): string[] | undefined => {
  if (!input) return undefined
  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const emails = input
    .split(/[,;|\/]|\band\b/)
    .map((email) => email.trim())
    .filter((email) => isValidEmail(email))

  return emails.length > 0 ? emails : undefined
}

/**
 * Formats a given string by replacing underscores with spaces and capitalizing the first letter of each word.
 *
 * @param input - The string to be formatted.
 * @returns The formatted string with underscores replaced by spaces and each word capitalized.
 */
export const fmtSubsectionParticipant = (input: string): string => {
  const singularMap: Record<string, string> = {
    buyers: 'Buyer 1',
    sellers: 'Seller 1',
  }
  const normalInput = singularMap[input.toLowerCase()] || input
  return normalInput
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Constructs a person's full name based on the provided details.
 *
 * @param {Object} params - The parameters for constructing the name.
 * @param {boolean} params.is_company - Indicates if the entity is a company.
 * @param {string} [params.name] - The name of the company, if applicable.
 * @param {string} [params.firstname] - The first name of the person.
 * @param {string} [params.middlename] - The middle name of the person.
 * @param {string} [params.lastname] - The last name of the person.
 *
 * @returns {string} The constructed full name of the person or the company name if it is a company.
 */
export const getPersonOrCompanyName = ({
  is_company,
  company_name,
  firstname,
  middlename,
  lastname,
}: PersonOrCompanyName): string =>
  is_company && company_name
    ? company_name
    : getPersonName({ firstname, middlename, lastname })

/**
 * Constructs a person's full name based on the provided details.
 *
 * @param {Object} params - The parameters for constructing the name.
 * @param {string} [params.firstname] - The first name of the person.
 * @param {string} [params.middlename] - The middle name of the person.
 * @param {string} [params.lastname] - The last name of the person.
 *
 * @returns {string} The constructed full name of the person.
 */
export const getPersonName = ({
  firstname,
  middlename,
  lastname,
}: PersonName): string =>
  [firstname, middlename, lastname].filter(Boolean).join(' ')

export type LayoutTypeResponse = 'REIQ' | 'ADL' | undefined
export interface ContractLayoutResponse {
  type: LayoutTypeResponse
  communityTitles: boolean // Indicates if it's a CTS
  houseAndLand: boolean // Indicates if it's House and Land
}

/**
 * Extracts the layout response from a given layout string.
 *
 * @param layout - The layout string to be processed.
 * @returns A `ContractLayoutResponse` object containing the type, communityTitles, and houseAndLand properties,
 *          or `undefined` if the layout string does not contain recognizable patterns.
 *
 * The function normalizes the layout string by converting it to lowercase and replacing hyphens and underscores with spaces.
 * It then determines the type based on the presence of specific substrings ('reiq' or 'adl').
 * Additionally, it checks for the presence of 'community titles' and 'house and land' or 'house land' substrings
 * to set the respective boolean properties in the returned object.
 */
export function extractPALayoutResponse(
  layout: LayoutNameType,
): ContractLayoutResponse | undefined {
  if (!layout) return undefined

  const normalizedLayout = layout.toLowerCase().replace(/[-_]/g, ' ')

  const type = normalizedLayout.includes('reiq')
    ? 'REIQ'
    : normalizedLayout.includes('adl')
      ? 'ADL'
      : undefined

  if (!type) return undefined

  const communityTitles = normalizedLayout.includes('community titles')
  const houseAndLand =
    normalizedLayout.includes('house and land') ||
    normalizedLayout.includes('house land')

  return {
    type,
    communityTitles,
    houseAndLand,
  }
}

/**
 * Determines the nature of the property and its conveyancing subtype based on the provided layout name, intent, and OCR property fields.
 *
 * @param layoutName - The name of the layout.
 * sample layoutName:
 * - 'QLD-REIQ-Community_Titles'
 * - 'QLD-REIQ-House_and_Land'
 * - 'QLD-ADL-Community_Titles'
 * - 'QLD-ADL-House_and_Land' *
 *
 * @param layoutName - The name of the layout to extract property attributes.
 * @param intent - The intent of the property transaction, either 'sell' or another type.
 * @param ocr - The OCR property fields containing property details:
 * - propertyAddress
 * - isVacantLand
 * - isBuiltOn
 * - numberOfLots
 * @returns An object containing the nature of the property, conveyancing subtype, and optional file notes, or undefined if the nature type cannot be determined.
 */
export function getNaturePropAndSubConvType(
  layoutName: LayoutNameType,
  intent: Intent,
  ocr: OcrPropertyFields,
): NaturePropertySubConvType | undefined {
  let filenotes: string | undefined
  const { type: layoutType, communityTitles: cts } =
    extractPALayoutResponse(layoutName) || {}

  // Helper for CTS cases
  const getUnitType = (): NatureType | undefined => {
    if (!cts || !ocr.propertyAddress) return undefined

    const addressMultiUnit = isMultiUnit(ocr.propertyAddress)
    filenotes = addressMultiUnit
      ? ocr.numberOfLots > 1
        ? propertyNoteMsgs.cstMultipleLotsForNature
        : undefined
      : intent === 'sell'
        ? propertyNoteMsgs.ctsHomeUnitNature
        : propertyNoteMsgs.ctsUnitNatureNConveyancing
    return addressMultiUnit ? 'Multi Unit' : 'Home/Unit'
  }

  // Helper for House/Land cases
  const getLandType = (): NatureType => {
    const isReiqLayout = layoutType === 'REIQ'
    const neitherEnabled = !ocr.isBuiltOn && !ocr.isVacantLand
    const bothEnabled = ocr.isBuiltOn && ocr.isVacantLand

    if (isReiqLayout) {
      if (neitherEnabled) {
        filenotes =
          intent === 'sell'
            ? propertyNoteMsgs.landNeitherEnabledForNature
            : propertyNoteMsgs.landNeitherEnabledForNatureSub
      } else if (bothEnabled) {
        filenotes =
          intent === 'sell'
            ? propertyNoteMsgs.landBothEnabledForNature
            : propertyNoteMsgs.landBothEnabledForNatureSub
      }
      if (ocr.isBuiltOn) return 'Dwelling'
    }

    return ocr.isVacantLand ? 'Vacant Land' : 'Dwelling'
  }

  // Determine nature and subtype
  if (cts) {
    const natureType = getUnitType()
    if (!natureType) return undefined

    return {
      natureOfProperty: natureType,
      conveyancingSubtype:
        intent === 'sell'
          ? 'No Sale Options Available'
          : natureType === 'Multi Unit' || natureType === 'Home/Unit'
            ? 'Unit'
            : (natureType as SubType),
      filenotes,
    }
  } else {
    const landType = getLandType()
    return {
      natureOfProperty: landType,
      conveyancingSubtype:
        intent === 'sell'
          ? 'No Sale Options Available'
          : landType === 'Vacant Land'
            ? 'Land'
            : 'House',
      filenotes,
    }
  }
}

/**
 * Determines if the given address represents a multi-unit property.
 *
 * @param address - The address string to check. Can be undefined.
 * @returns `true` if the address contains more than one unit, `false` if it contains one or zero units, or `undefined` if the address is not provided.
 */
export const isMultiUnit = (
  address: string | undefined,
): boolean | undefined => {
  const result = extractNumbers(address)
  if (!result) return undefined
  return result > 1
}

/**
 * Sanitizes a given name string by removing specific unwanted characters,
 * normalizing spaces, trimming, and removing control characters.
 *
 * The function also checks if the sanitized name is one of the invalid names
 * (e.g., "No", "False", "N", "F", "Yes", "True", "Y", "T", "NA") and returns
 * `undefined` if it is.
 *
 * @param name - The name string to sanitize. It can be `undefined`.
 * @returns The sanitized name string, or `undefined` if the input is `undefined`,
 *          the sanitized result is empty, or the sanitized name is an invalid name.
 */
export const sanitizeName = (name?: string): string | undefined => {
  if (!name) return undefined

  let sanitized = name
    .replace(/[\|`'"\u00A0]/g, '') // Removes | ` ' " and non-breaking spaces
    .replace(/\s+/g, ' ') // Normalizes multiple spaces to a single space
    .trim()

  sanitized = sanitized
    .split('')
    .filter((char) => char >= ' ' && char !== '\u007F') // Removes ASCII ctrl chars (0x00-0x1F, 0x7F)
    .join('')

  if (!sanitized) return undefined

  const invalidNames = new Set([
    'No',
    'False',
    'N',
    'F',
    'Yes',
    'True',
    'Y',
    'T',
    'NA',
    'N/A',
    'Not Applicable',
    'Nil',
    'None',
    'Undefined',
    'Unknown',
    'Y.',
    'N.',
    '-',
    '--',
    '__',
    'Fail',
    'Off',
    'On',
    'Disabled',
    'Inactive',
    '0',
  ])
  return invalidNames.has(sanitized) ? undefined : sanitized
}

export type PlanNumber = {
  planType: string | undefined
  planNumber: string | undefined
}

/**
 * Extracts plan numbers from a string.
 *
 * @param input - The string to extract plan numbers from.
 * @returns An array of plan numbers found in the string. Returns an empty array if no plan numbers are found or if the input is null/undefined.
 */
export const getPlanNumbers = (input: string): PlanNumber[] => {
  if (!input) return []

  const result: PlanNumber[] = []
  const matchedIndexes = new Set<number>()

  // 1. Match known plan types with numbers
  const knownRegex = /\b(SP|BUP|GTP|CPW|RP)\s*(\d+)\b/gi
  for (const match of input.matchAll(knownRegex)) {
    const [_, type, number] = match
    const index = match.index ?? 0
    matchedIndexes.add(index)

    result.push(
      type.toUpperCase() === 'CPW'
        ? { planType: 'CP', planNumber: `W${number}` }
        : { planType: type.toUpperCase(), planNumber: number },
    )
  }

  // 2. Match known plan prefixes without numbers → planNumber: undefined
  const orphanPrefixRegex = /\b(SP|BUP|GTP|CPW|RP)\b(?!\s*\d+)/gi
  for (const match of input.matchAll(orphanPrefixRegex)) {
    const type = match[1].toUpperCase()
    const index = match.index ?? 0

    if ([...matchedIndexes].some((i) => Math.abs(i - index) < 10)) continue

    result.push(
      type === 'CPW'
        ? { planType: 'CP', planNumber: undefined }
        : { planType: type, planNumber: undefined },
    )
  }

  // 3. Match standalone numbers → planType: undefined
  const numberRegex = /\b\d+\b/g
  for (const match of input.matchAll(numberRegex)) {
    const number = match[0]
    const index = match.index ?? 0

    if ([...matchedIndexes].some((i) => Math.abs(i - index) < 10)) continue

    result.push({ planType: undefined, planNumber: number })
  }

  return result
}

export const parsePlanType = (input?: string): string | undefined => {
  if (!input) return undefined

  const normalizedInput = input.trim().toLowerCase()

  const directAbbreviations = new Set(['gtp', 'sp', 'cp', 'rp', 'bup'])
  if (directAbbreviations.has(normalizedInput)) {
    return normalizedInput.toUpperCase()
  }

  const planTypeMapping: Record<string, string> = {
    'group titles plan': 'GTP',
    'group titles': 'GTP',
    'survey plan': 'SP',
    'crown plan': 'CP',
    'registered plan': 'RP',
    'building unit plan': 'BUP',
    'building unit': 'BUP',
    'building unit plan (bup)': 'BUP',
  }

  // Direct lookup first
  if (planTypeMapping[normalizedInput]) {
    return planTypeMapping[normalizedInput]
  }

  // Partial word matching
  const partialMatches: [string, string][] = [
    ['building', 'BUP'],
    ['group', 'GTP'],
    ['survey', 'SP'],
    ['crown', 'CP'],
    ['registered', 'RP'],
  ]

  for (const [keyword, abbreviation] of partialMatches) {
    if (normalizedInput.includes(keyword)) {
      return abbreviation
    }
  }

  return undefined
}

export const createTitleRef = (lotCount: number, title: string): string[] => {
  if (!title || lotCount <= 0) return []

  const separators = /[,\-\s]+/
  const parts = title
    .split(separators)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (parts.length === 0) return []
  const firstValue = parts[0]
  const padded = Array.from(
    { length: Math.min(lotCount, 4) },
    (_, i) => parts[i] ?? firstValue,
  )
  return padded
}

export const isOnlyPlanTypesOrPlanNumber = (
  plans: PlanNumber[],
  key: keyof PlanNumber,
): boolean => {
  return plans.every((plan) => plan[key] === undefined)
}

export const formatSellerNames = (sellers: BtrSdsPerson[]): string => {
  const names = sellers
    .map((s) => {
      const name = s.full_name
      if (isCompany(name)) {
        return name
      }
      return name.split(/\s+/).filter(Boolean).pop() ?? ''
    })
    .filter(Boolean)

  return names.join(' and ')
}

/**
 * Composes a matter name string based on the provided sellers and test mode flag.
 *
 * The resulting string includes the formatted seller names, optionally prefixed with "TEST-" if in test mode,
 * and suffixed with "sale to TBA".
 *
 * @param sellers - An array of `BtrSdsPerson` objects representing the sellers.
 * @param isTestMode - A boolean indicating whether the matter is in test mode.
 * @returns The composed matter name string.
 */
export const composeMatterName = (
  sellers: BtrSdsPerson[],
  isTestMode: boolean,
): string => {
  const sellerNames = formatSellerNames(sellers)
  return `${isTestMode ? 'TEST-' : ''}${sellerNames} sale to TBA`
}
