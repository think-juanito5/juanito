import type { Meta, MetaType } from '@dbc-tech/johnny5/typebox'
import { type StaticDecode, type TSchema } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

/**
 * Retrieves a value from an array of metadata objects based on a specified key, parses it against a provided schema, and optionally throws an error if the value is not found or is invalid.
 *
 * @template T The TypeBox schema type.
 * @template Output The output type after decoding the schema. Defaults to `StaticDecode<T>`.
 * @template Result The result type, which is a subtype of the output type. Defaults to `Output`.
 * @param {Meta[]} meta An array of metadata objects to search within.
 * @param {MetaType} key The key to search for in the metadata.
 * @param {T} schema The TypeBox schema to parse the metadata value against.
 * @param {boolean} [shouldThrow=true] A flag indicating whether to throw an error if the meta value is not found or is invalid. If `false`, `undefined` is returned instead.
 * @returns {Result | undefined} The parsed value if found and valid, otherwise `undefined` if `shouldThrow` is `false`.
 * @throws {Error} If `shouldThrow` is `true` and the meta value is not found or is invalid.
 */
export function getValue<
  T extends TSchema,
  Output = StaticDecode<T>,
  Result extends Output = Output,
>(
  meta: Meta[] | undefined,
  key: MetaType,
  schema: T,
  shouldThrow?: true,
): Result
export function getValue<
  T extends TSchema,
  Output = StaticDecode<T>,
  Result extends Output = Output,
>(
  meta: Meta[] | undefined,
  key: MetaType,
  schema: T,
  shouldThrow: false,
): Result | undefined
export function getValue<
  T extends TSchema,
  Output = StaticDecode<T>,
  Result extends Output = Output,
>(
  meta: Meta[] | undefined,
  key: MetaType,
  schema: T,
  shouldThrow: boolean = true,
): Result | undefined {
  const metaValue = meta?.find((m) => m.key === key)
  if (!metaValue) {
    if (shouldThrow) {
      throw new Error(`Meta value not found for key: ${key}`)
    }
    return undefined
  }

  try {
    return Value.Parse(schema, JSON.parse(metaValue.value))
  } catch (error) {
    if (shouldThrow) {
      throw new Error(
        `Meta value is not valid for key: ${key}\n${error instanceof Error ? error.message : String(error)}`,
      )
    }
    return undefined
  }
}

export function getNumber(
  meta: Meta[],
  key: MetaType,
  shouldThrow?: true,
): number
export function getNumber(
  meta: Meta[],
  key: MetaType,
  shouldThrow: false,
): number | undefined
export function getNumber(
  meta: Meta[],
  key: MetaType,
  shouldThrow: boolean = true,
): number | undefined {
  const metaValue = meta.find((m) => m.key === key)
  if (!metaValue) {
    if (shouldThrow) {
      throw new Error(`Meta value not found for key: ${key}`)
    }
    return undefined
  }
  try {
    const value = parseInt(metaValue.value, 10)
    if (isNaN(value)) {
      if (shouldThrow) {
        throw new Error(`Meta value is nan for key ${key}`)
      }
      return undefined
    }
    return value
  } catch (error) {
    if (shouldThrow) {
      throw new Error(`Meta value is not a number for key: ${key}\n${error}`)
    }
    return undefined
  }
}

export function getBoolean(
  meta: Meta[],
  key: MetaType,
  shouldThrow?: true,
): boolean
export function getBoolean(
  meta: Meta[],
  key: MetaType,
  shouldThrow: false,
): boolean | undefined
export function getBoolean(
  meta: Meta[],
  key: MetaType,
  shouldThrow: boolean = true,
): boolean | undefined {
  const metaValue = meta.find((m) => m.key === key)
  if (!metaValue) {
    if (shouldThrow) {
      throw new Error(`Meta value not found for key: ${key}`)
    }
    return undefined
  }

  const value = metaValue.value.toLowerCase() === 'true'
  return value
}

export function getString(
  meta: Meta[],
  key: MetaType,
  shouldThrow?: true,
): string
export function getString(
  meta: Meta[],
  key: MetaType,
  shouldThrow: false,
): string | undefined
export function getString(
  meta: Meta[],
  key: MetaType,
  shouldThrow: boolean = true,
): string | undefined {
  const metaValue = meta.find((m) => m.key === key)
  if (!metaValue) {
    if (shouldThrow) {
      throw new Error(`Meta value not found for key: ${key}`)
    }
    return undefined
  }

  return metaValue.value
}

export function getStringArray(
  meta: Meta[],
  key: MetaType,
  shouldThrow?: true,
): string[]
export function getStringArray(
  meta: Meta[],
  key: MetaType,
  shouldThrow: false,
): string[] | undefined
export function getStringArray(
  meta: Meta[],
  key: MetaType,
  shouldThrow: boolean = true,
): string[] | undefined {
  const metaValue = meta.find((m) => m.key === key)
  if (!metaValue) {
    if (shouldThrow) {
      throw new Error(`Meta value not found for key: ${key}`)
    }
    return undefined
  }

  const value = metaValue.value.split(',')
  if (value.length === 0) {
    if (shouldThrow) {
      throw new Error(`Meta value is an empty array for key ${key}`)
    }
    return undefined
  }
  return value
}

export function getNumberArray(
  meta: Meta[],
  key: MetaType,
  shouldThrow?: true,
): number[]
export function getNumberArray(
  meta: Meta[],
  key: MetaType,
  shouldThrow: false,
): number[] | undefined
export function getNumberArray(
  meta: Meta[],
  key: MetaType,
  shouldThrow: boolean = true,
): number[] | undefined {
  const metaValue = meta.find((m) => m.key === key)
  if (!metaValue) {
    if (shouldThrow) {
      throw new Error(`Meta value not found for key: ${key}`)
    }
    return undefined
  }
  try {
    const value = metaValue.value.split(',').map((v) => parseInt(v, 10))
    if (value.length === 0) {
      if (shouldThrow) {
        throw new Error(`Meta value is an empty array for key ${key}`)
      }
      return undefined
    }
    return value
  } catch (error) {
    if (shouldThrow) {
      throw new Error(`Meta value is not a number for key: ${key}\n${error}`)
    }
    return undefined
  }
}
