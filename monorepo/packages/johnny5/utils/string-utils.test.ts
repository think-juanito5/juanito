import { describe, expect, it, mock } from 'bun:test'
import type { Logger } from '@dbc-tech/logger'
import { type SelectionMarkValues } from '../typebox/selection-mark.schema'
import {
  type DateOrDays,
  capitalise,
  capitalizePlus,
  extractDateOrDays,
  formatPhoneIntl,
  formatPhoneNumberwithSpacing,
  formatToAULocalMobile,
  removePhonePrefix,
  truncateString,
} from './string-utils'
import {
  StreetNameAbbreviationExpander,
  containsBusinessOrWorking,
  containsDays,
  extractFirstNumber,
  extractFirstNumberInDays,
  extractNumbers,
  parseSelectionMark,
} from './string-utils'

describe('string-utils', () => {
  describe('extractFirstNumber', () => {
    describe.each([
      ['30 days from date of contract', 30],
      ['contract settlement in 60 days', 60],
      ['contract settlement in 60 days or 2 months', 60],
      ['days from date of contract', undefined],
      [' ', undefined],
      ['', undefined],
      [null, undefined],
      [undefined, undefined],
    ])('.extractFirstNumber(%p)', (input, expected) => {
      it(`returns ${expected}`, () => {
        expect(extractFirstNumber(input as string)).toBe(expected as number)
      })
    })
  })

  describe('extractFirstNumberInDays', () => {
    describe.each([
      ['30 days from date of contract', 30],
      ['contract settlement in 60 days', 60],
      ['contract settlement in 60 day', 60],
      ['contract settlement in 160day', 160],
      ['contract settlement in 60 days or 2 months', 60],
      ['days from date of contract', undefined],
      ['10 DAYS FROM DATE OF CONTRACT', 10],
      ['100 RANDOM NUMBERS HERE', 100],
      ['RANDOM 100 THEN 200 THEN 300 HERE', 100],
      ['3 BUSINESS DAYS FROM DATE OF CONTRACT', 3],
      ['within 24 hours of contract date', 1],
      ['within 12hours of contract date', 1],
      ['within 36 hours of contract date', 2],
      ['within 50 hours of contract date', 3],
      ['within 50 hour of contract date', 3],
      ['within 48 hours or 3 days of contract date', 2],
      ['within hours of contract date', undefined],
      ['contract settlement in 6 weeks', 42],
      ['contract settlement in 1 week', 7],
      ['within 3 weeks of contract date', 21],
      ['contract settlement in 2 months or 60 days', 60],
      ['contract settlement in 4 months', 120],
      ['contract settlement in 4 month', 120],
      [' ', undefined],
      ['', undefined],
      [null, undefined],
      [undefined, undefined],
    ])('.extractFirstNumberInDays(%p)', (input, expected) => {
      it(`returns ${expected}`, () => {
        expect(extractFirstNumberInDays(input as string)).toBe(
          expected as number,
        )
      })
    })
  })

  describe('containsBusinessDays', () => {
    describe.each([
      ['30 business days from date of contract', true],
      ['30 business days', true],
      ['business days', true],
      ['biz days', true],
      ['30 working days from date of contract', true],
      ['30 working days', true],
      ['working days', true],
      ['work days', true],
      ['days', false],
      [' ', false],
      ['', false],
      [null, false],
      [undefined, false],
    ])('.containsBusinessDays(%p)', (input, expected) => {
      it(`returns ${expected}`, () => {
        expect(containsBusinessOrWorking(input as string)).toBe(expected)
      })
    })
  })

  describe('containsDays', () => {
    describe.each([
      ['30 days from date of contract', true],
      ['30 days', true],
      ['days', true],
      ['day', false],
      ['dayz', false],
      [' ', false],
      ['', false],
      [null, false],
      [undefined, false],
    ])('.containsDays(%p)', (input, expected) => {
      it(`returns ${expected}`, () => {
        expect(containsDays(input as string)).toBe(expected)
      })
    })
  })

  describe('StreetNameAbbreviationExpander', () => {
    it('should expand street abbreviations correctly', () => {
      const input = '123 Main St'
      const expectedOutput = '123 Main Street'
      expect(StreetNameAbbreviationExpander(input)).toBe(expectedOutput)
    })

    it('should handle multiple abbreviations in the same string', () => {
      const input = 'Corner of 5th Ave and Elm St'
      const expectedOutput = 'Corner of 5th Avenue and Elm Street'
      expect(StreetNameAbbreviationExpander(input)).toBe(expectedOutput)
    })

    it('should return an empty string when input is empty', () => {
      const input = ''
      const expectedOutput = ''
      expect(StreetNameAbbreviationExpander(input)).toBe(expectedOutput)
    })

    it('should return the original string when there are no abbreviations', () => {
      const input = '123 Main Street'
      const expectedOutput = '123 Main Street'
      expect(StreetNameAbbreviationExpander(input)).toBe(expectedOutput)
    })

    it('should handle mixed case abbreviations', () => {
      const input = '123 main St'
      const expectedOutput = '123 main Street'
      expect(StreetNameAbbreviationExpander(input)).toBe(expectedOutput)
    })

    it('should handle abbreviations at the start of the string', () => {
      const input = `123 St John's Rd`
      const expectedOutput = `123 Street John's Road`
      expect(StreetNameAbbreviationExpander(input)).toBe(expectedOutput)
    })

    it('should handle abbreviations at the end of the string', () => {
      const input = 'Main St'
      const expectedOutput = 'Main Street'
      expect(StreetNameAbbreviationExpander(input)).toBe(expectedOutput)
    })

    it('should handle multiple spaces between words', () => {
      const input = 'Main   St'
      const expectedOutput = 'Main   Street'
      expect(StreetNameAbbreviationExpander(input)).toBe(expectedOutput)
    })
  })

  describe('capitalise', () => {
    it('should capitalise a single word', () => {
      const input = 'hello'
      const expectedOutput = 'Hello'
      expect(capitalise(input)).toBe(expectedOutput)
    })

    it('should capitalise multiple words', () => {
      const input = 'hello world'
      const expectedOutput = 'Hello World'
      expect(capitalise(input)).toBe(expectedOutput)
    })

    it('should return an empty string when input is empty', () => {
      const input = ''
      const expectedOutput = ''
      expect(capitalise(input)).toBe(expectedOutput)
    })

    it('should return null when input is null', () => {
      const input = null as unknown as string
      expect(capitalise(input)).toBeNull()
    })

    it('should return original when input is undefined', () => {
      const input = undefined as unknown as string
      expect(capitalise(input)).toBeUndefined()
    })

    it('should capitalise mixed case words', () => {
      const input = 'hElLo WoRLd'
      const expectedOutput = 'Hello World'
      expect(capitalise(input)).toBe(expectedOutput)
    })

    it('should handle words with multiple spaces', () => {
      const input = 'hello   world'
      const expectedOutput = 'Hello   World'
      expect(capitalise(input)).toBe(expectedOutput)
    })

    it('should capitalise first letter of all caps words', () => {
      const input = 'ABC PROPERTY LTD'
      const expectedOutput = 'Abc Property Ltd'
      expect(capitalise(input)).toBe(expectedOutput)
    })

    it('should handle names with accented characters', () => {
      const input = 'ALFRED NÚÑEZ'
      const expectedOutput = 'Alfred Núñez'
      expect(capitalise(input)).toBe(expectedOutput)
    })
  })

  describe('parseSelectionMark', () => {
    describe.each([
      [':selected:', 'Yes'],
      [':Selected:', 'Yes'],
      [':yes', 'Yes'],
      ['yes', 'Yes'],
      ['true', 'Yes'],
      [':true', 'Yes'],
      ['SELECTED', 'Yes'],
      [':unselected:', 'No'],
      ['unselected', 'No'],
      [':UNSELECTED:', 'No'],
      [':Unknown:', ''],
      ['false', 'No'],
      [':false', 'No'],
      ['no', 'No'],
      [':no', 'No'],
      ['', ''],
      [undefined, ''],
    ])('.parseSelectionMark(%p)', (input, expected) => {
      it(`returns ${expected}`, () => {
        expect(parseSelectionMark(input as string)).toEqual(
          expected as SelectionMarkValues,
        )
      })
    })
  })

  describe('removePhonePrefix', () => {
    describe.each([
      ['0478516994', '478516994'],
      ['0478 516994', '478516994'],
      ['478 516994', '478516994'],
      ['+61478516994', '478516994'],
      ['+61 478 516994', '478516994'],
      ['0289172000', '289172000'],
      ['02 8917 2000', '289172000'],
      ['(02) 8917 2000', '289172000'],
      ['+61 (02) 8917 2000', '289172000'],
      ['+61 (2) 8917 2000', '289172000'],
      ['1300932738', '1300932738'],
      ['1300 932 738', '1300932738'],
      ['call 0478516994', '478516994'], // Automatically removes text prefixes
      ['0478516994 or 1300932738', '0478516994 or 1300932738'], // Cannot parse multiple numbers
      ['', undefined],
      [null, undefined],
      [undefined, undefined],
    ])('.removePhonePrefix(%p)', (input, expected) => {
      it(`returns ${expected}`, () => {
        expect(removePhonePrefix(input as string)).toEqual(expected as string)
      })
    })
  })

  describe('formatPhoneNumberwithSpacing', () => {
    describe.each([
      ['0412345678', '0412 345 678'],
      ['0412 345 678', '0412 345 678'],
      ['+61412345678', '0412 345 678'],
      ['+61 412 345 678', '0412 345 678'],
      ['1300932738', '1300 932 738'],
      ['1300 932 738', '1300 932 738'],
      ['+610400705886', '0400 705 886'],
      ['(02) 1234 5678', '02 1234 5678'],
      ['+61 2 1234 5678', '02 1234 5678'],
      ['0289172000', '02 8917 2000'],
      ['0478516994', '0478 516 994'],
      ['0478 516994', '0478 516 994'],
      ['478 516994', '0478 516 994'],
      ['+61478516994', '0478 516 994'],
      ['+61 478 516994', '0478 516 994'],
      ['02 8917 2000', '02 8917 2000'],
      ['(02) 8917 2000', '02 8917 2000'],
      ['+61 (02) 8917 2000', '02 8917 2000'],
      ['+61 (2) 8917 2000', '02 8917 2000'],
      ['call 0478516994', '0478 516 994'], // Automatically removes text prefixes
      ['0478516994 or 1300932738', '0478516994 or 1300932738'], // Cannot parse multiple numbers
      ['12345', '12345'],
      ['', undefined],
      [undefined, undefined],
      [null, undefined],
    ])('formatPhoneNumberwithSpacing(%p)', (input, expected) => {
      it(`returns ${expected}`, () => {
        expect(formatPhoneNumberwithSpacing(input as string)).toBe(
          expected as string,
        )
      })
    })
  })

  describe('extractNumbers', () => {
    describe.each([
      ['123 Main St', 1],
      ['123 Main St, Apt 4B', 2],
      ['No numbers here', 0],
      ['123 456 789', 3],
      ['Suite 100, 200, 300', 3],
      ['One number: 42', 1],
      ['123-456-7890', 3],
      ['Room 101, Building 202', 2],
      ['U11/24 South Bono St', 2],
      ['U11/24-99 South Bono St', 3],
      ['Apt11/24, 99 South Bono St', 3],
      ['Unit 11/24/56 South Bono St', 3],
      ['Studio 11-24-56 South Bono St', 3],
      ['Apartment 11/24/56-78 South Bono St', 4],
      ['Unit 11/24/56, 78 South Bono St', 4],
      ['U11/24 56 South Bono St', 3],
      ['U11/24/56-78, 99 South Bono St', 5],
      ['Apartment 11-24 South Bono St', 2],
      ['Apt 11, 24/56, 78-99 South Bono St', 5],
      ['Unit 24 Bono St', 1],
      ['House 11 South Bono St', 1],
      ['Unit 11/24 South Bono St Unit 99/123 Another St', 4],
      ['U11-24 Bono South Bono St', 2],
      ['Unit 99, Studio 11/24, Apartment 56 South Bono St', 4],
      ['Studio 11-24 Bono South Street', 2],
      ['11/24 South Bono Street', 2],
      ['Apartment U11 South Bono St', 1],
      ['Apt 11-24 South Bono St', 2],
      [' ', 0],
      ['', undefined],
      [undefined, undefined],
    ])('.extractNumbers(%p)', (input, expected) => {
      it(`returns ${expected}`, () => {
        expect(extractNumbers(input as string)).toEqual(expected as number)
      })
    })
  })

  describe('extractDateOrDays', () => {
    const mockLogger: Logger = {
      debug: mock(),
      log: mock(),
      error: mock(),
      warn: mock(),
      info: mock(),
      trace: mock(),
    }

    const daysCases: { input: string; expected: DateOrDays }[] = [
      { input: '7 days', expected: { numberOfDays: 7, type: 'calendar' } },
      { input: '7.5 days', expected: { numberOfDays: 7, type: 'calendar' } },
      {
        input: 'approximately 7 days',
        expected: { numberOfDays: 7, type: 'calendar' },
      },
      {
        input: 'approximately 7.5 days',
        expected: { numberOfDays: 7, type: 'calendar' },
      },
      {
        input: '7.55555 business days',
        expected: { numberOfDays: 7, type: 'business' },
      },
      {
        input: '7 business days',
        expected: { numberOfDays: 7, type: 'business' },
      },
      {
        input: '7.5 business days',
        expected: { numberOfDays: 7, type: 'business' },
      },
      {
        input: 'approximately biz 7 days',
        expected: { numberOfDays: 7, type: 'business' },
      },
      {
        input: 'approximately 7.5 working days',
        expected: { numberOfDays: 7, type: 'business' },
      },
      {
        input: '7.55555 work days',
        expected: { numberOfDays: 7, type: 'business' },
      },
      { input: '7day', expected: undefined },
      { input: '7.5day', expected: undefined },
      { input: '7 weeks', expected: undefined },
      { input: '7 business weeks', expected: undefined },
    ]

    it.each(daysCases)(
      'input should calculate number of days and type %p',
      async ({ input, expected }) => {
        expect<DateOrDays>(await extractDateOrDays(input, mockLogger)).toEqual(
          expected,
        )
      },
    )

    const dateCases: { input: string; expected: string }[] = [
      { input: '04-01-2024', expected: '2024-01-04' },
      { input: '4-01-2024', expected: '2024-01-04' },
      { input: '04-1-2024', expected: '2024-01-04' },
      { input: '4-1-2024', expected: '2024-01-04' },
    ]

    it.each(dateCases)(
      'input should calculate date %p',
      async ({ input, expected }) => {
        expect<DateOrDays>(await extractDateOrDays(input, mockLogger)).toEqual(
          new Date(expected),
        )
      },
    )
  })
})

