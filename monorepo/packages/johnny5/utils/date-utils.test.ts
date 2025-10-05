import { describe, expect, it, test } from 'bun:test'
import { dateOffsetter } from './date-utils'
import {
  getLatestDate,
  getTimeRangeInUtc,
  isIsoDateString,
  parseDateOnly,
} from './date-utils'

describe('dateOffsetter', () => {
  it('offsets by calendar days when businessDays is false', () => {
    const base = new Date('2025-07-14') // Monday
    expect(dateOffsetter(base, 3, false).toISOString().slice(0, 10)).toBe(
      '2025-07-17',
    ) // Thursday
    expect(dateOffsetter(base, -2, false).toISOString().slice(0, 10)).toBe(
      '2025-07-12',
    ) // Saturday
  })

  it('offsets by business days when businessDays is true', () => {
    const base = new Date('2025-07-14') // Monday
    expect(dateOffsetter(base, 3, true).toISOString().slice(0, 10)).toBe(
      '2025-07-17',
    ) // Thursday
    expect(dateOffsetter(base, 5, true).toISOString().slice(0, 10)).toBe(
      '2025-07-21',
    ) // Next Monday
    expect(dateOffsetter(base, -1, true).toISOString().slice(0, 10)).toBe(
      '2025-07-11',
    ) // Previous Friday
  })

  it('returns a new Date and does not mutate the original', () => {
    const base = new Date('2025-07-14')
    const result = dateOffsetter(base, 2, false)
    expect(result).not.toBe(base)
    expect(base.toISOString().slice(0, 10)).toBe('2025-07-14')
  })
})

