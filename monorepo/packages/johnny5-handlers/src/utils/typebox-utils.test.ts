import { describe, expect, it } from 'bun:test'
import { type Static, Type as t } from '@sinclair/typebox'
import { validate } from './typebox-utils'

export type TestSchema = Static<typeof TestSchema>
export const TestSchema = t.Object({
  first: t.String({ minLength: 2 }),
  second: t.Number({ minimum: 2 }),
})

describe('validate', () => {
  it('should return true with a valid schema', async () => {
    const sut: TestSchema = {
      first: 'test',
      second: 2,
    }

    const result = validate(TestSchema, sut)

    expect(result).toBe(true)
  })

  it('should return errors with an invalid schema', async () => {
    const sut: TestSchema = {
      first: 't',
      second: 1,
    }

    const result = validate(TestSchema, sut)

    expect(result).toEqual([
      {
        path: '/first',
        value: 't',
        message: 'Expected string length greater or equal to 2',
      },
      {
        path: '/second',
        value: 1,
        message: 'Expected number to be greater or equal to 2',
      },
    ])
  })
})