describe('capitalizePlus', () => {
  describe.each([
    ['hello world', 'Hello World'],
    ['john doe', 'John Doe'],
    ['jack-o-lantern', 'Jack-O-Lantern'],
    ['state-of-the-art', 'State-Of-The-Art'],
    ['mcdonald', 'McDonald'],
    ['mccarthy', 'McCarthy'],
    ['ray white rural (kilcoy)', 'Ray White Rural (Kilcoy)'],
    ['(lowercase example)', '(Lowercase Example)'],
    ['(some-hyphenated-name)', '(Some-Hyphenated-Name)'],
    ['JaCk-O-lAnTeRn', 'Jack-O-Lantern'],
    ['Hello World', 'Hello World'],
    ['mcpherson (example)', 'McPherson (Example)'],
    ['mcpherson (example only)', 'McPherson (Example Only)'],
    ['', undefined],
    [null, undefined],
    [undefined, undefined],
  ])('.capitalizePlus(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(capitalizePlus(input as string)).toEqual(expected as string)
    })
  })
})

describe('formatPhoneIntl', () => {
  describe.each([
    ['0412 345 678', '+61412345678'],
    ['+61 412 345 678', '+61412345678'],
    ['(02) 1234 5678', '+61212345678'],
    ['+61 (0) 2 1234 5678', '+61212345678'],
    ['+61 3 9876 5432', '+61398765432'],
    ['0400 000 000', '+61400000000'],
    ['400 000 000', '+61400000000'],
    ['+61 (0) 400 111 111', '+61400111111'],
    ['0212345678', '+61212345678'],
    ['+1 212 555 1234', '+12125551234'],
    ['12345', '+6112345'], // Too short
    ['abcdefg', undefined], // Not a number
    ['+61412345678', '+61412345678'],
    ['+61 4 1234 5678', '+61412345678'],
    ['+99 412 345 678', '+99412345678'], // Invalid country code
    ['+61 (0) 412 345 678', '+61412345678'],
    ['+61 2 1234 5678', '+61212345678'],
    ['+61 400 000 000', '+61400000000'],
    ['0412-555-555', '+61412555555'],
    ['(07) 3456 7890', '+61734567890'],
    ['0756781234', '+61756781234'],
    ['+61 7 5678 1234', '+61756781234'],
    ['08 8765 4321', '+61887654321'],
    ['(08) 8765-4321', '+61887654321'],
    ['', undefined],
    [undefined, undefined],
  ])('formatPhoneIntl [%s] ', (input, expected) => {
    it(`returns [${expected}]`, () => {
      expect(formatPhoneIntl(input)).toBe(expected as string)
    })
  })
})

