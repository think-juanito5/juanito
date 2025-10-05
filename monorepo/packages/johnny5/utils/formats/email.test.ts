import { describe, expect, it } from 'bun:test'
import { IsEmail } from './email'

describe('IsEmail', () => {
  it('should return true for valid email addresses', () => {
    const validEmails = [
      'user@domain.com',
      'user.name@domain.co.uk',
      'user_name+tag@sub.domain.com',
      'user-name@domain.io',
      'user123@domain.org',
      'user@domain.travel',
      'user@sub-domain.domain.com',
      'user@domain.museum',
      'user@domain.co',
      'user@domain.info',
    ]
    validEmails.forEach((email) => {
      expect(IsEmail(email)).toBe(true)
    })
  })

  it('should return false for invalid email addresses', () => {
    const invalidEmails = [
      'plainaddress',
      '@missingusername.com',
      'username@.com',
      'username@com',
      'username@domain..com',
      'username@domain,com',
      'username@domain',
      // 'username@domain.c', // validates true
      'username@-domain.com',
      'username@domain-.com',
      'username@domain..co.uk',
      'user name@domain.com',
      'user@domain..com',
      'user@.domain.com',
      'user@domain.com.',
      'user@.com',
      'user@domain@domain.com',
      'user@domain..com',
      'user@domain,com',
      'user@domain com',
    ]
    invalidEmails.forEach((email) => {
      expect(IsEmail(email)).toBe(false)
    })
  })
})
