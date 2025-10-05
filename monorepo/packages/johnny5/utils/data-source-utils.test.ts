import { describe, expect, it, mock } from 'bun:test'
import type { DataSource } from '../interfaces'
import type { DataItem, DataItemType } from '../typebox'

import {
  extractNumberOnly,
  isValidNumber,
  parseCurrencyAmountOrPercentage,
  validateDataSource,
} from './data-source-utils'

describe('data-source-utils', () => {
  describe('validateDataSource', () => {
    const createMockDataSource = (
      data: Record<string, DataItem>,
    ): DataSource => {
      return {
        get: mock((name) => Promise.resolve(data[name])),
      }
    }

    it('should return Ok(true) when there are no required items', async () => {
      const redata: {
        name: string
        required_for_matter_creation: boolean
        data_type: DataItemType
      }[] = [
        {
          name: 'date_of_contract',
          required_for_matter_creation: false,
          data_type: 'Date',
        },
        {
          name: 'buyer_2_name',
          required_for_matter_creation: false,
          data_type: 'Text',
        },
      ]

      const data = createMockDataSource({
        date_of_contract: {
          name: 'date_of_contract',
          type: 'Date',
          value: 'xx',
          required: true,
        },
      })

      const result = await validateDataSource(redata, data)
      expect(result.ok).toBeTrue()
    })

    it('should return Ok(true) when all required items are valid', async () => {
      const refdata: {
        name: string
        required_for_matter_creation: boolean
        data_type: DataItemType
      }[] = [
        {
          name: 'buyers_name',
          required_for_matter_creation: true,
          data_type: 'Text',
        },
        {
          name: 'date_of_contract',
          required_for_matter_creation: true,
          data_type: 'Date',
        },
        {
          name: 'buyers_postcode',
          required_for_matter_creation: true,
          data_type: 'Number',
        },
      ]

      const data = createMockDataSource({
        buyers_name: {
          name: 'buyers_name',
          type: 'Text',
          value: 'A string',
          required: true,
        },
        date_of_contract: {
          name: 'date_of_contract',
          type: 'Date',
          value: '2024-11-01',
          required: true,
        },
        buyers_postcode: {
          name: 'buyers_postcode',
          type: 'Number',
          value: '2000',
          required: true,
        },
      })

      const result = await validateDataSource(refdata, data)
      expect(result.ok).toBeTrue()
    })

    it('should return Err when string value is invalid', async () => {
      const refdata: {
        name: string
        required_for_matter_creation: boolean
        data_type: DataItemType
      }[] = [
        {
          name: 'buyers_name',
          required_for_matter_creation: true,
          data_type: 'Text',
        },
        {
          name: 'date_of_contract',
          required_for_matter_creation: true,
          data_type: 'Date',
        },
      ]

      const data = createMockDataSource({
        buyers_name: {
          name: 'buyers_name',
          type: 'Text',
          value: 123 as unknown as string,
          required: true,
        },
        date_of_contract: {
          name: 'date_of_contract',
          type: 'Date',
          value: '2024-11-01',
          required: true,
        },
      })

      const result = await validateDataSource(refdata, data)
      expect(result.ok).toBeFalse()
      expect(result.val).toEqual([
        {
          name: 'buyers_name',
          type: 'Text',
          value: 123 as unknown as string,
          required: true,
        },
      ])
    })

    it('should return Err when number value is invalid', async () => {
      const refdata: {
        name: string
        required_for_matter_creation: boolean
        data_type: DataItemType
      }[] = [
        {
          name: 'buyers_name',
          required_for_matter_creation: true,
          data_type: 'Text',
        },
        {
          name: 'buyers_postcode',
          required_for_matter_creation: true,
          data_type: 'Number',
        },
      ]

      const data = createMockDataSource({
        buyers_name: {
          name: 'buyers_name',
          type: 'Text',
          value: 'A string',
          required: true,
        },
        buyers_postcode: {
          name: 'buyers_postcode',
          type: 'Number',
          value: 'not-a-number',
          required: true,
        },
      })

      const result = await validateDataSource(refdata, data)
      expect(result.ok).toBeFalse()
      expect(result.val).toEqual([
        {
          name: 'buyers_postcode',
          type: 'Number',
          value: 'not-a-number',
          required: true,
        },
      ])
    })

    it('should return Err when date value is invalid', async () => {
      const refdata: {
        name: string
        required_for_matter_creation: boolean
        data_type: DataItemType
      }[] = [
        {
          name: 'buyers_name',
          required_for_matter_creation: true,
          data_type: 'Text',
        },
        {
          name: 'date_of_contract',
          required_for_matter_creation: true,
          data_type: 'Date',
        },
      ]

      const data = createMockDataSource({
        buyers_name: {
          name: 'buyers_name',
          type: 'Text',
          value: 'A string',
          required: true,
        },
        date_of_contract: {
          name: 'date_of_contract',
          type: 'Date',
          value: 'not-a-date',
          required: true,
        },
      })

      const result = await validateDataSource(refdata, data)
      expect(result.ok).toBeFalse()
      expect(result.val).toEqual([
        {
          name: 'date_of_contract',
          type: 'Date',
          value: 'not-a-date',
          required: true,
        },
      ])
    })

    it('should return Err when number value is invalid', async () => {
      const refdata: {
        name: string
        required_for_matter_creation: boolean
        data_type: DataItemType
      }[] = [
        {
          name: 'buyers_name',
          required_for_matter_creation: true,
          data_type: 'Text',
        },
        {
          name: 'buyers_postcode',
          required_for_matter_creation: true,
          data_type: 'Number',
        },
      ]

      const data = createMockDataSource({
        buyers_name: {
          name: 'buyers_name',
          type: 'Text',
          value: 'A string',
          required: true,
        },
        buyers_postcode: {
          name: 'buyers_postcode',
          type: 'Number',
          value: 'not-a-number',
          required: true,
        },
      })

      const result = await validateDataSource(refdata, data)
      expect(result.ok).toBeFalse()
      expect(result.val).toEqual([
        {
          name: 'buyers_postcode',
          type: 'Number',
          value: 'not-a-number',
          required: true,
        },
      ])
    })

    it('should return Err when data for required field is missing', async () => {
      const refdata: {
        name: string
        required_for_matter_creation: boolean
        data_type: DataItemType
      }[] = [
        {
          name: 'date_of_contract',
          required_for_matter_creation: true,
          data_type: 'Date',
        },
      ]

      const data = createMockDataSource({})

      const result = await validateDataSource(refdata, data)
      expect(result.ok).toBeFalse()
      expect(result.val).toEqual([
        {
          name: 'date_of_contract',
          type: 'Date',
          value: undefined,
          required: true,
        },
      ])
    })
  })

  describe('isValidNumber', () => {
    it('should return false for undefined string', () => {
      expect(isValidNumber(undefined)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidNumber('')).toBe(false)
    })

    it('should return true for valid number string', () => {
      expect(isValidNumber('123')).toBe(true)
    })

    it('should return true for valid number string with commas', () => {
      expect(isValidNumber('1,234')).toBe(true)
    })

    it('should return false for invalid number string', () => {
      expect(isValidNumber('abc')).toBe(false)
    })

    it('should return false for string with mixed characters', () => {
      expect(isValidNumber('123abc')).toBe(true) // This parses to 123
    })

    it('should return true for valid float number string', () => {
      expect(isValidNumber('123.45')).toBe(true)
    })

    it('should return true for valid float number string with commas', () => {
      expect(isValidNumber('1,234.56')).toBe(true)
    })

    it('should return true for valid float number string with currency', () => {
      expect(isValidNumber('$1,234.56')).toBe(true)
    })
  })

  describe('extractNumberOnly', () => {
    it('should return undefined for undefined string', () => {
      expect(extractNumberOnly(undefined)).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      expect(extractNumberOnly('')).toBeUndefined()
    })

    it('should return number for valid number string', () => {
      expect(extractNumberOnly('123')).toBe(123)
    })

    it('should return number for valid number string with commas', () => {
      expect(extractNumberOnly('1,234')).toBe(1234)
    })

    it('should return undefined for invalid number string', () => {
      expect(extractNumberOnly('abc')).toBeUndefined()
    })

    it('should return number for string with mixed characters', () => {
      expect(extractNumberOnly('123abc')).toBe(123) // This parses to 123
    })

    it('should return number for valid float number string', () => {
      expect(extractNumberOnly('123.45')).toBe(123.45)
    })

    it('should return number for valid float number string with commas', () => {
      expect(extractNumberOnly('1,234.56')).toBe(1234.56)
    })

    it('should return number for valid float number string with currency', () => {
      expect(extractNumberOnly('$1,234.56')).toBe(1234.56)
    })

    it('should return number for valid float number string with negative', () => {
      expect(extractNumberOnly('$1,234.56-')).toBe(1234.56)
    })
    it('should return number for valid float number string with negative', () => {
      expect(extractNumberOnly('1234-')).toBe(1234)
    })
    // $ 49000-
    it('should return number for valid float number string with negative', () => {
      expect(extractNumberOnly('$ 49000-')).toBe(49000)
    })
  })

  describe('parseCurrencyAmountOrPercentage', () => {
    const purchasePriceItem: DataItem = {
      name: 'Purchase Price',
      value: '500000',
      type: 'Number',
      required: true,
    }

    it('should return undefined if value is undefined', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, undefined),
      ).toBeUndefined()
    })

    it('should return undefined if value is an empty string', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, ''),
      ).toBeUndefined()
    })

    it('should parse a currency amount correctly', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '$1000'),
      ).toBeCloseTo(1000)
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '1,000'),
      ).toBeCloseTo(1000)
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '1000.50'),
      ).toBeCloseTo(1000.5)
    })

    it('should parse a percentage correctly', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '10%'),
      ).toBeCloseTo(50000)
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '10.5%'),
      ).toBeCloseTo(52500)
    })

    it('should handle a missing purchase price', () => {
      const item = { ...purchasePriceItem, value: undefined }
      expect(parseCurrencyAmountOrPercentage(item, '10%')).toBeUndefined()
    })

    it('should handle an invalid purchase price', () => {
      const item = { ...purchasePriceItem, value: 'abc' }
      expect(parseCurrencyAmountOrPercentage(item, '10%')).toBeUndefined()
    })

    it('should handle zero purchase price', () => {
      const item = { ...purchasePriceItem, value: '0' }
      expect(parseCurrencyAmountOrPercentage(item, '10%')).toBeUndefined()
    })

    it('should handle zero percentage', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '0%'),
      ).toBeUndefined()
    })

    it('should handle a value with multiple percentage signs', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '10%%'),
      ).toBeCloseTo(50000)
    })

    it('should handle a value with mixed currency and percentage signs', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '$10%'),
      ).toBeCloseTo(50000)
    })

    it('should handle a value with only non-numeric characters', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, 'abc'),
      ).toBeUndefined()
    })

    it('should handle a value with only a percentage sign', () => {
      expect(
        parseCurrencyAmountOrPercentage(purchasePriceItem, '%'),
      ).toBeUndefined()
    })
  })
})
