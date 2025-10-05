import { describe, expect, it } from 'bun:test'
import type { BtrSdsPerson } from '@dbc-tech/johnny5/typebox'
import { type Intent, capitalizePlus } from '@dbc-tech/johnny5/utils'
import {
  type ContractLayoutResponse,
  type LayoutNameType,
  type NaturePropertySubConvType,
  type OcrPropertyFields,
  type PersonName,
  type PersonOrCompanyName,
  composeMatterName,
  createTitleRef,
  extractEmails,
  extractLotNumbers,
  extractPALayoutResponse,
  extractTitleReference,
  fmtSubsectionParticipant,
  getNaturePropAndSubConvType,
  getPersonName,
  getPersonOrCompanyName,
  getPlanNumbers,
  isMultiUnit,
  parsePlanType,
  propertyNoteMsgs as propMsg,
  sanitizeName,
} from './string-utils'

describe('string-utils > extractPALayoutResponse', () => {
  describe.each([
    [
      'QLD-REIQ-House_and_Land',
      { type: 'REIQ', houseAndLand: true, communityTitles: false },
    ],
    [
      'QLD-REIQ-House-and-Land',
      { type: 'REIQ', houseAndLand: true, communityTitles: false },
    ],
    [
      'QLD-REIQ-House_and_Land',
      { type: 'REIQ', houseAndLand: true, communityTitles: false },
    ],
    [
      'QLD-REIQ-House-Land',
      { type: 'REIQ', houseAndLand: true, communityTitles: false },
    ],
    [
      'QLD-ADL-community_titles',
      { type: 'ADL', houseAndLand: false, communityTitles: true },
    ],
    [
      'QLD-ADL-community-titles',
      { type: 'ADL', houseAndLand: false, communityTitles: true },
    ],
    [
      'QLD-ADL-community titles',
      { type: 'ADL', houseAndLand: false, communityTitles: true },
    ],
    ['', undefined],
    [
      'QLD-ADL-community-titles',
      { type: 'ADL', houseAndLand: false, communityTitles: true },
    ],
    [
      'QLD-REIQ-House-and-Land-Test',
      { type: 'REIQ', houseAndLand: true, communityTitles: false },
    ],
  ])('.extractPALayoutResponse(%p)', (input, expected) => {
    it(`returns ${JSON.stringify(expected)}`, () => {
      expect(extractPALayoutResponse(input as LayoutNameType)).toEqual(
        expected as ContractLayoutResponse,
      )
    })
  })
})

describe('string-utils > capitalizePlus', () => {
  describe.each([
    ['hello', 'Hello'],
    ['hello world', 'Hello World'],
    ['hello-world', 'Hello-World'],
    ['mcdonald', 'McDonald'],
    ['mckinley', 'McKinley'],
    ['', undefined],
    [undefined, undefined],
    ['hElLo WoRLd', 'Hello World'],
    ['hello   world', 'Hello   World'],
    ['ABC PROPERTY LTD', 'Abc Property Ltd'],
  ])('.capitalizePlus(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(capitalizePlus(input as string)).toEqual(expected as string)
    })
  })
})

