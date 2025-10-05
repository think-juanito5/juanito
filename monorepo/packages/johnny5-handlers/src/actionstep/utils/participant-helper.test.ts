import { describe, expect, it } from 'bun:test'
import {
  getParticipantPhoneNumbers,
  getPaticipantAddresses,
} from './participant-utils'

describe('getParticipantPhoneNumbers', () => {
  it('should return formatted phone numbers with empty slots', () => {
    const phoneNumbers = [
      { number: '1234567890', label: 'Home' },
      { number: '0987654321', label: 'Work' },
    ]
    const result = getParticipantPhoneNumbers(phoneNumbers)
    expect(result).toEqual([
      '1234567890',
      'Home',
      '',
      '',
      '0987654321',
      'Work',
      '',
      '',
    ])
  })

  it('should return formatted phone numbers for phone/mobile', () => {
    const phoneNumbers = [
      { number: '1234567890', label: 'phone' },
      { number: '0987654321', label: 'mobile' },
    ]
    const result = getParticipantPhoneNumbers(phoneNumbers)
    expect(result).toEqual([
      '1234567890',
      'phone',
      '0987654321',
      'Mobile',
      '',
      '',
      '',
      '',
    ])
  })

  it('should return formatted phone numbers for phone as phone2 is exclusive for mobile', () => {
    const phoneNumbers = [
      { number: '1234567891', label: 'phone' },
      { number: '1234567892', label: 'phone' },
      { number: '1234567893', label: 'phone' },
    ]
    const result = getParticipantPhoneNumbers(phoneNumbers)
    expect(result).toEqual([
      '1234567891',
      'phone',
      '',
      '',
      '1234567892',
      'phone',
      '1234567893',
      'phone',
    ])
  })

  it('should return formatted phone numbers for phone as phone2 is exclusive for mobile', () => {
    const phoneNumbers = [
      { number: '1234567891', label: 'phone' },
      { number: '1234567892', label: 'phone' },
      { number: '1234567893', label: 'mobile' },
    ]
    const result = getParticipantPhoneNumbers(phoneNumbers)
    expect(result).toEqual([
      '1234567891',
      'phone',
      '1234567893',
      'Mobile',
      '1234567892',
      'phone',
      '',
      '',
    ])
  })

  it('should return formatted phone2 which is exclusive for mobile', () => {
    const phoneNumbers = [{ number: '1234567891', label: 'mobile' }]
    const result = getParticipantPhoneNumbers(phoneNumbers)
    expect(result).toEqual(['', '', '1234567891', 'Mobile', '', '', '', ''])
  })

  it('should return formatted phone1 if non-mobile', () => {
    const phoneNumbers = [{ number: '1234567891', label: 'phone' }]
    const result = getParticipantPhoneNumbers(phoneNumbers)
    expect(result).toEqual(['1234567891', 'phone', '', '', '', '', '', ''])
  })

  it('should handle empty phone numbers array', () => {
    const result = getParticipantPhoneNumbers([])
    expect(result).toEqual(['', '', '', '', '', '', '', ''])
  })

  it('should handle missing labels', () => {
    const phoneNumbers = [{ number: '1234567890' }]
    const result = getParticipantPhoneNumbers(phoneNumbers)
    expect(result).toEqual(['1234567890', '', '', '', '', '', '', ''])
  })
})

describe('Participant.getPaticipantAddresses', () => {
  it(
    'should be successful retrieving Participant Address @case1',
    () => {
      const addresses = [
        {
          type: 'physical',
          line1: '1234 Main St',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        },
        {
          type: 'mailing',
          line1: 'PO Box 1234',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        },
      ]

      const { physicalAddr, mailingAddr } = getPaticipantAddresses(addresses)

      expect(physicalAddr).toBeDefined()
      expect(physicalAddr.line1).toBe('1234 Main St')
      expect(physicalAddr.suburb).toBe('Sydney')
      expect(physicalAddr.state).toBe('NSW')
      expect(physicalAddr.postcode).toBe('2000')

      expect(mailingAddr).toBeDefined()
      expect(mailingAddr.line1).toBe('PO Box 1234')
      expect(mailingAddr.suburb).toBe('Sydney')
      expect(mailingAddr.state).toBe('NSW')
      expect(mailingAddr.postcode).toBe('2000')
    },
    { timeout: 30000 },
  )

  it(
    'should be successful retrieving Participant Address @case2',
    () => {
      const addresses = [
        {
          type: 'physical',
          line1: '1234 Main St',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        },
      ]

      const { physicalAddr, mailingAddr } = getPaticipantAddresses(addresses)

      expect(physicalAddr).toBeDefined()
      expect(physicalAddr.line1).toBe('1234 Main St')
      expect(physicalAddr.suburb).toBe('Sydney')
      expect(physicalAddr.state).toBe('NSW')
      expect(physicalAddr.postcode).toBe('2000')

      expect(mailingAddr).toBeDefined()
      expect(mailingAddr.line1).toBe('1234 Main St')
      expect(mailingAddr.suburb).toBe('Sydney')
      expect(mailingAddr.state).toBe('NSW')
      expect(mailingAddr.postcode).toBe('2000')
    },
    { timeout: 30000 },
  )

  it(
    'should be successful retrieving Participant Address @case3',
    () => {
      const addresses = [
        {
          type: 'physical',
          line1: null,
          state: 'NSW',
          postcode: '2000',
        },
      ]

      const { physicalAddr, mailingAddr } = getPaticipantAddresses(addresses)

      expect(physicalAddr).toBeDefined()
      expect(physicalAddr.line1).toBe(null)
      expect(physicalAddr.state).toBe('NSW')
      expect(physicalAddr.postcode).toBe('2000')
      expect(mailingAddr).toBeDefined()
      expect(mailingAddr.line1).toBe(null)
      expect(mailingAddr.state).toBe('NSW')
      expect(mailingAddr.postcode).toBe('2000')
    },
    { timeout: 30000 },
  )
})
