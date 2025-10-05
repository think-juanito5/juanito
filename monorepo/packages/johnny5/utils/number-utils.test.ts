import { describe, expect, it } from 'bun:test'
import {
  containsPercentage,
  convertPercentageToDecimal,
  parseNumberOnly,
} from './number-utils'

describe('number-utils', () => {
  describe('containsPercentage', () => {
    it('should return true when the input contains a percentage', () => {
      expect(containsPercentage('50%')).toBe(true)
    })

    it('should return false when the input does not contain a percentage', () => {
      expect(containsPercentage('50')).toBe(false)
    })
  })

  describe('convertPercentageToDecimal', () => {
    it('should convert a percentage string to a decimal number', () => {
      expect(convertPercentageToDecimal('50%')).toBe(0.5)
    })

    it('should return undefined when the input does not contain a percentage', () => {
      expect(convertPercentageToDecimal('50')).toBeUndefined()
    })
  })

  describe('parseNumberOnly', () => {
    it('should return undefined when the input is undefined', () => {
      expect(parseNumberOnly(undefined as unknown as string)).toBeUndefined()
    })

    it('should return undefined when the input is null', () => {
      expect(parseNumberOnly(null as unknown as string)).toBeUndefined()
    })

    it('should return undefined when the input is empty', () => {
      expect(parseNumberOnly('')).toBeUndefined()
    })

    it('should return undefined when the input contains a percentage', () => {
      expect(parseNumberOnly('50%')).toBeUndefined()
    })

    it('should parse and return the number from a string with dollar sign', () => {
      expect(parseNumberOnly('$50')).toBe(50)
    })

    it('should parse and return the number from a string with spaces', () => {
      expect(parseNumberOnly(' 50 ')).toBe(50)
    })

    it('should parse and return the number from a string with commas', () => {
      expect(parseNumberOnly('1,000')).toBe(1000)
    })

    it('should return undefined when the input does not contain a number', () => {
      expect(parseNumberOnly('abc')).toBeUndefined()
    })
  })
})