describe('string-utils > extractTitleReference', () => {
  describe.each([
    ['123 & 345', ['123', '345']],
    ['12345 and 6789', ['12345', '6789']],
    ['12345 | 6789', ['12345', '6789']],
    ['12345 & 6789 and 101112', ['12345', '6789', '101112']],
    ['12345', ['12345']],
    ['Title1 & Title2', ['Title1', 'Title2']],
    ['Title1 and Title2', ['Title1', 'Title2']],
    ['Title1 | Title2', ['Title1', 'Title2']],
    ['Title1 & Title2 and Title3', ['Title1', 'Title2', 'Title3']],
    ['Title1|Title2|Title3', ['Title1', 'Title2', 'Title3']],
    ['Title1', ['Title1']],
    ['', undefined],
    [undefined, undefined],
  ])('.extractTitleReference(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(extractTitleReference(input as string)).toEqual(
        expected as string[],
      )
    })
  })

  describe('extractLotNumbers', () => {
    it('should return an empty array for undefined input', () => {
      expect(extractLotNumbers(undefined)).toEqual([])
    })

    it('should return an empty array for empty string', () => {
      expect(extractLotNumbers('')).toEqual([])
    })

    it('should extract simple lot numbers with "lot" prefix', () => {
      expect(extractLotNumbers('lot 123')).toEqual([123])
      expect(extractLotNumbers('Lot 456')).toEqual([456])
      expect(extractLotNumbers('LOT 789')).toEqual([789])
    })

    it('should extract lot numbers with "lot no" prefix', () => {
      expect(extractLotNumbers('lot no 123')).toEqual([123])
      expect(extractLotNumbers('lot no. 456')).toEqual([456])
      expect(extractLotNumbers('Lot No. 789')).toEqual([789])
      expect(extractLotNumbers('Lot Number 321')).toEqual([321])
    })

    it('should extract lot numbers with "L" prefix', () => {
      expect(extractLotNumbers('L123')).toEqual([123])
      expect(extractLotNumbers('L 456')).toEqual([456])
      expect(extractLotNumbers('L. 789')).toEqual([789])
    })

    it('should extract multiple lot numbers from a single string', () => {
      expect(extractLotNumbers('lot 123, lot 456')).toEqual([123, 456])
      expect(extractLotNumbers('L123 and Lot No. 456')).toEqual([123, 456])
      expect(
        extractLotNumbers('Property contains Lot 123, Lot 456, and Lot 789'),
      ).toEqual([123, 456, 789])
    })

    it('should extract lot numbers from text without explicit prefixes', () => {
      expect(extractLotNumbers('123')).toEqual([123])
      expect(extractLotNumbers('Property 123')).toEqual([123])
    })

    it('should extract lot numbers with lower-case prefix', () => {
      expect(extractLotNumbers('l1')).toEqual([1])
      expect(extractLotNumbers('l 1')).toEqual([1])
    })

    it('should extract lot numbers separated with slashes', () => {
      expect(extractLotNumbers('4/5/6/7')).toEqual([4, 5, 6, 7])
    })

    it('should extract lot numbers from sentences', () => {
      expect(
        extractLotNumbers('The property is located at lot 123 Smith Street'),
      ).toEqual([123])
      expect(
        extractLotNumbers('We are selling lots 123, 456, and 789'),
      ).toEqual([123, 456, 789])
      expect(
        extractLotNumbers('Contract for L123 and L456 on Smith Street'),
      ).toEqual([123, 456])
    })

    it('should handle complex mixed cases', () => {
      const complexCase =
        'Property includes Lot 123, L456, lot no. 789, and Lot Number 101'
      expect(extractLotNumbers(complexCase)).toEqual([123, 456, 789, 101])
    })

    it('should ignore non-numeric text', () => {
      expect(extractLotNumbers('Lot ABC')).toEqual([])
      expect(extractLotNumbers('No lot numbers here')).toEqual([])
    })
  })
})

describe('string-utils > extractEmails', () => {
  describe.each([
    ['test@example.com', ['test@example.com']],
    [
      'test@example.com, another@example.com',
      ['test@example.com', 'another@example.com'],
    ],
    [
      'test@example.com; another@example.com',
      ['test@example.com', 'another@example.com'],
    ],
    [
      'test@example.com | another@example.com',
      ['test@example.com', 'another@example.com'],
    ],
    [
      'test@example.com and another@example.com',
      ['test@example.com', 'another@example.com'],
    ],
    [
      'test@example.com/another@example.com',
      ['test@example.com', 'another@example.com'],
    ],
    [
      'test@example.com / another@example.com',
      ['test@example.com', 'another@example.com'],
    ],
    [
      'test@example.com, another@example.com; third@example.com',
      ['test@example.com', 'another@example.com', 'third@example.com'],
    ],
    [
      'test@example.com and another@example.com | third@example.com',
      ['test@example.com', 'another@example.com', 'third@example.com'],
    ],
    ['test@example.com', ['test@example.com']],
    ['test@example.com / invalid.test example com', ['test@example.com']],
    ['invalid test example com', undefined],
    ['', undefined],
    [undefined, undefined],
  ])('.extractEmails(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(extractEmails(input as string)).toEqual(expected as string[])
    })
  })
})

