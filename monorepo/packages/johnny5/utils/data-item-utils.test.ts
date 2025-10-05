import { describe, expect, it, mock } from 'bun:test'
import type { Logger } from '@dbc-tech/logger'
import type { DataItem } from '../typebox'
import { calculateDateOrOffsetDate } from './data-item-utils'
import { yearEndShutdown } from './date-calculator'

describe('dataItemUtils', () => {
  const mockLogger: Logger = {
    debug: mock(),
    log: mock(),
    error: mock(),
    warn: mock(),
    info: mock(),
    trace: mock(),
  }

  const getUndefinedDataItem = (): DataItem => {
    return {
      value: undefined,
      name: 'Undefined',
      type: 'Text',
      required: false,
    }
  }

  describe('calculateDateOrOffsetDate', () => {
    it('should return undefined if input value is undefined', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem = getUndefinedDataItem()
      const contractDateItem = getUndefinedDataItem()

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: undefined })
    })

    it('should return formatted date if input contains a parseable date value', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '24/01/2025',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem = getUndefinedDataItem()

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-24' })
    })

    it('should return formatted date offset to next working day if input contains a parseable date value which falls on a non working day', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '25/01/2025',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem = getUndefinedDataItem()

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-28' })
    })

    it('should return formatted date offset to next working day if input contains a parseable date value which falls on a custom holiday', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '27/12/2024',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem = getUndefinedDataItem()

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-02' })
    })

    it('should return offsetted by 5 calendar days', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '5 days',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem: DataItem = {
        value: '2025-01-13',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-17' })
    })

    it('should return offsetted by 5 calendar days, not including reference date', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '5 days',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem: DataItem = {
        value: '2025-01-13',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
        yearEndShutdown,
        false,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-20' })
    })

    it('should return offsetted by 5 calendar days, forwarded to next working day', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '5 days',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem: DataItem = {
        value: '2025-01-14',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-20' })
    })

    it('should return offsetted by 5 business days', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '5 business days',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem: DataItem = {
        value: '2025-01-13',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-17' })
    })

    it('should return offsetted by 5 business days, skipping non-working days', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '5 business days',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem: DataItem = {
        value: '2025-01-14',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-20' })
    })

    it('should return offsetted by 5 business days, skipping non-working days, forwarding contract date to next working day', async () => {
      // Arrange
      const state = 'QLD'
      const inputItem: DataItem = {
        value: '5 business days',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }
      const contractDateItem: DataItem = {
        value: '2025-01-18',
        name: 'Start Date',
        type: 'Text',
        required: true,
      }

      // Act
      const result = await calculateDateOrOffsetDate(
        inputItem,
        mockLogger,
        state,
        contractDateItem,
      )

      // Assert
      expect(result).toEqual({ ...inputItem, value: '2025-01-24' })
    })
  })
})
