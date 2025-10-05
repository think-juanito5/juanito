import type { PagedParticipants } from '@dbc-tech/actionstep'
import type { MatterCreateNewParticipant } from '@dbc-tech/johnny5/typebox'
import { formatPhoneIntl } from '@dbc-tech/johnny5/utils'
import { BtrActionstepRoles } from '../../johnny5/btr/constants'
import {
  fmtSubsectionParticipant,
  getPersonOrCompanyName,
} from '../../johnny5/btr/utils/string-utils'

export type ParticipantSearchOptions = {
  id: number
  firstName?: string
  middleName?: string
  lastName?: string
  companyName?: string
  email?: string
  isCompany: boolean
  phone1?: string
  phone2?: string
  timestamp: string
}

export const getPaticipantAddresses = (
  addresses: Record<string, string | undefined | null>[],
) => {
  let physicalAddr: Record<string, string | undefined | null> = {}
  let mailingAddr: Record<string, string | undefined | null> = {}

  if (addresses?.length) {
    if (addresses.length === 1) {
      const address = addresses[0]
      physicalAddr = address
      mailingAddr = address
    } else {
      addresses.forEach((address) => {
        if (address.type === 'physical') {
          physicalAddr = address
        } else if (address.type === 'mailing') {
          mailingAddr = address
        }
      })
    }
  }
  return { physicalAddr, mailingAddr }
}

export const getParticipantPhoneNumbers = (
  phoneNumbers: { number: string; label?: string | null }[] = [],
): string[] => {
  const mobileEntry = phoneNumbers.find(({ label }) => label === 'mobile')
  const others = phoneNumbers.filter(({ label }) => label !== 'mobile')

  const orderedNumbers = [
    others.length > 0 ? others[0] : { number: '', label: '' }, // Phone 1
    mobileEntry ?? { number: '', label: '' }, // Phone 2 (Exclusive for Mobile)
    ...others.slice(1), // Phone 3 and onward
  ]

  const result = orderedNumbers.flatMap(({ number, label }) => [
    number,
    label === 'mobile' ? 'Mobile' : (label ?? ''),
  ])

  return [...result, '', '', '', '', '', '', ''].slice(0, 8)
}

export const buildSearch = (
  participant: MatterCreateNewParticipant,
): Record<string, string>[] => {
  const { details } = participant
  const { is_company, company_name, first_name, last_name, middle_name } =
    details

  if (is_company) {
    if (!company_name)
      throw new Error('Missing company name for company participant')

    const base: Record<string, string> = {
      companyName_ilike: company_name,
      isCompany: 'T',
    }
    return [base]
  } else {
    if (!first_name || !last_name)
      throw new Error(
        'Missing first name or last name for individual participant',
      )

    const base: Record<string, string> = {
      firstName: first_name,
      lastName: last_name,
      isCompany: 'F',
      ...(middle_name && { middleName: middle_name }),
    }
    return [base]
  }
}

export const getParticipantName = ({
  details,
}: MatterCreateNewParticipant): string => {
  if (details.is_company) {
    if (!details.company_name)
      throw new Error('Missing company name for company participant')
    return details.company_name
  }
  if (!details.last_name)
    throw new Error('Missing last name for individual participant')
  return details.last_name
}

export type SearchParticipantResult = {
  count: number
  matchedParticipant?: ParticipantSearchOptions
}

export const processRetrievedParticipants = (
  participants: ParticipantSearchOptions[],
  { details }: MatterCreateNewParticipant,
): SearchParticipantResult | undefined => {
  if (!participants.length) return undefined

  const { is_company, email_address, phones_numbers, company_name } = details
  const phoneNumber = formatPhoneIntl(phones_numbers?.[0]?.number)
  const emailAddress = email_address?.trim() || undefined
  const companyName = company_name?.trim().toLowerCase() || undefined

  const hasPhone = Boolean(phoneNumber)
  const hasEmail = Boolean(emailAddress)

  const matches = participants.filter((p) => {
    const emailMatch = hasEmail && p.email === emailAddress
    const phoneMatch =
      hasPhone &&
      [p.phone1, p.phone2].some(
        (phone) => phone && formatPhoneIntl(phone) === phoneNumber,
      )
    const companyMatch =
      companyName && p.companyName?.trim().toLowerCase() === companyName

    if (!is_company) {
      if (hasPhone && hasEmail) return emailMatch && phoneMatch
      if (hasPhone) return phoneMatch
      if (hasEmail) return emailMatch
      return false
    }

    if (hasPhone && hasEmail && companyMatch)
      return emailMatch && phoneMatch && companyMatch
    if (hasPhone && companyMatch) return phoneMatch && companyMatch
    if (hasEmail && companyMatch) return emailMatch && companyMatch
    return Boolean(companyMatch)
  })

  const getLatest = (
    p: ParticipantSearchOptions[],
  ): ParticipantSearchOptions | undefined => {
    return p.reduce((latest, current) =>
      new Date(latest.timestamp).getTime() >
      new Date(current.timestamp).getTime()
        ? latest
        : current,
    )
  }

  return matches.length > 0
    ? { count: matches.length, matchedParticipant: getLatest(matches) }
    : undefined
}

export const getMapParticipants = (
  pagedRes: PagedParticipants,
): ParticipantSearchOptions[] => {
  const participantsArray: ParticipantSearchOptions[] =
    pagedRes.participants.map((pcpt) => {
      return {
        id: pcpt.id,
        firstName: pcpt.firstName ?? undefined,
        middleName: pcpt.middleName ?? undefined,
        lastName: pcpt.lastName ?? undefined,
        companyName: pcpt.companyName ?? undefined,
        email: pcpt.email ?? undefined,
        isCompany: pcpt.isCompany === 'T' ? true : false,
        phone1: pcpt.phone1Number ?? undefined,
        phone2: pcpt.phone2Number ?? undefined,
        timestamp: pcpt.modifiedTimestamp!,
      }
    })
  return participantsArray
}

export const getFilenotesParticipantName = (
  participant: MatterCreateNewParticipant,
  res: Record<string, string>,
) => {
  const { details: dt } = participant
  const company_name = res?.companyName || dt?.company_name
  const firstname = res?.firstName || dt?.first_name
  const middlename = res?.middleName || dt?.middle_name || ''
  const lastname = res?.lastName || dt?.last_name
  const is_company = dt?.is_company

  return getPersonOrCompanyName({
    is_company,
    company_name,
    firstname,
    middlename,
    lastname,
  })
}

export const getParticipantInfoForFilenote = (
  participant: MatterCreateNewParticipant,
  searchParam: Record<string, string>,
): { participantType: string; participantName: string } => {
  const role = BtrActionstepRoles[participant.type_id]
  const response = {
    participantType:
      role ?? fmtSubsectionParticipant(participant.description ?? ''),
    participantName: getFilenotesParticipantName(participant, searchParam),
  }

  return response
}