describe('string-utils', () => {
  describe('getPersonOrCompanyName', () => {
    it('should return the company name if is_company is true', () => {
      const input: PersonOrCompanyName = {
        is_company: true,
        company_name: 'Tech Corp',
        firstname: 'John',
        lastname: 'Doe',
      }
      const expectedOutput = 'Tech Corp'
      expect(getPersonOrCompanyName(input)).toBe(expectedOutput)
    })

    it('should return the person name if is_company is false', () => {
      const input: PersonOrCompanyName = {
        is_company: false,
        firstname: 'John',
        lastname: 'Doe',
      }
      const expectedOutput = 'John Doe'
      expect(getPersonOrCompanyName(input)).toBe(expectedOutput)
    })

    it('should return the person name if is_company is not provided', () => {
      const input: PersonOrCompanyName = {
        firstname: 'Jane',
        middlename: 'A.',
        lastname: 'Smith',
      }
      const expectedOutput = 'Jane A. Smith'
      expect(getPersonOrCompanyName(input)).toBe(expectedOutput)
    })

    it('should return an empty string if no name details are provided', () => {
      const input: PersonOrCompanyName = {}
      const expectedOutput = ''
      expect(getPersonOrCompanyName(input)).toBe(expectedOutput)
    })
  })

  describe('getPersonName', () => {
    it('should return the full name with first, middle, and last names', () => {
      const input: PersonName = {
        firstname: 'Jane',
        middlename: 'A.',
        lastname: 'Smith',
      }
      const expectedOutput = 'Jane A. Smith'
      expect(getPersonName(input)).toBe(expectedOutput)
    })

    it('should return the full name with first and last names', () => {
      const input: PersonName = { firstname: 'John', lastname: 'Doe' }
      const expectedOutput = 'John Doe'
      expect(getPersonName(input)).toBe(expectedOutput)
    })

    it('should return the first name if only first name is provided', () => {
      const input: PersonName = { firstname: 'John' }
      const expectedOutput = 'John'
      expect(getPersonName(input)).toBe(expectedOutput)
    })

    it('should return the last name if only last name is provided', () => {
      const input: PersonName = { lastname: 'Doe' }
      const expectedOutput = 'Doe'
      expect(getPersonName(input)).toBe(expectedOutput)
    })

    it('should return an empty string if no name details are provided', () => {
      const input: PersonName = {}
      const expectedOutput = ''
      expect(getPersonName(input)).toBe(expectedOutput)
    })

    describe('string-utils > fmtSubsectionParticipant', () => {
      describe.each([
        ['buyers', 'Buyer 1'],
        ['sellers', 'Seller 1'],
        ['buyer', 'Buyer'],
        ['seller', 'Seller'],
        ['BUYERS', 'Buyer 1'],
        ['SELLERS', 'Seller 1'],
        ['BUYER', 'BUYER'],
        ['SELLER', 'SELLER'],
        ['buyer_seller', 'Buyer Seller'],
        ['buyer_seller_test', 'Buyer Seller Test'],
        ['buyer seller', 'Buyer Seller'],
        ['buyer_seller_test_case', 'Buyer Seller Test Case'],
        ['buyer_seller_test_case_example', 'Buyer Seller Test Case Example'],
        [
          'buyer_seller_test_case_example_test',
          'Buyer Seller Test Case Example Test',
        ],
        [
          'buyer_seller_test_case_example_test_case',
          'Buyer Seller Test Case Example Test Case',
        ],
        [
          'buyer_seller_test_case_example_test_case_example',
          'Buyer Seller Test Case Example Test Case Example',
        ],
        ['', ''],
      ])('.fmtSubsectionParticipant(%p)', (input, expected) => {
        it(`returns ${expected}`, () => {
          expect(fmtSubsectionParticipant(input as string)).toEqual(
            expected as string,
          )
        })
      })
    })
  })
})

describe('string-utils > isMultiUnit', () => {
  describe.each([
    ['U11/24 South Bono St', true],
    ['U11/24-99 South Bono St', true],
    ['Apt11/24, 99 South Bono St', true],
    ['Unit 11/24/56 South Bono St', true],
    ['Studio 11-24-56 South Bono St', true],
    ['Apartment 11/24/56-78 South Bono St', true],
    ['Unit 11/24/56, 78 South Bono St', true],
    ['U11/24 56 South Bono St', true],
    ['U11/24/56-78, 99 South Bono St', true],
    ['Apartment 11-24 South Bono St', true],
    ['Apt 11, 24/56, 78-99 South Bono St', true],
    ['Unit 2411 Bono St', false],
    ['House 11 South Bono St', false],
    ['Unit 11/24 South Bono St Unit 99/123 Another St', true],
    ['U11-24 Bono South Bono St', true],
    ['Unit 99, Studio 11/24, Apartment 56 South Bono St', true],
    ['Studio 11-24 Bono South Street', true],
    ['11/24 South Bono Street', true],
    ['Apt 11-24 South Bono St', true],
    ['Apartment U11 South Bono St', false],
    ['Apartment 11/23 South Bono St', true],
    ['Apartment 11,23 South Bono St', true],
    ['Apartment 11 23 South Bono St', true],
    ['Unit 11,23 South Bono St', true],
    ['', undefined],
    [undefined, undefined],
  ])('.isMultiUnit(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(isMultiUnit(input as string)).toEqual(expected as boolean)
    })
  })
})

