import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import type { DataItem } from '@dbc-tech/johnny5/typebox'
import { type Logger } from '@dbc-tech/logger'
import { field } from './constants'
import { filterDataItem, parseDataItem } from './data-item-parser'

describe('data-item-parser', () => {
  const createMockDataSource = (data: Record<string, DataItem>): DataSource => {
    return {
      get: mock((name) => Promise.resolve(data[name])),
    }
  }

  const mockLogger: Logger = {
    debug: mock(),
    log: mock(),
    error: mock(),
    warn: mock(),
    info: mock(),
    trace: mock(),
  }

  describe('parseDataItem', () => {
    let datasource: DataSource

    beforeEach(() => {
      datasource = createMockDataSource({})
    })

    it('should return the item unchanged if item.value is falsy', async () => {
      const item: DataItem = {
        name: field.buyerAddresLine1,
        value: undefined,
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toBeUndefined()
      expect(result).toEqual(item)
    })

    it('should parse line2 with parseDataItem', async () => {
      const item: DataItem = {
        name: field.buyerAddresLine2,
        value: '10 BRYANT ST',
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('10 Bryant Street')
    })

    it('should parse date fields and return an offset date calculated from the contract date, excluding the contract date itself', async () => {
      const datasource = createMockDataSource({
        date_of_contract: {
          name: field.dateOfContract,
          type: 'Date',
          value: '2025-01-13',
          required: false,
        },
      })

      const item: DataItem = {
        name: field.dateFinance,
        value: '5 Days from Contract Date',
        type: 'Date',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('2025-01-20')
    })

    it('should parse purchase_price and return amount as a string', async () => {
      const item: DataItem = {
        name: field.purchasePrice,
        value: '$20,000.00',
        type: 'Number',
        required: true,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('20000')
    })

    it('should parse deposit_initial and return amount as a string', async () => {
      // Not used
      const datasource = createMockDataSource({
        purchase_price: {
          name: field.purchasePrice,
          type: 'Number',
          value: '100000',
          required: false,
        },
      })

      const item: DataItem = {
        name: field.depositInitial,
        value: '$20,000.00',
        type: 'Number',
        required: true,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('20000')
    })

    it('should parse deposit_initial and return amount as a percentage of purchase price', async () => {
      const datasource = createMockDataSource({
        purchase_price: {
          name: field.purchasePrice,
          type: 'Number',
          value: '100000',
          required: false,
        },
      })

      const item: DataItem = {
        name: field.depositInitial,
        value: '25% of Purchase Price',
        type: 'Number',
        required: true,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('25000')
    })

    it('should parse deposit_initial and return amount as a percentage of purchase price when raw text is populated', async () => {
      const datasource = createMockDataSource({
        purchase_price: {
          name: field.purchasePrice,
          type: 'Number',
          value: '100000',
          required: false,
        },
      })

      const item: DataItem = {
        name: field.depositInitial,
        value: '25',
        rawText: '25%',
        type: 'Number',
        required: true,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('25000')
    })

    it('should parse deposit_balance and return amount as a string', async () => {
      // Not used
      const datasource = createMockDataSource({
        purchase_price: {
          name: field.purchasePrice,
          type: 'Number',
          value: '100000',
          required: false,
        },
      })

      const item: DataItem = {
        name: field.depositBalance,
        value: '$20,000.00',
        type: 'Number',
        required: true,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('20000')
    })

    it('should parse deposit_balance and return amount as a percentage of purchase price', async () => {
      const datasource = createMockDataSource({
        purchase_price: {
          name: field.purchasePrice,
          type: 'Number',
          value: '100000',
          required: false,
        },
      })

      const item: DataItem = {
        name: field.depositBalance,
        value: '25% of Purchase Price',
        type: 'Number',
        required: true,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('25000')
    })

    it('should parse deposit_balance and return amount as a percentage of purchase price when raw text is populated', async () => {
      const datasource = createMockDataSource({
        purchase_price: {
          name: field.purchasePrice,
          type: 'Number',
          value: '100000',
          required: false,
        },
      })

      const item: DataItem = {
        name: field.depositBalance,
        value: '25',
        rawText: '25%',
        type: 'Number',
        required: true,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('25000')
    })

    it('should return item Road and Avenue for default cases', async () => {
      const item: DataItem = {
        name: field.seller2AddressLine1,
        value: '123 Main Rd Ave',
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toEqual('123 Main Road Avenue')
    })

    it('should call StreetNameAbbreviationExpander and capitalise for address fields', async () => {
      const item: DataItem = {
        name: field.buyerAddresLine1,
        value: '123 Main St',
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)

      expect(result.value).toBe('123 Main Street')
    })

    it('should call StreetNameAbbreviationExpander and capitalise for address fields', async () => {
      const item: DataItem = {
        name: field.buyerAddresLine1,
        value: '175 BROKEN Bvd, HEAD RD',
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toBe('175 Broken Boulevard, Head Road')
    })

    it('should call capitalise for suburb field', async () => {
      const item: DataItem = {
        name: field.sellerSuburb,
        value: 'gold coast mc',
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toBe('Gold Coast Mc')
    })

    it('should call capitalise for buyerName field', async () => {
      const item: DataItem = {
        name: field.buyerName,
        value: 'JAMES SMITH jr.',
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toBe('James Smith Jr.')
    })

    it('should call remove prefixes on buyerMobile field', async () => {
      const item: DataItem = {
        name: field.buyerMobile,
        value: '+61 478 516994',
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toBe('478516994')
    })

    it('empty items should return undefined', async () => {
      const item: DataItem = {
        name: field.buyerName,
        value: '',
        type: 'Text',
        required: false,
      }

      const result = await parseDataItem(item, datasource, mockLogger)
      expect(result.value).toBeUndefined()
    })
  })

  describe('filterDataItem', () => {
    it('should filter out `Nil.` and set value to undefined', async () => {
      const item: DataItem = {
        name: field.excludedFixtures,
        value: 'Nil.',
        type: 'Text',
        required: false,
      }

      const result = await filterDataItem(item, mockLogger)
      expect(result.value).toBeUndefined()
    })

    it('should filter out `| NIL` and set value to undefined', async () => {
      const item: DataItem = {
        name: field.includedChattels,
        value: '| NIL',
        type: 'Text',
        required: false,
      }

      const result = await filterDataItem(item, mockLogger)
      expect(result.value).toBeUndefined()
    })

    it('should filter out any context related `|   NIL` and set value to undefined', async () => {
      const item: DataItem = {
        name: field.buyerAddresLine2,
        value: '|   NIL',
        type: 'Text',
        required: false,
      }

      const result = await filterDataItem(item, mockLogger)
      expect(result.value).toBeUndefined()
    })

    it('should filter out `| nil` and set value to undefined', async () => {
      const item: DataItem = {
        name: field.leaseTenantsName,
        value: '|  nil',
        type: 'Text',
        required: false,
      }

      const result = await filterDataItem(item, mockLogger)
      expect(result.value).toBeUndefined()
    })

    it('should filter out `Nil` and set value to undefined', async () => {
      const item: DataItem = {
        name: field.propertyMattersEncumbrances,
        value: 'Nil',
        type: 'Text',
        required: false,
      }

      const result = await filterDataItem(item, mockLogger)
      expect(result.value).toBeUndefined()
    })

    it('should set value to `Valid Text`', async () => {
      const item: DataItem = {
        name: field.includedChattels,
        value: 'Valid Text',
        type: 'Text',
        required: false,
      }

      const result = await filterDataItem(item, mockLogger)
      expect(result.value).toBe('Valid Text')
    })

    it('should set value to `John Doe`', async () => {
      const item: DataItem = {
        name: field.leaseTenantsName,
        value: 'John Doe',
        type: 'Text',
        required: false,
      }

      const result = await filterDataItem(item, mockLogger)
      expect(result.value).toBe('John Doe')
    })

    it('should set value to undefined', async () => {
      const item: DataItem = {
        name: field.includedChattels,
        value: undefined,
        type: 'Text',
        required: false,
      }

      const result = await filterDataItem(item, mockLogger)
      expect(result.value).toBeUndefined()
    })
  })
})