describe('formatToAULocalMobile', () => {
  describe.each([
    ['+61412345678', '0412345678'],
    ['61412345678', '0412345678'],
    ['0412345678', '0412345678'],
    ['+61 412 345 678', '0412345678'],
    ['0412 345 678', '0412345678'],
    ['+61-412-345-678', '0412345678'],
    ['0412-345-678', '0412345678'],
    ['+61 (0) 412 345 678', '0412345678'],
    ['(04) 1234 5678', '0412345678'],
    ['12345', undefined], // Too short
    ['abcdefg', undefined], // Not a number
    ['+614123456789', undefined], // Too long
    ['+614123456', undefined], // Too short
    ['', undefined], // Empty string
    [null, undefined], // Null input
    [undefined, undefined], // Undefined input
  ])('formatToAULocalMobile(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(formatToAULocalMobile(input as string)).toBe(expected as string)
    })
  })

  describe('truncateString', () => {
    it('should return the original string if its length is less than maxLength', () => {
      const str = 'Hello'
      const maxLength = 10
      expect(truncateString(str, maxLength)).toBe(str)
    })

    it('should return the original string if its length is equal to maxLength', () => {
      const str = 'Hello World'
      const maxLength = 11
      expect(truncateString(str, maxLength)).toBe(str)
    })

    it('should truncate the string and append the default suffix if length exceeds maxLength', () => {
      const str = 'This is a long string that needs truncation'
      const maxLength = 20
      const expected = 'This is a long st...'
      expect(truncateString(str, maxLength)).toBe(expected)
      expect(truncateString(str, maxLength).length).toBe(maxLength)
    })

    it('should truncate the string and append a custom suffix if length exceeds maxLength', () => {
      const str = 'Another long string example'
      const maxLength = 15
      const suffix = '>>'
      const expected = 'Another long >>'
      expect(truncateString(str, maxLength, suffix)).toBe(expected)
      expect(truncateString(str, maxLength, suffix).length).toBe(maxLength)
    })

    it('should handle maxLength being less than the suffix length', () => {
      const str = 'Short string'
      const maxLength = 2
      const suffix = '...'
      const expected = '..'
      expect(truncateString(str, maxLength, suffix)).toBe(expected)
    })

    it('should handle maxLength being equal to the suffix length', () => {
      const str = 'Test string'
      const maxLength = 3
      const suffix = '...'
      const expected = '...'
      expect(truncateString(str, maxLength, suffix)).toBe(expected)
    })

    it('should handle maxLength being 0', () => {
      const str = 'Any string'
      const maxLength = 0
      const suffix = '...'
      const expected = ''
      expect(truncateString(str, maxLength, suffix)).toBe(expected)
    })

    it('should return an empty string if the input string is empty', () => {
      const str = ''
      const maxLength = 10
      expect(truncateString(str, maxLength)).toBe('')
    })

    it('should handle unicode characters correctly', () => {
      const str = '你好世界，这是一个长字符串' // "Hello world, this is a long string"
      const maxLength = 10
      const suffix = '...'
      const expected = '你好世界，这是...' // Truncated part + suffix
      expect(truncateString(str, maxLength, suffix)).toBe(expected)
      expect(truncateString(str, maxLength, suffix).length).toBe(maxLength)
    })
  })
})
