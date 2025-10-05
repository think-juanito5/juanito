import { describe, expect, it, test } from 'bun:test'
import type { MatterCreateDetailAddress } from '@dbc-tech/johnny5/typebox'

import {
  type ExtractedNameResponse,
  buildDealAddress,
  createPropertyParticipantName,
  extractName,
  getFirstnameOrLastname,
  isCompany,
  splitName,
} from './data-utils'

describe('extractName', () => {
  test('should return name details in extractName #case1', () => {
    const name1 = 'Lebron S. Davis'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'Lebron',
      middlename: 'S.',
      lastname: 'Davis',
    })
  })

  test('should return name details in extractName #case2', () => {
    const name1 = 'Lebron S. Davis'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'Lebron',
      middlename: 'S.',
      lastname: 'Davis',
    })
  })

  test('should return name details in extractName #case3', () => {
    const name1 = 'Lebron Davis'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'Lebron',
      lastname: 'Davis',
    })
  })

  test('should return name details in extractName #case3', () => {
    const name1 = 'Michale J. Fox'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'Michale',
      middlename: 'J.',
      lastname: 'Fox',
    })
  })

  test('should return name details in extractName #case4', () => {
    const name1 = 'Eric Michael Mathew Fox'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'Eric',
      middlename: 'Michael',
      lastname: 'Mathew Fox',
    })
  })

  test('should return name details in extractName #case5', () => {
    const name1 = 'John Alex Smith West'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'John',
      middlename: 'Alex',
      lastname: 'Smith West',
    })
  })

  test('should return name details in extractName #case6', () => {
    const name1 = 'John Alex Smith West'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'John',
      middlename: 'Alex',
      lastname: 'Smith West',
    })
  })

  test('should return name details in extractName #case7', () => {
    const name1 = 'John Alex Smith West Trumpet'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'John',
      middlename: 'Alex',
      lastname: 'Smith West Trumpet',
    })
  })

  test('should return name details in extractName #case8', () => {
    const name1 = 'John Alex Smith West Trumpet'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'John',
      middlename: 'Alex',
      lastname: 'Smith West Trumpet',
    })
  })

  test('should return name details in extractName #case9', () => {
    const name1 = 'John'
    const response = extractName(name1)
    expect(response).toEqual({
      firstname: 'John',
      lastname: 'John',
    })
  })
})

describe('splitName', () => {
  test('should return name details in splitName #case0', () => {
    const name1 = 'Suzanne Perrett'
    const response = splitName(name1)
    expect(response).toEqual(['Suzanne Perrett', 'Suzanne', 'Perrett'])
  })

  test('should return name details in splitName #case1', () => {
    const name1 = 'King Lebron Davis'
    const response = splitName(name1)
    expect(response).toEqual(['King Lebron Davis', 'King', 'Lebron', 'Davis'])
  })

  test('should return name details in splitName #case2', () => {
    const name1 = 'Jane Davis'
    const response = splitName(name1)
    expect(response).toEqual(['Jane Davis', 'Jane', 'Davis'])
  })
})

