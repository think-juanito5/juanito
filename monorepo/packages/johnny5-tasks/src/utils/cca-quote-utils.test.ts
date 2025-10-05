import { describe, expect, it } from 'bun:test'
import { getFormType } from './cca-quote-utils'
describe('getFormType', () => {
  it('returns "Contract Drafting - NSWVIC" for NSW and sell intent', () => {
    expect(getFormType('NSW', 'sell', undefined)).toBe(
      'Contract Drafting - NSWVIC',
    )
  })

  it('returns "Contract Drafting - NSWVIC" for VIC and sell intent', () => {
    expect(getFormType('VIC', 'sell', undefined)).toBe(
      'Contract Drafting - NSWVIC',
    )
  })

  it('returns "Contract Drafting" for QLD and sell intent', () => {
    expect(getFormType('QLD', 'sell', undefined)).toBe('Contract Drafting')
  })

  it('returns "Contract Upload" if filename is provided', () => {
    expect(getFormType('QLD', 'sell', 'contract.pdf')).toBe('Contract Drafting')
    expect(getFormType('NSW', 'buy', 'file.doc')).toBe('Contract Upload')
  })

  it('returns "No Contract Upload" if filename is not provided and intent is not sell', () => {
    expect(getFormType('VIC', 'buy', undefined)).toBe('No Contract Upload')
    expect(getFormType('QLD', 'buy', undefined)).toBe('No Contract Upload')
  })

  it('returns "No Contract Upload" if filename is not provided and state is not in draftingStates', () => {
    expect(getFormType('WA', 'sell', undefined)).toBe('No Contract Upload')
  })

  it('returns "No Contract Upload" if filename is not provided and intent is not sell', () => {
    expect(getFormType('NSW', 'buy', undefined)).toBe('No Contract Upload')
  })
})
