import type { TSchema } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

export type ValidationResult = {
  path: string
  value: unknown
  message: string
}

export const validate = <T extends TSchema>(
  schema: T,
  value: unknown,
): true | ValidationResult[] => {
  const result = Value.Check(schema, value)
  if (result) return true

  const errors = [...Value.Errors(schema, value)]
  return errors.map((e) => {
    return {
      path: e.path,
      value: e.value,
      message: e.message,
    }
  })
}

export const ValidateOrThrow = <T extends TSchema>(
  schema: T,
  value: unknown,
) => {
  const result = validate(schema, value)
  if (result !== true) {
    throw new Error(`Validation error(s): ${JSON.stringify(result, null, 2)}`)
  }
}
