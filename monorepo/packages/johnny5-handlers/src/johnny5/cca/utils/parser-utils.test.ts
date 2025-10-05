import { describe, expect, it } from 'bun:test'
import {
  type AustralianState,
  type MatterCreateDetailAddress,
} from '@dbc-tech/johnny5/typebox'
import { parseAddress } from './parser-utils'

describe('parseAddress', () => {
  it('should parse address with state and postcode case#1', () => {
    const input = 'Units 1-14, 29 Wiltshire Lane DELACOMBE VIC 3356'
    const expected: MatterCreateDetailAddress = {
      line1: 'Units 1-14 29 Wiltshire Lane',
      suburb: 'DELACOMBE',
      state: 'VIC',
      postcode: '3356',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with state and postcode case#2', () => {
    const input = '123 Main St Brisbane QLD 4000'
    const expected: MatterCreateDetailAddress = {
      line1: '123 Main St',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with state only case#3', () => {
    const input = '123 Main St, Brisbane, QLD'
    const expected: MatterCreateDetailAddress = {
      line1: '123 Main St',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with postcode only case#4', () => {
    const input = '123 Main St, Brisbane, 4000'
    const expected: MatterCreateDetailAddress = {
      line1: '123 Main St',
      suburb: 'Brisbane',
      state: undefined,
      postcode: '4000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address without state and postcode case#5', () => {
    const input = '123 Main St, Brisbane 2222'
    const expected: MatterCreateDetailAddress = {
      line1: '123 Main St',
      suburb: 'Brisbane',
      state: undefined,
      postcode: '2222',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with unit number case#6', () => {
    const input = 'Unit 5 123 Main St, Brisbane, QLD, 4000'
    const expected: MatterCreateDetailAddress = {
      line1: 'Unit 5 123 Main St',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with single word street name case#7', () => {
    const input = '123 Main, Brisbane, QLD, 4000'
    const expected: MatterCreateDetailAddress = {
      line1: '123 Main',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with single word street name new case#8', () => {
    const input = '123 Main Ascot-Vale QLD 4000'
    const expected: MatterCreateDetailAddress = {
      line1: '123 Main',
      suburb: 'Ascot-Vale',
      state: 'QLD',
      postcode: '4000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with single word street name new case#9', () => {
    const input = '123 Main St, Apartment 4B, Sydney NSW 2000'
    const expected: MatterCreateDetailAddress = {
      line1: '123 Main St Apartment 4B',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with single word street name new case#10', () => {
    const input = '123 Main St Apartment 4B Sydney NSW 2000'
    const expected: MatterCreateDetailAddress = {
      line1: '123 Main St Apartment 4B',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with single word street name new case#11', () => {
    const input = 'Unit 5, 25 George St, Brisbane QLD 4000'
    const expected: MatterCreateDetailAddress = {
      line1: 'Unit 5 25 George St',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with single word street name new case#12', () => {
    const input = '25 George St Brisbane QLD 4000'
    const expected: MatterCreateDetailAddress = {
      line1: '25 George St',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })

  it('should parse address with just State new case#13', () => {
    const input = 'QLD' as AustralianState
    const expected: MatterCreateDetailAddress = {
      line1: ' ',
      suburb: '',
      state: 'QLD',
      postcode: '',
      type: 'physical',
    }
    expect(parseAddress(input)).toEqual(expected)
  })
})
