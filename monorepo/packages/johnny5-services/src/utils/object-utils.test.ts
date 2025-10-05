import { describe, expect, it } from 'bun:test'
import { getObjectDifference } from './object-utils'

describe('getObjectDifference', () => {
  it('should return an empty object when both objects are empty', () => {
    const original = {}
    const updated = {}
    const result = getObjectDifference(original, updated)
    expect(result).toEqual({})
  })

  it('should return properties from original that are not in updated', () => {
    const original = { a: 1, b: 2 }
    const updated = { a: 1 }
    const result = getObjectDifference(original, updated)
    expect(result).toEqual({ b: undefined })
  })

  it('should return properties from updated that are not in original', () => {
    const original = { a: 1 }
    const updated = { a: 1, b: 2 }
    const result = getObjectDifference(original, updated)
    expect(result).toEqual({ b: 2 })
  })

  it('should return properties with different values', () => {
    const original = { a: 1, b: 2 }
    const updated = { a: 1, b: 3 }
    const result = getObjectDifference(original, updated)
    expect(result).toEqual({ b: 3 })
  })

  it('should return an empty object when both objects have the same properties and values', () => {
    const original = { a: 1, b: 2 }
    const updated = { a: 1, b: 2 }
    const result = getObjectDifference(original, updated)
    expect(result).toEqual({})
  })

  it('should handle nested objects', () => {
    const original = { a: 1, b: { c: 2 } }
    const updated = { a: 1, b: { c: 3 } }
    const result = getObjectDifference(original, updated)
    expect(result).toEqual({ b: { c: 3 } })
  })
})
