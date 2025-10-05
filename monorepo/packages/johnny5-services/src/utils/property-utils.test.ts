import { describe, expect, it } from 'bun:test'
import type { BtrSdsClientWebhook } from '@dbc-tech/johnny5/typebox'
import { extractPostcode, hasIgnoreInNames } from './property-utils'

describe('extractPostcode', () => {
  it('extracts postcode when state comes after postcode', () => {
    const result = extractPostcode('61 Main St, 2000 NSW, Sydney')
    expect(result).toBe('2000')
  })

  it('extracts postcode when postcode comes after state', () => {
    const result = extractPostcode('Sydney, NSW 2000')
    expect(result).toBe('2000')
  })

  it('extracts postcode when postcode is at end', () => {
    const result = extractPostcode('10 Beach Rd, Perth WA 6005')
    expect(result).toBe('6005')
  })

  it('returns last postcode if no state found', () => {
    const result = extractPostcode('Unit 1234, 10 Rd, Sydney 2000')
    expect(result).toBe('2000')
  })

  it('returns undefined if no postcode', () => {
    const result = extractPostcode('10 Example St, Sydney, NSW')
    expect(result).toBeUndefined()
  })

  it('returns postcode even if address is messy', () => {
    const result = extractPostcode('Perth 6005, WA, 10 Beach Rd')
    expect(result).toBe('6005')
  })

  it('returns postcode even if state is lowercase', () => {
    expect(extractPostcode('123 Example Rd, sydney, nsw 2000')).toBe('2000')
  })

  it('returns postcode closest to state when multiple 4-digit numbers', () => {
    expect(extractPostcode('Unit 1234, 5678 Another Rd, NSW 4000')).toBe('4000')
  })

  it('returns last postcode when no state and multiple 4-digit numbers', () => {
    expect(extractPostcode('1234 Some St, 9999, Sydney')).toBe('9999')
  })

  it('returns postcode when address contains extra whitespace', () => {
    expect(extractPostcode('  10   Main St   NSW    3000  ')).toBe('3000')
  })

  it('ignores non-4-digit numbers', () => {
    expect(extractPostcode('123 Main St, Suite 101, VIC 3051')).toBe('3051')
  })

  it('handles address with no commas', () => {
    expect(extractPostcode('10 Sample Rd NSW 2010 Australia')).toBe('2010')
  })

  it('handles long full address with noise', () => {
    expect(
      extractPostcode(
        'Client Residence - 99 River Street, Richmond, VIC 3121, AU - urgent',
      ),
    ).toBe('3121')
  })

  it('returns undefined for empty string', () => {
    expect(extractPostcode('')).toBeUndefined()
  })

  it('returns undefined for null input', () => {
    expect(extractPostcode(null as unknown as string)).toBeUndefined()
  })

  it('returns postcode even if state has trailing punctuation', () => {
    expect(extractPostcode('Brisbane, QLD. 4006')).toBe('4006')
  })
})

describe('hasIgnoreInNames', () => {
  it('returns true if seller full_name contains "ignore"', () => {
    const payload = {
      sellers: [{ full_name: 'John Ignore Doe' }],
      agent: { full_name: 'Jane Doe' },
      agency_name: 'Best Agency',
    }
    expect(hasIgnoreInNames(payload as BtrSdsClientWebhook)).toBe(true)
  })

  it('returns true if agent full_name contains "ignore"', () => {
    const payload = {
      sellers: [{ full_name: 'John Doe' }],
      agent: { full_name: 'Ignore Agent' },
      agency_name: 'Best Agency',
    }
    expect(hasIgnoreInNames(payload as BtrSdsClientWebhook)).toBe(true)
  })

  it('returns true if agency_name contains "ignore"', () => {
    const payload = {
      sellers: [{ full_name: 'John Doe' }],
      agent: { full_name: 'Jane Doe' },
      agency_name: 'Ignore Agency',
    }
    expect(hasIgnoreInNames(payload as BtrSdsClientWebhook)).toBe(true)
  })

  it('returns false if none contain "ignore"', () => {
    const payload = {
      sellers: [{ full_name: 'John Doe' }],
      agent: { full_name: 'Jane Doe' },
      agency_name: 'Best Agency',
    }
    expect(hasIgnoreInNames(payload as BtrSdsClientWebhook)).toBe(false)
  })

  it('handles missing sellers, agent, and agency_name gracefully', () => {
    const payload = {}
    expect(hasIgnoreInNames(payload as BtrSdsClientWebhook)).toBe(false)
  })

  it('is case insensitive', () => {
    const payload = {
      sellers: [{ full_name: 'IGNORE THIS' }],
      agent: { full_name: 'Jane Doe' },
      agency_name: 'Best Agency',
    }
    expect(hasIgnoreInNames(payload as BtrSdsClientWebhook)).toBe(true)
  })
})
