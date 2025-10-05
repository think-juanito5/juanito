import { describe, expect, it } from 'bun:test'
import type { Meta } from '@dbc-tech/johnny5/typebox'
import { Type } from '@sinclair/typebox'
import { getValue } from './meta-utils'

describe('getValue', () => {
  const meta: Meta[] = [
    { key: 'additionalInfo', value: '"stringValue"' },
    { key: 'fileTemplate', value: '123' },
    { key: 'testMode', value: 'true' },
    { key: 'participantIds', value: '{"a": 1, "b": "test"}' },
    { key: 'professionalFees', value: '[1, 2, 3]' },
  ]

  it('should return the parsed value when the key exists and the value is valid', () => {
    const schema = Type.String()
    const result = getValue(meta, 'additionalInfo', schema)
    expect(result).toBe('stringValue')
  })

  it('should return undefined when the key does not exist and shouldThrow is false', () => {
    const schema = Type.String()
    const result = getValue(meta, 'actionType', schema, false)
    expect(result).toBeUndefined()
  })

  it('should throw an error when the key does not exist and shouldThrow is true', () => {
    const schema = Type.String()
    expect(() => getValue(meta, 'actionType', schema)).toThrowError(
      'Meta value not found for key: actionType',
    )
  })

  it('should throw an error when the value is invalid and shouldThrow is true', () => {
    const schema = Type.Object({ a: Type.Number() })
    expect(() => getValue(meta, 'additionalInfo', schema)).toThrowError(
      'Meta value is not valid for key: additionalInfo\nExpected object',
    )
  })

  it('should return undefined when the value is invalid and shouldThrow is false', () => {
    const schema = Type.Object({ a: Type.Number() })
    const result = getValue(meta, 'additionalInfo', schema, false)
    expect(result).toBeUndefined()
  })

  it('should parse a number value', () => {
    const schema = Type.Number()
    const result = getValue(meta, 'fileTemplate', schema)
    expect(result).toBe(123)
  })

  it('should parse a boolean value', () => {
    const schema = Type.Boolean()
    const result = getValue(meta, 'testMode', schema)
    expect(result).toBe(true)
  })

  it('should parse an object value', () => {
    const schema = Type.Object({ a: Type.Number(), b: Type.String() })
    const result = getValue(meta, 'participantIds', schema)
    expect(result).toEqual({ a: 1, b: 'test' })
  })

  it('should parse an array value', () => {
    const schema = Type.Array(Type.Number())
    const result = getValue(meta, 'professionalFees', schema)
    expect(result).toEqual([1, 2, 3])
  })

  it('should handle empty meta array', () => {
    const schema = Type.String()
    expect(() => getValue([], 'additionalInfo', schema)).toThrowError(
      'Meta value not found for key: additionalInfo',
    )
    expect(getValue([], 'additionalInfo', schema, false)).toBeUndefined()
  })
})