describe('isCompany', () => {
  describe.each([
    ['ABC Pty Ltd', true],
    ['XYZ Limited', true],
    ['123 Ltd', true],
    ['Acme Agency', true],
    ['Example Inc', true],
    ['Test Co', true],
    ['Test James Co', true],
    ['Test James Consuelo', false],
    ['Test James Consuelo Corp', true],
    ['Test Co.', true],
    ['Test Corp', true],
    ['Test Corpuz', false],
    ['Demo Corp', true],
    ['Global Corporation', true],
    ['Local Offices', true],
    ['Smith Law', true],
    ['Best Group', true],
    ['Elite Associates', true],
    ['Top Partners', true],
    ['Prime Firm', true],
    ['Expert Consultants', true],
    ['United Holdings', true],
    ['Dynamic Enterprises', true],
    ['Strategic Investments', true],
    ['Secure Trust', true],
    ['Professional Management', true],
    ['Charity Foundation', true],
    ['Advanced Incorporated', true],
    ['Modern LLP', true],
    ['Green Cooperative', true],
    ['Family Co-op', true],
    ['National Association', true],
    ['Governing Board', true],
    ['Joint Consortium', true],
    ['World Federation', true],
    ['John Doe', false],
    ['Jane Smith', false],
    ['Individual', false],
    ['Mr. Lebron S. Davis', false],
    ['Davis Group', true],
    ['Davis.com.au', true],
    ['www.conveyancing.com.au', true],
    ['www conveyancing', true],
    ['Mcdo Cooperative', true],
    ['www.conveyancing.com.au', true],
    ['Mr Eddie S. Davis', false],
    ['Lebron Swabe Jones', false],
    ['Kobe Bayan', false],
    ['Eric Lebron Jones Castro', false],
    ['Ray White Rural Kilcoy', true],
    ['ray white rural kilcoy', true],
    ['Constance Fay Wallace', false],
    ['constance fay wallace', false],
    ['By The Rules Conveyancing', true],
    ['bytherules Conveyancing', true],
    ['By the rules', true],
    ['by the rules conveyancing', true],
    ['bytherules conveyancing', true],
    ['by the rules', true],
    ['test rulesa', false],
    ['', false],
  ])('.isCompany(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(isCompany(input as string)).toBe(expected)
    })
  })
})

describe('createPropertyParticipantName', () => {
  test('should return formatted address when all fields are provided', () => {
    const address = {
      line1: '123 Main St',
      line2: 'Apt 4B',
      suburb: 'Springfield',
      state: 'NSW',
      postcode: '62704',
    }
    const result = createPropertyParticipantName(
      address as MatterCreateDetailAddress,
    )
    expect(result).toBe('123 Main St, Apt 4B, Springfield, NSW, 62704')
  })

  test('should return formatted address when some fields are missing', () => {
    const address = {
      line1: '123 Main St',
      suburb: 'Springfield',
      state: 'VIC',
    }
    const result = createPropertyParticipantName(
      address as MatterCreateDetailAddress,
    )
    expect(result).toBe('123 Main St, Springfield, VIC')
  })

  test('should return undefined when address is not provided', () => {
    const address = {
      line1: '',
      line2: undefined,
      suburb: '',
      state: '',
      postcode: '',
    }
    const result = createPropertyParticipantName(
      address as MatterCreateDetailAddress,
    )
    expect(result).toBeUndefined()
  })

  test('should return formatted address when only one field is provided', () => {
    const address = {
      line1: '123 Main St',
    }
    const result = createPropertyParticipantName(
      address as MatterCreateDetailAddress,
    )
    expect(result).toBe('123 Main St')
  })

  test('should return undefined when all fields are empty or undefined', () => {
    const address = undefined
    const result = createPropertyParticipantName(address)
    expect(result).toBeUndefined()
  })

  test('should return QLD state when all fields are empty or undefined except state', () => {
    const address = {
      line1: '',
      line2: undefined,
      suburb: '',
      state: 'QLD',
      postcode: '',
    }
    const result = createPropertyParticipantName(
      address as MatterCreateDetailAddress,
    )
    expect(result).toBe('QLD')
  })

  test('should return VIC state and postcode', () => {
    const address = {
      line1: '',
      line2: undefined,
      suburb: '',
      state: 'VIC',
      postcode: '1234',
    }
    const result = createPropertyParticipantName(
      address as MatterCreateDetailAddress,
    )
    expect(result).toBe('VIC, 1234')
  })
})

