import { describe, expect, it } from 'bun:test'
import { IsMobileNumber, validateMobileNumber } from './mobilenumber'

describe('validateMobileNumber', () => {
  it('should validate correct Australian mobile numbers', () => {
    const validNumbers = [
      '+61412345678',
      '0412 345 678',
      '0412345678',
      '+61 412 345 678',
      '61412345678',
    ]
    validNumbers.forEach((number) => {
      const result = validateMobileNumber(number)
      expect(result.isValid).toBe(true)
      expect(result.countryCode).toBe('AU')
      expect(result.phoneNumberType).toBe('MOBILE')
      expect(result.errorMessage).toBeUndefined()
    })
  })

  it('should invalidate non-Australian or invalid numbers', () => {
    const invalidNumbers = [
      '',
      null,
      undefined,
      '12345',
      '+15551234567', // US number
      '020 7946 0958', // UK landline
      '0412-345-6789', // Too many digits
      '0412 345', // Too short
      'not a number',
    ]
    invalidNumbers.forEach((number) => {
      // @ts-expect-error: testing invalid input
      const result = validateMobileNumber(number)
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBeDefined()
    })
  })

  it('should return correct originalNumber', () => {
    const input = '0412 345 678'
    const result = validateMobileNumber(input)
    expect(result.originalNumber).toBe(input)
  })
})

describe('IsMobileNumber', () => {
  it('should return true for valid AU mobile numbers', () => {
    expect(IsMobileNumber('+61412345678')).toBe(true)
    expect(IsMobileNumber('0412 345 678')).toBe(true)
  })

  it('should return false for invalid or non-AU numbers', () => {
    expect(IsMobileNumber('')).toBe(false)
    expect(IsMobileNumber('12345')).toBe(false)
    expect(IsMobileNumber('+15551234567')).toBe(false)
  })
})