describe('string-utils > getNaturePropAndSubConvType', () => {
  describe.each([
    [
      'QLD-REIQ-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: '123 Main St',
        isVacantLand: true,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Vacant Land', conveyancingSubtype: 'Land' },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'sell' as Intent,
      {
        propertyAddress: '123 Main St',
        isVacantLand: true,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Vacant Land',
        conveyancingSubtype: 'No Sale Options Available',
      },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: '123 Main St',
        isVacantLand: false,
        isBuiltOn: true,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Dwelling', conveyancingSubtype: 'House' },
    ],
    [
      'QLD-ADL-community_titles',
      'buy' as Intent,
      {
        propertyAddress: 'Unit 2 South St',
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Home/Unit',
        conveyancingSubtype: 'Unit',
        filenotes: propMsg.ctsUnitNatureNConveyancing,
      },
    ],
    [
      'QLD-ADL-community_titles',
      'sell' as Intent,
      {
        propertyAddress: 'Unit 299 South St',
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Home/Unit',
        conveyancingSubtype: 'No Sale Options Available',
        filenotes: propMsg.ctsHomeUnitNature,
      },
    ],
    [
      'QLD-ADL-community_titles',
      'buy' as Intent,
      {
        propertyAddress: '123/22 Main St',
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Multi Unit', conveyancingSubtype: 'Unit' },
    ],
    [
      'QLD-ADL-community_titles',
      'sell' as Intent,
      {
        propertyAddress: '123/22 Main St',
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Multi Unit',
        conveyancingSubtype: 'No Sale Options Available',
      },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: true,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Vacant Land', conveyancingSubtype: 'Land' },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: false,
        isBuiltOn: true,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Dwelling', conveyancingSubtype: 'House' },
    ],
    [
      'QLD-ADL-community_titles',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      undefined,
    ],
    [
      'QLD-ADL-community_titles',
      'sell' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      undefined,
    ],
    [
      'QLD-ADL-Community_Titles',
      'sell' as Intent,
      {
        propertyAddress: '1 South St',
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Home/Unit',
        conveyancingSubtype: 'No Sale Options Available',
        filenotes: propMsg.ctsHomeUnitNature,
      },
    ],
    [
      'QLD-ADL-Community_Titles',
      'sell' as Intent,
      {
        propertyAddress: '1/24 South St',
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Multi Unit',
        conveyancingSubtype: 'No Sale Options Available',
      },
    ],
    [
      'QLD-REIQ-Community_Titles',
      'sell' as Intent,
      {
        propertyAddress: '1/24 South St',
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 2,
      },
      {
        natureOfProperty: 'Multi Unit',
        conveyancingSubtype: 'No Sale Options Available',
        filenotes: propMsg.cstMultipleLotsForNature,
      },
    ],
    [
      'QLD-REIQ-Community_Titles',
      'sell' as Intent,
      {
        propertyAddress: '1 South St',
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Home/Unit',
        conveyancingSubtype: 'No Sale Options Available',
        filenotes: propMsg.ctsHomeUnitNature,
      },
    ],
    [
      'QLD-ADL-House_and_Land',
      'sell' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Dwelling',
        conveyancingSubtype: 'No Sale Options Available',
      },
    ],
    [
      'QLD-ADL-House_and_Land',
      'sell' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: true,
        isBuiltOn: undefined,
        numberOfLots: 2,
      },
      {
        natureOfProperty: 'Vacant Land',
        conveyancingSubtype: 'No Sale Options Available',
      },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'sell' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: false,
        isBuiltOn: true,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Dwelling',
        conveyancingSubtype: 'No Sale Options Available',
      },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'sell' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: true,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Vacant Land',
        conveyancingSubtype: 'No Sale Options Available',
      },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'sell' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Dwelling',
        conveyancingSubtype: 'No Sale Options Available',
        filenotes: propMsg.landNeitherEnabledForNature,
      },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'sell' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: true,
        isBuiltOn: true,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Dwelling',
        conveyancingSubtype: 'No Sale Options Available',
        filenotes: propMsg.landBothEnabledForNature,
      },
    ],
    [
      'QLD-ADL-Community_Titles',
      'buy' as Intent,
      {
        propertyAddress: '1 South St',
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Home/Unit',
        conveyancingSubtype: 'Unit',
        filenotes: propMsg.ctsUnitNatureNConveyancing,
      },
    ],
    [
      'QLD-ADL-Community_Titles',
      'buy' as Intent,
      {
        propertyAddress: '1/24 South St',
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Multi Unit', conveyancingSubtype: 'Unit' },
    ],
    [
      'QLD-REIQ-Community_Titles',
      'buy' as Intent,
      {
        propertyAddress: '1/24/24 South St',
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 2,
      },
      {
        natureOfProperty: 'Multi Unit',
        conveyancingSubtype: 'Unit',
        filenotes: propMsg.cstMultipleLotsForNature,
      },
    ],
    [
      'QLD-REIQ-Community_Titles',
      'buy' as Intent,
      {
        propertyAddress: '1 South St',
        isVacantLand: undefined,
        isBuiltOn: undefined,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Home/Unit',
        conveyancingSubtype: 'Unit',
        filenotes: propMsg.ctsUnitNatureNConveyancing,
      },
    ],
    [
      'QLD-ADL-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Dwelling', conveyancingSubtype: 'House' },
    ],
    [
      'QLD-ADL-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: true,
        isBuiltOn: undefined,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Vacant Land', conveyancingSubtype: 'Land' },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: false,
        isBuiltOn: true,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Dwelling', conveyancingSubtype: 'House' },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: true,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      { natureOfProperty: 'Vacant Land', conveyancingSubtype: 'Land' },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: false,
        isBuiltOn: false,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Dwelling',
        conveyancingSubtype: 'House',
        filenotes: propMsg.landNeitherEnabledForNatureSub,
      },
    ],
    [
      'QLD-REIQ-House_and_Land',
      'buy' as Intent,
      {
        propertyAddress: undefined,
        isVacantLand: true,
        isBuiltOn: true,
        numberOfLots: 1,
      },
      {
        natureOfProperty: 'Dwelling',
        conveyancingSubtype: 'House',
        filenotes: propMsg.landBothEnabledForNatureSub,
      },
    ],
  ])(
    '.getNaturePropAndSubConvType(%p, %p, %p)',
    (layoutName, intent, ocr, expected) => {
      it(`returns ${JSON.stringify(expected)}`, () => {
        expect(
          getNaturePropAndSubConvType(
            layoutName as LayoutNameType,
            intent as Intent,
            ocr as OcrPropertyFields,
          ),
        ).toEqual(expected as NaturePropertySubConvType)
      })
    },
  )
})

