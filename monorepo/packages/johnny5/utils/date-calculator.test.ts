import { describe, expect, it } from 'bun:test'
import { dateCalculator, yearEndShutdown } from './date-calculator'

describe('dateCalculator', () => {
  describe('isWorkingDay', () => {
    it('returns true for a weekday that is not a holiday', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-06') // Wednesday, March 6, 2024
      expect(calculator.isWorkingDay(date)).toBe(true)
    })

    it('returns false for a weekend', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-09') // Saturday, March 9, 2024
      expect(calculator.isWorkingDay(date)).toBe(false)
    })

    it('returns false for a public holiday', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-01-01') // Monday, New Year's Day
      expect(calculator.isWorkingDay(date)).toBe(false)
    })

    it('returns false for a custom holiday', () => {
      const calculator = dateCalculator('VIC', [{ day: 15, month: 3 }])
      const date = new Date('2024-03-15') // Friday, March 15, 2024
      expect(calculator.isWorkingDay(date)).toBe(false)
    })

    it('returns true when not a custom holiday', () => {
      const calculator = dateCalculator('VIC', [{ day: 20, month: 3 }])
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.isWorkingDay(date)).toBe(true)
    })

    it('returns true for partial holidays', () => {
      const calculator = dateCalculator('QLD')
      const date = new Date('2024-12-24 20:00:00') // Tuesday, December 24, 2024, 8:00 PM
      expect(calculator.isWorkingDay(date)).toBe(true)
    })

    const yearEndCases = [
      { date: new Date('2024-12-27'), expected: true },
      { date: new Date('2024-12-28'), expected: true },
      { date: new Date('2024-12-29'), expected: true },
      { date: new Date('2024-12-30'), expected: true },
      { date: new Date('2024-12-31'), expected: true },
    ]

    it.each(yearEndCases)(
      'should calculate year end with %p',
      ({ date, expected }) => {
        const calculator = dateCalculator('VIC', yearEndShutdown)
        expect(calculator.isHoliday(date)).toBe(expected)
      },
    )
  })

  describe('isHoliday', () => {
    it('returns false for a weekday that is not a holiday', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-06') // Wednesday, March 6, 2024
      expect(calculator.isHoliday(date)).toBe(false)
    })

    it('returns true for a weekend', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-09') // Saturday, March 9, 2024
      expect(calculator.isHoliday(date)).toBe(true)
    })

    it('returns true for a public holiday', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-01-01') // Monday, New Year's Day
      expect(calculator.isHoliday(date)).toBe(true)
    })

    it('returns true for a custom holiday', () => {
      const calculator = dateCalculator('VIC', [{ day: 15, month: 3 }])
      const date = new Date('2024-03-15') // Friday, March 15, 2024
      expect(calculator.isHoliday(date)).toBe(true)
    })

    it('returns false when not a custom holiday', () => {
      const calculator = dateCalculator('VIC', [{ day: 20, month: 3 }])
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.isHoliday(date)).toBe(false)
    })

    it('returns false for partial holidays', () => {
      const calculator = dateCalculator('QLD')
      const date = new Date('2024-12-24 20:00:00') // Tuesday, December 24, 2024, 8:00 PM
      expect(calculator.isHoliday(date)).toBe(false)
    })

    const yearEndCases = [
      { date: new Date('2024-12-27'), expected: false },
      { date: new Date('2024-12-28'), expected: false },
      { date: new Date('2024-12-29'), expected: false },
      { date: new Date('2024-12-30'), expected: false },
      { date: new Date('2024-12-31'), expected: false },
    ]

    it.each(yearEndCases)(
      'should calculate year end with %p',
      ({ date, expected }) => {
        const calculator = dateCalculator('VIC', yearEndShutdown)
        expect(calculator.isWorkingDay(date)).toBe(expected)
      },
    )
  })

  describe('getNextWorkingDay', () => {
    it('returns same day when a working day', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.getNextWorkingDay(date)).toEqual(new Date('2024-03-19'))
    })

    it('returns following Monday when a Saturday', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-23') // Sunday, March 23, 2024
      expect(calculator.getNextWorkingDay(date)).toEqual(new Date('2024-03-25'))
    })

    it('returns following Monday when a Sunday', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-24') // Monday, March 24, 2024
      expect(calculator.getNextWorkingDay(date)).toEqual(new Date('2024-03-25'))
    })

    it('returns following Tuesday when falls on Easter (Good Friday)', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-29') // Friday, March 29, 2024
      expect(calculator.getNextWorkingDay(date)).toEqual(new Date('2024-04-02'))
    })

    it('returns following working day when falls on a custom holiday', () => {
      const calculator = dateCalculator('VIC', [
        { day: 13, month: 3 },
        { day: 14, month: 3 },
      ])
      const date = new Date('2024-03-13') // Wednesday, March 13, 2024
      expect(calculator.getNextWorkingDay(date)).toEqual(new Date('2024-03-15'))
    })

    const yearEndCases = [
      { date: new Date('2024-12-27'), expected: new Date('2025-01-02') },
      { date: new Date('2024-12-28'), expected: new Date('2025-01-02') },
      { date: new Date('2024-12-29'), expected: new Date('2025-01-02') },
      { date: new Date('2024-12-30'), expected: new Date('2025-01-02') },
      { date: new Date('2024-12-31'), expected: new Date('2025-01-02') },
    ]

    it.each(yearEndCases)('should calculate with %p', ({ date, expected }) => {
      const calculator = dateCalculator('VIC', yearEndShutdown)
      expect(calculator.getNextWorkingDay(date)).toEqual(expected)
    })
  })

  describe('offsetWorkingDays', () => {
    it('returns same day when a working day and offset is 0', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetWorkingDays(date, 0)).toEqual(
        new Date('2024-03-19'),
      )
    })

    it('returns next day when it is a working day', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetWorkingDays(date, 1)).toEqual(
        new Date('2024-03-20'),
      )
    })

    it('returns correct offset when it is a working day', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetWorkingDays(date, 3)).toEqual(
        new Date('2024-03-22'),
      )
    })

    it('returns following Monday, skipping weekend', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetWorkingDays(date, 4)).toEqual(
        new Date('2024-03-25'),
      )
    })

    it('returns following Tuesday, skipping weekend', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetWorkingDays(date, 5)).toEqual(
        new Date('2024-03-26'),
      )
    })

    it('returns following Wednesday, skipping weekend and custom holiday', () => {
      const calculator = dateCalculator('VIC', [{ day: 20, month: 3 }])
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetWorkingDays(date, 5)).toEqual(
        new Date('2024-03-27'),
      )
    })

    const yearEndCases = [
      {
        date: new Date('2024-12-23'),
        offsetDays: 5,
        expected: new Date('2025-01-07'),
      },
      {
        date: new Date('2024-12-24'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2024-12-25'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2024-12-26'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2024-12-27'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2024-12-28'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2024-12-29'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2024-12-30'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2024-12-31'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2025-01-01'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2025-01-02'),
        offsetDays: 5,
        expected: new Date('2025-01-09'),
      },
      {
        date: new Date('2025-01-03'),
        offsetDays: 5,
        expected: new Date('2025-01-10'),
      },
      {
        date: new Date('2025-01-04'),
        offsetDays: 5,
        expected: new Date('2025-01-10'),
      },
      {
        date: new Date('2025-01-05'),
        offsetDays: 5,
        expected: new Date('2025-01-10'),
      },
      {
        date: new Date('2025-01-06'),
        offsetDays: 5,
        expected: new Date('2025-01-13'),
      },
    ]

    it.each(yearEndCases)(
      'should calculate with %p',
      ({ date, offsetDays, expected }) => {
        const calculator = dateCalculator('VIC', yearEndShutdown)
        expect(calculator.offsetWorkingDays(date, offsetDays)).toEqual(expected)
      },
    )
  })

  describe('offsetCaldendarDays', () => {
    it('returns same day when offset is 0', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetCaldendarDays(date, 0)).toEqual(
        new Date('2024-03-19'),
      )
    })

    it('returns next day', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetCaldendarDays(date, 1)).toEqual(
        new Date('2024-03-20'),
      )
    })

    it('returns correct offset', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetCaldendarDays(date, 3)).toEqual(
        new Date('2024-03-22'),
      )
    })

    it('returns correct offset on Saturday', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetCaldendarDays(date, 4)).toEqual(
        new Date('2024-03-23'),
      )
    })

    it('returns correct offset on Sunday', () => {
      const calculator = dateCalculator('VIC')
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetCaldendarDays(date, 5)).toEqual(
        new Date('2024-03-24'),
      )
    })

    it('returns correct offset ignoring custom holiday', () => {
      const calculator = dateCalculator('VIC', [{ day: 20, month: 3 }])
      const date = new Date('2024-03-19') // Tuesday, March 19, 2024
      expect(calculator.offsetCaldendarDays(date, 5)).toEqual(
        new Date('2024-03-24'),
      )
    })

    const yearEndCases = [
      {
        date: new Date('2024-12-23'),
        offsetDays: 5,
        expected: new Date('2024-12-28'),
      },
      {
        date: new Date('2024-12-24'),
        offsetDays: 5,
        expected: new Date('2024-12-29'),
      },
      {
        date: new Date('2024-12-25'),
        offsetDays: 5,
        expected: new Date('2024-12-30'),
      },
      {
        date: new Date('2024-12-26'),
        offsetDays: 5,
        expected: new Date('2024-12-31'),
      },
      {
        date: new Date('2024-12-27'),
        offsetDays: 5,
        expected: new Date('2025-01-01'),
      },
      {
        date: new Date('2024-12-28'),
        offsetDays: 5,
        expected: new Date('2025-01-02'),
      },
      {
        date: new Date('2024-12-29'),
        offsetDays: 5,
        expected: new Date('2025-01-03'),
      },
      {
        date: new Date('2024-12-30'),
        offsetDays: 5,
        expected: new Date('2025-01-04'),
      },
      {
        date: new Date('2024-12-31'),
        offsetDays: 5,
        expected: new Date('2025-01-05'),
      },
      {
        date: new Date('2025-01-01'),
        offsetDays: 5,
        expected: new Date('2025-01-06'),
      },
      {
        date: new Date('2025-01-02'),
        offsetDays: 5,
        expected: new Date('2025-01-07'),
      },
      {
        date: new Date('2025-01-03'),
        offsetDays: 5,
        expected: new Date('2025-01-08'),
      },
      {
        date: new Date('2025-01-04'),
        offsetDays: 5,
        expected: new Date('2025-01-09'),
      },
      {
        date: new Date('2025-01-05'),
        offsetDays: 5,
        expected: new Date('2025-01-10'),
      },
      {
        date: new Date('2025-01-06'),
        offsetDays: 5,
        expected: new Date('2025-01-11'),
      },
    ]

    it.each(yearEndCases)(
      'should calculate with %p',
      ({ date, offsetDays, expected }) => {
        const calculator = dateCalculator('VIC', yearEndShutdown)
        expect(calculator.offsetCaldendarDays(date, offsetDays)).toEqual(
          expected,
        )
      },
    )
  })
})