describe('date-utils', () => {
  describe('parseDateOnly', () => {
    const testCases = [
      { input: '04-01-2024', expected: '2024-01-04' },
      { input: '4-01-2024', expected: '2024-01-04' },
      { input: '04-1-2024', expected: '2024-01-04' },
      { input: '4-1-2024', expected: '2024-01-04' },
      { input: '01-04-2024', expected: '2024-04-01' },
      { input: '1-04-2024', expected: '2024-04-01' },
      { input: '04-01-24', expected: '2024-01-04' },
      { input: '4-01-24', expected: '2024-01-04' },
      { input: '04-1-24', expected: '2024-01-04' },
      { input: '4-1-24', expected: '2024-01-04' },
      { input: '01-04-24', expected: '2024-04-01' },
      { input: '1-04-24', expected: '2024-04-01' },
      { input: '01-4-24', expected: '2024-04-01' },
      { input: '1-4-24', expected: '2024-04-01' },
      { input: '04 01 2024', expected: '2024-01-04' },
      { input: '4 01 2024', expected: '2024-01-04' },
      { input: '04 1 2024', expected: '2024-01-04' },
      { input: '4 1 2024', expected: '2024-01-04' },
      { input: '01 04 2024', expected: '2024-04-01' },
      { input: '1 04 2024', expected: '2024-04-01' },
      { input: '04 01 24', expected: '2024-01-04' },
      { input: '4 01 24', expected: '2024-01-04' },
      { input: '04 1 24', expected: '2024-01-04' },
      { input: '4 1 24', expected: '2024-01-04' },
      { input: '01 04 24', expected: '2024-04-01' },
      { input: '1 04 24', expected: '2024-04-01' },
      { input: '01 4 24', expected: '2024-04-01' },
      { input: '1 4 24', expected: '2024-04-01' },
      { input: '04.01.2024', expected: '2024-01-04' },
      { input: '4.01.2024', expected: '2024-01-04' },
      { input: '04.1.2024', expected: '2024-01-04' },
      { input: '4.1.2024', expected: '2024-01-04' },
      { input: '01.04.2024', expected: '2024-04-01' },
      { input: '1.04.2024', expected: '2024-04-01' },
      { input: '04.01.24', expected: '2024-01-04' },
      { input: '4.01.24', expected: '2024-01-04' },
      { input: '04.1.24', expected: '2024-01-04' },
      { input: '4.1.24', expected: '2024-01-04' },
      { input: '01.04.24', expected: '2024-04-01' },
      { input: '1.04.24', expected: '2024-04-01' },
      { input: '01.4.24', expected: '2024-04-01' },
      { input: '1.4.24', expected: '2024-04-01' },
      { input: '04/01/2024', expected: '2024-01-04' },
      { input: '4/01/2024', expected: '2024-01-04' },
      { input: '04/1/2024', expected: '2024-01-04' },
      { input: '4/1/2024', expected: '2024-01-04' },
      { input: '01/04/2024', expected: '2024-04-01' },
      { input: '1/04/2024', expected: '2024-04-01' },
      { input: '01/4/2024', expected: '2024-04-01' },
      { input: '1/4/2024', expected: '2024-04-01' },
      { input: '04 / 01 / 2024', expected: '2024-01-04' },
      { input: '4 / 01 / 2024', expected: '2024-01-04' },
      { input: '04 / 1 / 2024', expected: '2024-01-04' },
      { input: '4 / 1 / 2024', expected: '2024-01-04' },
      { input: '01 / 04 / 2024', expected: '2024-04-01' },
      { input: '1 / 04 / 2024', expected: '2024-04-01' },
      { input: '01 / 4 / 2024', expected: '2024-04-01' },
      { input: '1 / 4 / 2024', expected: '2024-04-01' },
      { input: '04/01/24', expected: '2024-01-04' },
      { input: '4/01/24', expected: '2024-01-04' },
      { input: '04/1/24', expected: '2024-01-04' },
      { input: '4/1/24', expected: '2024-01-04' },
      { input: '01/04/24', expected: '2024-04-01' },
      { input: '1/04/24', expected: '2024-04-01' },
      { input: '01/4/24', expected: '2024-04-01' },
      { input: '1/4/24', expected: '2024-04-01' },
      { input: '04 / 01 / 24', expected: '2024-01-04' },
      { input: '4 / 01 / 24', expected: '2024-01-04' },
      { input: '04 / 1 / 24', expected: '2024-01-04' },
      { input: '4 / 1 / 24', expected: '2024-01-04' },
      { input: '01 / 04 / 24', expected: '2024-04-01' },
      { input: '1 / 04 / 24', expected: '2024-04-01' },
      { input: '01 / 4 / 24', expected: '2024-04-01' },
      { input: '1 / 4 / 24', expected: '2024-04-01' },
      { input: '2024-04-01', expected: '2024-04-01' },
      { input: '2024', expected: '2024-01-01' },
      { input: '2024-01', expected: '2024-01-01' },
      { input: '202401', expected: '2024-01-01' },
      { input: '2024-01-04T09', expected: '2024-01-04' },
      { input: '2024-01-04T09:24', expected: '2024-01-04' },
      { input: '2024-01-04T09:24:15', expected: '2024-01-04' },
      { input: '2024-01-04T09:24:15.123', expected: '2024-01-04' },
      { input: '2024-01-04T0924', expected: '2024-01-04' },
      { input: '2024-01-04T092415', expected: '2024-01-04' },
      { input: '2024-01-04T092415.123', expected: '2024-01-04' },
      { input: '2024-01-04T09:24:15,123', expected: '2024-01-04' },
      { input: '4TH january 2024', expected: '2024-01-04' },
      { input: '4TH jan 2024', expected: '2024-01-04' },
      { input: '4TH january 24', expected: '2024-01-04' },
      { input: '4TH jan 24', expected: '2024-01-04' },
      { input: '4 january 2024', expected: '2024-01-04' },
      { input: '4 jan 2024', expected: '2024-01-04' },
      { input: '4 january 24', expected: '2024-01-04' },
      { input: '4 jan 24', expected: '2024-01-04' },
      { input: '4-january-2024', expected: '2024-01-04' },
      { input: '4-jan-2024', expected: '2024-01-04' },
      { input: '4-january-24', expected: '2024-01-04' },
      { input: '4-jan-24', expected: '2024-01-04' },
      { input: 'january 4, 2024', expected: '2024-01-04' },
      { input: 'january 04, 2024', expected: '2024-01-04' },
      { input: 'january 4 2024', expected: '2024-01-04' },
      { input: 'january 04 2024', expected: '2024-01-04' },
      { input: undefined, expected: undefined },
      { input: null, expected: undefined },
      { input: '', expected: undefined },
      { input: ' ', expected: undefined },
      { input: '0', expected: undefined },
      { input: '01-2024', expected: undefined },
    ]

    describe.each(testCases)('', ({ input, expected }) => {
      it(`should return ${expected} when input is ${input}`, () => {
        expect<Date | undefined>(parseDateOnly(input as string)).toEqual(
          expected ? new Date(expected as string) : undefined,
        )
      })
    })
  })

  describe('getLatestDate', () => {
    const testCases = [
      {
        date1: '2024-01-01',
        date2: '2025-01-01',
        date3: '2024-01-01',
        expected: '2025-01-01',
      },
      {
        date1: '2024-02-01',
        date2: '2024-10-01',
        date3: '2024-01-01',
        expected: '2024-10-01',
      },
      {
        date1: '2024-03-01',
        date2: '2024-01-01',
        date3: '2024-01-01',
        expected: '2024-03-01',
      },
      {
        date1: '2024-04-01',
        date2: '2024-01-01',
        date3: '2024-01-01',
        expected: '2024-04-01',
      },
      {
        date1: '2024-05-01',
        date2: '2024-01-01',
        date3: '2024-01-01',
        expected: '2024-05-01',
      },
      {
        date1: '2024-12-12',
        date2: '2024-13-12',
        date3: '2024-11-11',
        expected: '2024-12-12',
      },
      {
        date1: '2024-12-12',
        date2: '',
        date3: undefined,
        expected: '2024-12-12',
      },
      {
        date1: undefined,
        date2: undefined,
        date3: '2024-12-12',
        expected: '2024-12-12',
      },
      { date3: '2024-12-12', expected: '2024-12-12' },
      { date3: '', expected: undefined },
      { date1: undefined, expected: undefined },
    ]

    describe.each(testCases)('', (testCase) => {
      it(`should return ${testCase.expected} as max date when dates are: [${testCase.date1} ${testCase.date2} ${testCase.date3}]`, () => {
        expect(
          getLatestDate([testCase.date1, testCase.date2, testCase.date3]),
        ).toEqual(testCase.expected as string)
      })
    })
  })
})