describe('string-utils > sanitizeName', () => {
  describe.each([
    [undefined, undefined],
    ['', undefined],
    ['|||', undefined],
    ['  |  ', undefined],
    ['No', undefined],
    ['False', undefined],
    ['N', undefined],
    ['F', undefined],
    ['Yes', undefined],
    ['True', undefined],
    ['Y', undefined],
    ['T', undefined],
    ['NA', undefined],
    ['N/A', undefined],
    ['John Alexander Nowart Nibana', 'John Alexander Nowart Nibana'],
    ['|John Alexander Nowart` Nibana', 'John Alexander Nowart Nibana'],
    ['John Alexander Null Nil', 'John Alexander Null Nil'],
    ["John' Nil", 'John Nil'],
    ['John No', 'John No'],
    ['John`Nil', 'JohnNil'],
    ['John Nil', 'John Nil'],
    ['John N/A', 'John N/A'],
    ['John Not Applicable', 'John Not Applicable'],
    ['John Doe', 'John Doe'],
    ['John | Doe', 'John Doe'],
    ['John Doe', 'John Doe'],
    [' | John | Doe | ', 'John Doe'],
    ['Alice', 'Alice'],
    ['|John|Doe|', 'JohnDoe'],
    ['  | Alice | ', 'Alice'],
  ])('.sanitizeName(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(sanitizeName(input as string | undefined)).toEqual(
        expected as string,
      )
    })
  })
})

