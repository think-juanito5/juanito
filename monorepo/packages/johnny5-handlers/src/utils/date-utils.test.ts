import { describe, expect, test } from 'bun:test'
import { formatIsoWithSydneyAuTimezone } from './date-utils'

describe('formatIsoWithSydneyAuTimezone', () => {
  test('Date only value should be in ISO 8601 format with AU/Sydney Timezone AEST', () => {
    const date = new Date('2024-07-18')
    const response = formatIsoWithSydneyAuTimezone(date)
    expect(response).toEqual('2024-07-18T00:00:00+10:00')
  })

  test('Date with time should be in ISO 8601 format with AU/Sydney Timezone AEST', () => {
    const date = new Date('2024-07-18 15:30:45')
    const response = formatIsoWithSydneyAuTimezone(date)
    expect(response).toEqual('2024-07-18T15:30:45+10:00')
  })

  test('Date only value should be in ISO 8601 format with AU/Sydney Timezone AEDT', () => {
    const date = new Date('2024-10-18')
    const response = formatIsoWithSydneyAuTimezone(date)
    expect(response).toEqual('2024-10-18T00:00:00+11:00')
  })

  test('Date with time should be in ISO 8601 format with AU/Sydney Timezone AEDT', () => {
    const date = new Date('2024-10-18 15:30:45')
    const response = formatIsoWithSydneyAuTimezone(date)
    expect(response).toEqual('2024-10-18T15:30:45+11:00')
  })
})