describe('buildDealAddress', () => {
  test('should return a complete MatterCreateDetailAddress when all fields are provided', () => {
    const input = {
      postCode: '1234',
      stateId: '12', //11-QLD 12-VIC 13-NSW
      streetName: 'Main St',
      streetNo: '123',
      streetType: 'Avenue',
      suburb: 'Springfield',
      unitNo: '4B',
    }
    const result = buildDealAddress(input)
    expect(result).toEqual({
      line1: '4B/123 Main St Avenue',
      postcode: '1234',
      state: 'VIC',
      suburb: 'Springfield',
      type: 'physical',
    })
  })

  test('should return undefined when all fields are empty or undefined', () => {
    const input = {
      postCode: undefined,
      stateId: undefined,
      streetName: undefined,
      streetNo: undefined,
      streetType: undefined,
      suburb: undefined,
      unitNo: undefined,
    }
    const result = buildDealAddress(input)
    expect(result).toBeUndefined()
  })

  test('should return a partial MatterCreateDetailAddress when some fields are provided', () => {
    const input = {
      postCode: '5678',
      stateId: '11', //11-QLD 12-VIC 13-NSW
      streetName: 'Elm St',
      streetNo: undefined,
      streetType: undefined,
      suburb: 'Shelbyville',
      unitNo: undefined,
    }
    const result = buildDealAddress(input)
    expect(result).toEqual({
      line1: 'Elm St',
      postcode: '5678',
      state: 'QLD',
      suburb: 'Shelbyville',
      type: 'physical',
    })
  })

  test('should handle unitNo and streetNo formatting correctly', () => {
    const input = {
      postCode: '4321',
      stateId: '13', //11-QLD 12-VIC 13-NSW
      streetName: 'Oak St',
      streetNo: '789',
      streetType: 'Boulevard',
      suburb: 'Capital City',
      unitNo: '12A',
    }
    const result = buildDealAddress(input)
    expect(result).toEqual({
      line1: '12A/789 Oak St Boulevard',
      postcode: '4321',
      state: 'NSW',
      suburb: 'Capital City',
      type: 'physical',
    })
  })

  test('should return unformatted streetNo if unitNo is empty', () => {
    const input = {
      postCode: '9999',
      stateId: '111', //11-QLD 12-VIC 13-NSW
      streetName: 'Pine St',
      streetNo: '456',
      streetType: 'Road',
      suburb: 'Evergreen Terrace',
      unitNo: '',
    }
    const result = buildDealAddress(input)
    expect(result).toEqual({
      line1: '456 Pine St Road',
      postcode: '9999',
      state: undefined,
      suburb: 'Evergreen Terrace',
      type: 'physical',
    })
  })

  test('should return undefined for state if stateId is invalid', () => {
    const input = {
      postCode: '9999',
      stateId: '111', //11-QLD 12-VIC 13-NSW
      streetName: 'Pine St',
      streetNo: '456',
      streetType: 'Road',
      suburb: 'Evergreen Terrace',
      unitNo: '1B',
    }
    const result = buildDealAddress(input)
    expect(result).toEqual({
      line1: '1B/456 Pine St Road',
      postcode: '9999',
      state: undefined,
      suburb: 'Evergreen Terrace',
      type: 'physical',
    })
  })
})

type GetFirstnameOrLastnameTestCases = {
  firstName?: string
  lastName?: string
  expected?: ExtractedNameResponse
}
describe('getFirstnameOrLastname', () => {
  test.each<GetFirstnameOrLastnameTestCases>([
    { firstName: undefined, lastName: undefined, expected: undefined },
    { lastName: 'Doe', expected: { lastName: 'Doe' } },
    {
      firstName: 'John',
      expected: { firstName: 'John' },
    },
    {
      firstName: 'John Doe',
      expected: { firstName: 'John', lastName: 'Doe' },
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      expected: { firstName: 'John', lastName: 'Doe' },
    },
    {
      firstName: 'John Michael',
      expected: { firstName: 'John', lastName: 'Michael' },
    },
    {
      lastName: 'Michael Smith',
      expected: { firstName: 'Michael', lastName: 'Smith' },
    },
    {
      firstName: 'John Michael',
      lastName: 'Smith Jr.',
      expected: { firstName: 'John Michael', lastName: 'Smith Jr.' },
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      expected: { firstName: 'John', lastName: 'Smith' },
    },
    {
      firstName: 'John Smith',
      lastName: 'Jones Boo Bar',
      expected: { firstName: 'John Smith', lastName: 'Jones Boo Bar' },
    },
    {
      firstName: '',
      lastName: 'Jones Boo Bar',
      expected: { firstName: 'Jones', lastName: 'Boo Bar' },
    },
  ])(
    'should handle firstname: $firstName and lastname: $lastName correctly',
    ({ firstName, lastName, expected }) => {
      const result = getFirstnameOrLastname(firstName, lastName)
      expect(result).toEqual(expected)
    },
  )
})