describe('createTitleRef', () => {
  it('should return an empty array if title is empty', () => {
    expect(createTitleRef(3, '')).toEqual([])
    expect(createTitleRef(3, undefined as unknown as string)).toEqual([])
  })

  it('should return an empty array if lotCount is 0 or negative', () => {
    expect(createTitleRef(0, 'Lot 1')).toEqual([])
    expect(createTitleRef(-1, 'Lot 1')).toEqual([])
  })

  it('should split title by spaces, commas, and hyphens', () => {
    expect(createTitleRef(3, 'Lot1,Lot2-Lot3 Lot4')).toEqual([
      'Lot1',
      'Lot2',
      'Lot3',
    ])
  })

  it('should pad with the first value if not enough parts', () => {
    expect(createTitleRef(4, 'Lot1')).toEqual(['Lot1', 'Lot1', 'Lot1', 'Lot1'])
    expect(createTitleRef(3, 'Lot1 Lot2')).toEqual(['Lot1', 'Lot2', 'Lot1'])
  })

  it('should return up to 4 parts if lotCount is greater than 4', () => {
    expect(createTitleRef(6, 'A B C D E F')).toEqual(['A', 'B', 'C', 'D'])
  })

  it('should trim and filter out empty parts', () => {
    expect(createTitleRef(3, '  Lot1   , , Lot2  -  Lot3  ')).toEqual([
      'Lot1',
      'Lot2',
      'Lot3',
    ])
  })

  it('should handle single value with spaces', () => {
    expect(createTitleRef(2, '  Lot1  ')).toEqual(['Lot1', 'Lot1'])
  })

  it('should trim and filter out empty parts', () => {
    expect(createTitleRef(3, '12345,678,910')).toEqual(['12345', '678', '910'])
  })
  it('should trim and filter out empty parts', () => {
    expect(createTitleRef(1, '12345 ,678, 910')).toEqual(['12345'])
  })
  it('should trim and filter out empty parts', () => {
    expect(createTitleRef(4, '12345')).toEqual([
      '12345',
      '12345',
      '12345',
      '12345',
    ])
  })
})

describe('getPlanNumbers', () => {
  it('should return empty array for empty input', () => {
    expect(getPlanNumbers('')).toEqual([])
    expect(getPlanNumbers(undefined as unknown as string)).toEqual([])
  })

  it('should return empty array when no plan numbers exist', () => {
    expect(getPlanNumbers('There are no plan numbers here')).toEqual([])
  })

  it('should extract single plan number without space', () => {
    expect(getPlanNumbers('SP123')).toEqual([
      { planType: 'SP', planNumber: '123' },
    ])
  })

  it('should extract single plan number with space', () => {
    expect(getPlanNumbers('BUP 456789')).toEqual([
      { planType: 'BUP', planNumber: '456789' },
    ])
  })

  it('should handle case insensitivity', () => {
    expect(getPlanNumbers('sp123')).toEqual([
      { planType: 'SP', planNumber: '123' },
    ])
    expect(getPlanNumbers('bUp 456')).toEqual([
      { planType: 'BUP', planNumber: '456' },
    ])
  })

  it('should extract multiple plan numbers with various separators', () => {
    const input =
      'Property reference: SP123, BUP 456 and RP789 with GTP 101112 & CPW13579'
    expect(getPlanNumbers(input)).toEqual([
      { planType: 'SP', planNumber: '123' },
      { planType: 'BUP', planNumber: '456' },
      { planType: 'RP', planNumber: '789' },
      { planType: 'GTP', planNumber: '101112' },
      { planType: 'CP', planNumber: 'W13579' }, // Changed from CPW to CP with W prefix
    ])
  })

  it('should extract multiple plan numbers with more separators', () => {
    const input =
      'Property reference: SP123, BUP 456 & CPW23456 and RP789/GTP 2345 with GTP 101112 & CPW13579'
    expect(getPlanNumbers(input)).toEqual([
      { planType: 'SP', planNumber: '123' },
      { planType: 'BUP', planNumber: '456' },
      { planType: 'CP', planNumber: 'W23456' }, // Changed from CPW to CP with W prefix
      { planType: 'RP', planNumber: '789' },
      { planType: 'GTP', planNumber: '2345' },
      { planType: 'GTP', planNumber: '101112' },
      { planType: 'CP', planNumber: 'W13579' }, // Changed from CPW to CP with W prefix
    ])
  })

  it('should handle CPW special case', () => {
    expect(getPlanNumbers('CPW12345')).toEqual([
      { planType: 'CP', planNumber: 'W12345' },
    ])
  })

  it('should extract plan numbers from complex text', () => {
    const input =
      'The land is described as SP 123 AND BUP456 located at 567 Main St'
    expect(getPlanNumbers(input)).toEqual([
      { planType: 'SP', planNumber: '123' },
      { planType: 'BUP', planNumber: '456' },
      { planType: undefined, planNumber: '567' },
    ])
  })
  it('should handle planTypes only', () => {
    expect(getPlanNumbers('Sp BuP SP')).toEqual([
      { planType: 'SP', planNumber: undefined },
      { planType: 'BUP', planNumber: undefined },
      { planType: 'SP', planNumber: undefined },
    ])
  })

  it('should handle planTypes only', () => {
    expect(getPlanNumbers('SP,BUP,SP,GTP')).toEqual([
      { planType: 'SP', planNumber: undefined },
      { planType: 'BUP', planNumber: undefined },
      { planType: 'SP', planNumber: undefined },
      { planType: 'GTP', planNumber: undefined },
    ])
  })

  it('should handle planNumber only', () => {
    expect(getPlanNumbers('123,456,789,99999')).toEqual([
      { planType: undefined, planNumber: '123' },
      { planType: undefined, planNumber: '456' },
      { planType: undefined, planNumber: '789' },
      { planType: undefined, planNumber: '99999' },
    ])
  })
})

