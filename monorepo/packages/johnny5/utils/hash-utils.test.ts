import { describe, expect, it } from 'bun:test'
import { hashString } from './hash-utils'

describe('hash-utils', () => {
  describe('hashString', () => {
    it('should generate consistent hash for the same input', () => {
      const data = 'test'
      const hash1 = hashString(data)
      const hash2 = hashString(data)
      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different inputs', () => {
      const data1 = 'test1'
      const data2 = 'test 1'
      const hash1 = hashString(data1)
      const hash2 = hashString(data2)
      expect(hash1).not.toBe(hash2)
    })
  })
})
