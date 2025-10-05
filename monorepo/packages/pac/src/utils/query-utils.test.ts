import { describe, expect, it } from 'bun:test'
import { OptionalKind, Type } from '@sinclair/typebox'
import { transformNullableToOptional } from './query-utils'

describe('transformNullableToOptional', () => {
  it('should convert a union with null to optional', () => {
    const schema = Type.Union([Type.String(), Type.Null()])
    const result = transformNullableToOptional(schema)
    expect(result[OptionalKind]).toBe('Optional')
    expect(result.type).toBe('string')
  })

  it('should convert a union with null and another union', () => {
    const schema = Type.Union([
      Type.Union([Type.String(), Type.Number()]),
      Type.Null(),
    ])
    const result = transformNullableToOptional(schema)
    expect(result[OptionalKind]).toBe('Optional')
    // Should be a union of string and number, optional
    expect(
      result.anyOf || result.type === 'string' || result.type === 'number',
    ).toBeTruthy()
  })

  it('should handle nested nullable properties in objects', () => {
    const schema = Type.Object({
      foo: Type.Union([Type.String(), Type.Null()]),
      bar: Type.Number(),
    })
    const result = transformNullableToOptional(schema)
    expect(result.properties.foo[OptionalKind]).toBe('Optional')
    expect(result.properties.foo.type).toBe('string')
    expect(result.properties.bar.type).toBe('number')
  })

  it('should handle arrays of nullable types', () => {
    const schema = Type.Array(Type.Union([Type.String(), Type.Null()]))
    const result = transformNullableToOptional(schema)
    expect(result.items[OptionalKind]).toBe('Optional')
    expect(result.items.type).toBe('string')
  })

  it('should handle deeply nested objects and arrays', () => {
    const schema = Type.Object({
      arr: Type.Array(
        Type.Object({
          foo: Type.Union([Type.String(), Type.Null()]),
        }),
      ),
    })
    const result = transformNullableToOptional(schema)
    expect(result.properties.arr.items.properties.foo[OptionalKind]).toBe(
      'Optional',
    )
    expect(result.properties.arr.items.properties.foo.type).toBe('string')
  })

  it('should return schema as is if not nullable', () => {
    const schema = Type.String()
    const result = transformNullableToOptional(schema)
    expect(result).toBe(schema)
  })

  it('should handle union with multiple non-null types and null', () => {
    const schema = Type.Union([Type.String(), Type.Number(), Type.Null()])
    const result = transformNullableToOptional(schema)
    expect(result[OptionalKind]).toBe('Optional')
    // Should be a union of string and number, optional
    expect(
      result.anyOf || result.type === 'string' || result.type === 'number',
    ).toBeTruthy()
  })

  it('should handle object with all nullable properties', () => {
    const schema = Type.Object({
      a: Type.Union([Type.String(), Type.Null()]),
      b: Type.Union([Type.Number(), Type.Null()]),
    })
    const result = transformNullableToOptional(schema)
    expect(result.properties.a[OptionalKind]).toBe('Optional')
    expect(result.properties.b[OptionalKind]).toBe('Optional')
  })

  it('should handle array of objects with nullable fields', () => {
    const schema = Type.Array(
      Type.Object({
        foo: Type.Union([Type.String(), Type.Null()]),
      }),
    )
    const result = transformNullableToOptional(schema)
    expect(result.items.properties.foo[OptionalKind]).toBe('Optional')
  })

  it('should handle union of object and null', () => {
    const schema = Type.Union([
      Type.Object({ foo: Type.String() }),
      Type.Null(),
    ])
    const result = transformNullableToOptional(schema)
    expect(result[OptionalKind]).toBe('Optional')
    expect(result.anyOf || result.type === 'object').toBeTruthy()
  })
})