describe('parsePlanType', () => {
  describe.each([
    ['group titles plan', 'GTP'],
    ['Group Titles Plan   ', 'GTP'],
    ['building unit plan (bup)', 'BUP'],
    ['building   unit plan  ', 'BUP'],
    ['building unit', 'BUP'],
    ['group titles', 'GTP'],
    ['survey     plan ', 'SP'],
    ['crown plan', 'CP'],
    ['registered plan', 'RP'],
    ['group', 'GTP'],
    ['survey', 'SP'],
    ['crown', 'CP'],
    ['registered', 'RP'],
    ['GTP', 'GTP'],
    ['SP', 'SP'],
    ['CP', 'CP'],
    ['RP', 'RP'],
    ['unknown plan', undefined],
    ['', undefined],
    [null, undefined],
    [undefined, undefined],
  ])('.parsePlanType(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(parsePlanType(input as string)).toBe(expected as string)
    })
  })
})

describe('composeMatterName', () => {
  it('should prepend "TEST-" if isTestMode is true', () => {
    const sellers: Partial<BtrSdsPerson>[] = [
      { full_name: 'John Doe' },
      { full_name: 'Jane Smith' },
    ]
    expect(composeMatterName(sellers as BtrSdsPerson[], true)).toBe(
      'TEST-Doe and Smith sale to TBA',
    )
  })

  it('should not prepend "TEST-" if isTestMode is false', () => {
    const sellers: Partial<BtrSdsPerson>[] = [
      { full_name: 'John Doe' },
      { full_name: 'Jane Smith' },
    ]
    expect(composeMatterName(sellers as BtrSdsPerson[], false)).toBe(
      'Doe and Smith sale to TBA',
    )
  })

  it('should handle company names', () => {
    const sellers: Partial<BtrSdsPerson>[] = [
      { full_name: 'Acme Pty Ltd' },
      { full_name: 'Widgets Inc' },
    ]
    expect(composeMatterName(sellers as BtrSdsPerson[], false)).toBe(
      'Acme Pty Ltd and Widgets Inc sale to TBA',
    )
  })

  it('should handle single seller', () => {
    const sellers: Partial<BtrSdsPerson>[] = [{ full_name: 'John Doe' }]
    expect(composeMatterName(sellers as BtrSdsPerson[], false)).toBe(
      'Doe sale to TBA',
    )
  })

  it('should combine seller company and individual names before processing', () => {
    const sellers: Partial<BtrSdsPerson>[] = [
      { full_name: 'John Doe' },
      { full_name: 'Acme Pty Ltd' },
      { full_name: 'ABC Store Incorporated' },
    ]
    expect(composeMatterName(sellers as BtrSdsPerson[], false)).toBe(
      'Doe and Acme Pty Ltd and ABC Store Incorporated sale to TBA',
    )
  })
})
