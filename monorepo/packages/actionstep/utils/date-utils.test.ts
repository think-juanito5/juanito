import { describe, expect, it } from 'bun:test'
import { getActionStepDateTimeFormat } from './date-utils'

describe('getActionStepDateTimeFormat', () => {
  it('formats a typical UTC date and AEDT time correctly', () => {
    const date = new Date('2024-05-05T04:00:00Z') // 2024-05-05 in Melbourne
    const time = '14:30:00'
    expect(getActionStepDateTimeFormat(date, time)).toBe('2024-05-05 14:30:00')
  })

  it('formats a UTC date on a different day in Melbourne', () => {
    const date = new Date('2024-05-04T14:00:00Z') // 2024-05-05 in Melbourne
    const time = '09:00:00'
    expect(getActionStepDateTimeFormat(date, time)).toBe('2024-05-05 09:00:00')
  })

  it('handles midnight time correctly', () => {
    const date = new Date('2024-01-01T13:00:00Z') // 2024-01-02 in Melbourne
    const time = '00:00:00'
    expect(getActionStepDateTimeFormat(date, time)).toBe('2024-01-02 00:00:00')
  })

  it('handles daylight saving time start (AEDT to AEST)', () => {
    // DST ends in Melbourne on 2024-04-07 at 3:00 am (clocks go back to 2:00 am)
    const date = new Date('2024-04-06T16:00:00Z') // 2024-04-07 in Melbourne
    const time = '02:30:00'
    expect(getActionStepDateTimeFormat(date, time)).toBe('2024-04-07 02:30:00')
  })

  it('handles daylight saving time end (AEST to AEDT)', () => {
    // DST starts in Melbourne on 2024-10-06 at 2:00 am (clocks go forward to 3:00 am)
    const date = new Date('2024-10-05T16:00:00Z') // 2024-10-06 in Melbourne
    const time = '03:30:00'
    expect(getActionStepDateTimeFormat(date, time)).toBe('2024-10-06 03:30:00')
  })

  it('handles single-digit months and days with leading zeros', () => {
    const date = new Date('2024-02-03T14:00:00Z') // 2024-02-04 in Melbourne
    const time = '08:15:00'
    expect(getActionStepDateTimeFormat(date, time)).toBe('2024-02-04 08:15:00')
  })

  it('adds any old random suffix', () => {
    const date = new Date('2024-05-05T04:00:00Z') // 2024-05-05 in Melbourne
    const time = 'turnip'
    expect(() => getActionStepDateTimeFormat(date, time)).toThrow(
      'aedtTime must be in "HH:mm:ss" 24-hour format',
    )
  })
})