// Tests
describe('getTimeRangeInUtc', () => {
  test('returns correct UTC', () => {
    const input = new Date('2025-04-23T05:00:00Z') // 3PM Sydney time
    const { startTimeUtc, endTimeUtc } = getTimeRangeInUtc(input)

    expect(startTimeUtc.toISOString()).toBe('2025-04-22T14:00:00.000Z')
    expect(endTimeUtc.toISOString()).toBe('2025-04-23T13:59:00.000Z')
  })

  test('AU start/end UTC on April 23, 2025 (AEST)', () => {
    const input = new Date('2025-04-23T12:00:00Z') // any UTC time that day
    const { startTimeUtc, endTimeUtc } = getTimeRangeInUtc(input)

    expect(startTimeUtc.toISOString()).toBe('2025-04-22T14:00:00.000Z') // AU 00:00 is 14:00 UTC
    expect(endTimeUtc.toISOString()).toBe('2025-04-23T13:59:00.000Z') // AU 23:59 is 13:59 UTC
  })

  // December 25, 2025 (DST - AEDT)
  test('AU start/end UTC on Christmas 2025 (AEDT)', () => {
    const input = new Date('2025-12-25T00:00:00Z')
    const { startTimeUtc, endTimeUtc } = getTimeRangeInUtc(input)

    expect(startTimeUtc.toISOString()).toBe('2025-12-24T13:00:00.000Z') // AEDT = UTC+11
    expect(endTimeUtc.toISOString()).toBe('2025-12-25T12:59:00.000Z')
  })

  // Just before DST ends (first Sunday in April)
  test('AU start/end UTC on April 6, 2025 (DST ends)', () => {
    const input = new Date('2025-04-06T00:00:00Z')
    const { startTimeUtc, endTimeUtc } = getTimeRangeInUtc(input)

    expect(startTimeUtc.toISOString()).toBe('2025-04-05T13:00:00.000Z') // Still AEDT at midnight
    expect(endTimeUtc.toISOString()).toBe('2025-04-06T13:59:00.000Z') // Ends with AEST
  })

  // Just after DST starts (first Sunday in October)
  test('AU start/end UTC on October 5, 2025 (DST starts)', () => {
    const input = new Date('2025-10-05T00:00:00Z')
    const { startTimeUtc, endTimeUtc } = getTimeRangeInUtc(input)

    expect(startTimeUtc.toISOString()).toBe('2025-10-04T14:00:00.000Z') // AEST (UTC+10)
    expect(endTimeUtc.toISOString()).toBe('2025-10-05T12:59:00.000Z') // AEDT (UTC+11)
  })

  test('AU start/end UTC for current day (now)', () => {
    const now = new Date()
    const { startTimeUtc, endTimeUtc } = getTimeRangeInUtc(now)

    // Sanity checks:
    expect(startTimeUtc instanceof Date).toBe(true)
    expect(endTimeUtc instanceof Date).toBe(true)
    expect(startTimeUtc.getTime()).toBeLessThan(endTimeUtc.getTime())

    // The difference between end and start should be nearly 24 hours (1439 minutes)
    const diffMinutes =
      (endTimeUtc.getTime() - startTimeUtc.getTime()) / 1000 / 60
    expect(diffMinutes).toBeGreaterThanOrEqual(1438) // give margin for 1 minute
    expect(diffMinutes).toBeLessThanOrEqual(1441) // tolerate DST shift edge
  })
})

describe('isIsoDateString', () => {
  it('returns true for valid ISO 8601 date strings', () => {
    expect(isIsoDateString('2025-07-03T01:05:39Z')).toBe(true)
    expect(isIsoDateString('2025-07-03T01:05:39.123Z')).toBe(true)
    expect(isIsoDateString('2025-07-03T01:05:39+10:00')).toBe(true)
    expect(isIsoDateString('2025-07-03T01:05:39-05:00')).toBe(true)
    expect(isIsoDateString('2025-07-03T01:05:39.123+10:00')).toBe(true)
  })

  it('returns false for non-ISO date strings', () => {
    expect(isIsoDateString('2025-07-03')).toBe(false)
    expect(isIsoDateString('03/07/2025')).toBe(false)
    expect(isIsoDateString('July 3, 2025')).toBe(false)
    expect(isIsoDateString('2025-07-03T25:61:61Z')).toBe(false) // invalid time
    expect(isIsoDateString('')).toBe(false)
    expect(isIsoDateString('not a date')).toBe(false)
  })

  it('returns false for non-string input', () => {
    // @ts-expect-error
    expect(isIsoDateString(null)).toBe(false)
    // @ts-expect-error
    expect(isIsoDateString(undefined)).toBe(false)
    // @ts-expect-error
    expect(isIsoDateString(12345)).toBe(false)
  })
})
