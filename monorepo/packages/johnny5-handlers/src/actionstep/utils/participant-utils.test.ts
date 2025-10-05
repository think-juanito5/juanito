import { describe, expect, it } from 'bun:test'
import { type MatterCreateNewParticipant } from '@dbc-tech/johnny5'
import { buildSearch } from './participant-utils'
import {
  type ParticipantSearchOptions,
  processRetrievedParticipants,
} from './participant-utils'

describe.each([
  {
    description:
      'should return search records for a company participant with email & phone number',
    participant: {
      details: {
        is_company: true,
        company_name: 'Test Company',
        email_address: 'test@example.com',
        phones_numbers: [{ number: '1234567890' }],
      },
    } as MatterCreateNewParticipant,
    expectedRecords: [
      {
        companyName_ilike: 'Test Company',
        isCompany: 'T',
      },
    ],
  },
  {
    description:
      'should return search records for an individual participant with email & phone number ',
    participant: {
      details: {
        is_company: false,
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john.doe@example.com',
        phones_numbers: [{ number: '+61 (7) 5467 2057' }],
      },
    } as MatterCreateNewParticipant,
    expectedRecords: [
      {
        firstName: 'John',
        lastName: 'Doe',
        isCompany: 'F',
      },
    ],
  },
])('buildSearch', ({ participant, expectedRecords, description }) => {
  it(`${description} => search records`, () => {
    const searchParams = buildSearch(participant)
    expect(searchParams).toEqual(expectedRecords as [])
  })
})

