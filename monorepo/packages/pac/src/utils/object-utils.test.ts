import { describe, expect, it } from 'bun:test'
import { RemoveNulls } from './object-utils'

describe('RemoveNulls', () => {
  it('removes null and undefined from flat objects', () => {
    const obj = { a: 1, b: null, c: undefined, d: 2 }
    const out = { a: 1, d: 2 }
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('removes null and undefined from nested objects', () => {
    const obj = {
      a: 1,
      b: null,
      c: { d: undefined, e: 2, f: null },
      g: { h: { i: null, j: 3 } },
    }
    const out = { a: 1, c: { e: 2 }, g: { h: { j: 3 } } }
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('removes null and undefined from arrays', () => {
    const obj = {
      arr: [null, 1, undefined, 2, { a: null, b: 3 }],
    }
    const out = { arr: [1, 2, { b: 3 }] }
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('removes null and undefined from arrays of objects', () => {
    const obj = {
      arr: [{ a: null, b: 1 }, { c: undefined, d: 2 }, null, undefined],
    }
    const out = { arr: [{ b: 1 }, { d: 2 }] }
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('removes null and undefined from deeply nested arrays and objects', () => {
    const obj = {
      a: [
        null,
        { b: [null, { c: null, d: 4 }, 5], e: undefined },
        6,
        undefined,
      ],
      f: null,
    }
    const out = { a: [{ b: [{ d: 4 }, 5] }, 6] }
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('returns empty object if all properties are null or undefined', () => {
    const obj = { a: null, b: undefined }
    const out = {}
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('returns empty array if all elements are null or undefined', () => {
    const obj = { arr: [null, undefined] }
    const out = { arr: [] }
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('keeps falsy but not null/undefined values', () => {
    const obj = { a: 0, b: false, c: '', d: null, e: undefined }
    const out = { a: 0, b: false, c: '' }
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('handles objects with empty nested objects', () => {
    const obj = { a: { b: null }, c: {} }
    const out = { a: {}, c: {} }
    expect(RemoveNulls(obj)).toEqual(out)
  })

  it('handles arrays with empty objects', () => {
    const obj = { arr: [{ a: null }, {}] }
    const out = { arr: [] }
    expect(RemoveNulls(obj)).toEqual(out)
  })
})