describe('processRetrievedParticipants', () => {
  const mockParticipants: ParticipantSearchOptions[] = [
    {
      id: 0,
      firstName: 'John',
      lastName: 'Doe',
      isCompany: false,
      email: 'jd@test.com',
      phone1: '+61 455 441 025',
      timestamp: '2024-12-03T12:18:43+11:00',
    },
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      isCompany: false,
      email: 'jd@test.com',
      phone1: '+61 455 441 026',
      timestamp: '2024-12-03T12:19:53+11:00',
    },
    {
      id: 2,
      companyName: 'Test Company',
      isCompany: true,
      email: 'test.company@test.com',
      phone1: '+61 7 5467 2057',
      timestamp: '2024-12-03T12:18:43+11:00',
    },
    {
      id: 3,
      firstName: 'Jane',
      lastName: 'Smith',
      isCompany: false,
      email: 'js@test.com',
      phone2: '0455441026',
      timestamp: '2024-12-04T12:18:43+11:00',
    },
    {
      id: 4,
      firstName: 'Jane',
      lastName: 'Smith',
      isCompany: false,
      phone1: '+61 (0) 400 111 111',
      timestamp: '2024-12-03T12:18:43+11:00',
    },
    {
      id: 5,
      firstName: 'Jane',
      lastName: 'Smith',
      isCompany: false,
      phone1: '(07) 3456 7890',
      timestamp: '2024-12-01T12:18:43+11:00',
    },
    {
      id: 6,
      companyName: 'Test Company',
      isCompany: true,
      phone1: '0400 000 000',
      timestamp: '2024-12-02T12:18:43+11:00',
    },
    {
      id: 7,
      companyName: 'Test Company',
      isCompany: true,
      email: 'test7@test.com',
      phone1: '0400 000 000',
      timestamp: '2024-12-03T12:18:43+11:00',
    },
    {
      id: 8,
      companyName: 'Test API Company',
      isCompany: true,
      email: 'test8@test.com',
      phone2: '(07) 3456 7890',
      timestamp: '2024-12-04T12:18:43+11:00',
    },
    {
      id: 9,
      companyName: 'latest Company',
      isCompany: true,
      email: 'test9@test.com',
      phone2: '(07) 3456 7890',
      timestamp: '2025-12-03T12:18:43+11:00',
    },
    {
      id: 10,
      companyName: 'ABC XYZ/Test Company',
      isCompany: true,
      email: 'test10@test.com',
      phone1: '0400 100 000',
      timestamp: '2024-12-03T12:18:43+11:00',
    },
    {
      id: 11,
      firstName: 'Susie',
      lastName: 'Faulkner',
      companyName: 'BTt bythetest',
      email: 'susie.faulkner@bythetest.com',
      isCompany: false,
      phone1: '0455 086 710',
      timestamp: '2025-02-20T13:28:37+11:00',
    },
    {
      id: 12,
      firstName: 'Susie',
      lastName: 'Faulkner',
      companyName: 'BTt bythetest',
      email: 'susie.faulkner@bythetest.com',
      isCompany: false,
      phone1: '0455 086 710',
      timestamp: '2025-04-05T16:03:30+11:00',
    },
  ]

  it('should return participants array case#1', () => {
    const participant = {
      details: {
        is_company: false,
        first_name: 'ignore',
        last_name: 'ignore',
        email_address: 'jd@test.com',
        phones_numbers: [{ number: '455 441 025' }],
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)

    expect(result).toEqual({
      count: 1,
      matchedParticipant: mockParticipants[0],
    })
  })

  it('should return participants array case#2', () => {
    const participant = {
      details: {
        is_company: false,
        first_name: 'ignore',
        last_name: 'ignore',
        phones_numbers: [{ number: '455 441 026' }],
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toEqual({
      count: 2,
      matchedParticipant: mockParticipants[3],
    })
  })

  it('should return participants array case#3', () => {
    const participant = {
      details: {
        is_company: false,
        first_name: 'ignore',
        last_name: 'ignore',
        email_address: 'jd@test.com',
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toEqual({
      count: 2,
      matchedParticipant: mockParticipants[1],
    })
  })

  it('should return participants array case#4', () => {
    const participant = {
      details: {
        is_company: false,
        first_name: 'ignore',
        last_name: 'ignore',
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toBeUndefined()
  })

  it('should return all participants array case#5 - company get latest', () => {
    const participant = {
      details: {
        is_company: true,
        company_name: 'latest company',
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toEqual({
      count: 1,
      matchedParticipant: mockParticipants[9],
    })
  })

  it('should return participants array case#6 - company', () => {
    const participant = {
      details: {
        is_company: true,
        company_name: 'test company',
        phones_numbers: [{ number: '+61400000000' }],
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toEqual({
      count: 2,
      matchedParticipant: mockParticipants[7],
    })
  })

  it('should return participants array case#7 - company', () => {
    const participant = {
      details: {
        is_company: true,
        company_name: 'Abc xyz/test company ',
        email_address: 'test10@test.com',
        phones_numbers: [{ number: '+61400100000' }],
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toEqual({
      count: 1,
      matchedParticipant: mockParticipants[10],
    })
  })

  it('should return participants array case#8 - company with space issue', () => {
    const participant = {
      details: {
        is_company: true,
        company_name: '   test api COMPANY   ',
        email_address: 'test8@test.com',
        phones_numbers: [{ number: '+61734567890' }],
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toEqual({
      count: 1,
      matchedParticipant: mockParticipants[8],
    })
  })

  it('should return participants array case#9 - not found company', () => {
    const participant = {
      details: {
        is_company: true,
        company_name: 'ignore',
        email_address: 'notfoun@test.com',
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toBeUndefined()
  })

  it('should return participants array case#10 - not found individual', () => {
    const participant = {
      details: {
        is_company: false,
        first_name: 'ignore',
        last_name: 'ignore',
        email_address: 'does.not.exist@test.com',
        phones_numbers: [{ number: '+61400000000' }],
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toBeUndefined()
  })

  it('should return participants array case#11 - empty identification', () => {
    const participant = {
      details: {
        is_company: false,
        first_name: 'Susie',
        last_name: 'Faulkner',
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toBeUndefined()
  })

  it('should return participants array case#12 - full search', () => {
    const participant = {
      details: {
        is_company: false,
        first_name: 'Susie',
        last_name: 'Faulkner',
        email_address: 'susie.faulkner@bythetest.com',
        phones_numbers: [{ number: '0455 086 710' }],
      },
    } as MatterCreateNewParticipant
    const result = processRetrievedParticipants(mockParticipants, participant)
    expect(result).toEqual({
      count: 2,
      matchedParticipant: mockParticipants[12],
    })
  })
})
