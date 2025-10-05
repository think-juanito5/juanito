import { Kind, OptionalKind, Type } from '@sinclair/typebox'
import type { TSchema } from 'elysia'

export const filter = (query: Record<string, string | undefined>) => {
  if (!query) return
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  ) as Record<string, string>
}

export const convertBodyToQuery = (body: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined),
  ) as Record<string, string>
}

// Recursively transform schema: Nullable(x) => Type.Optional(x)
// This is used by the Power Apps Connector (PAC).
// Nulls are interpreted as strings in PA. PA uses Swagger 2.0 which
// does not support anyOf. So anything nullable other than a string
// will cause a schema error in PA.
export function transformNullableToOptional(schema: TSchema): TSchema {
  if (schema.type !== 'null') {
    if (
      schema[Kind] === 'Union' &&
      'anyOf' in schema &&
      Array.isArray(schema.anyOf)
    ) {
      // If the schema is a union type, meaning it has anyOf, we need to
      // a: make the union optional
      // b: remove the null type from the union
      // c: if there is only one type left in the union, just return that type as optional instead of the union
      const nullCount = (
        schema as unknown as { anyOf: TSchema[] }
      ).anyOf.filter(
        (s) => typeof s === 'object' && 'type' in s && s.type === 'null',
      ).length
      const nonNull = (schema as unknown as { anyOf: TSchema[] }).anyOf.filter(
        (s) =>
          typeof s === 'object' &&
          (('type' in s && s.type !== 'null') || s[Kind] === 'Union'),
      ) as TSchema[]
      if (nonNull.length === 1) {
        if (nullCount > 0 && nonNull[0][OptionalKind] !== 'Optional')
          return Type.Optional(nonNull[0])
        return nonNull[0] as TSchema
      }
      if (schema[OptionalKind] == 'Optional' || nullCount > 0)
        return Type.Optional(Type.Union(nonNull as TSchema[]))
      return Type.Union(nonNull as TSchema[])
    }
    if ('anyOf' in schema && Array.isArray(schema.anyOf)) {
      // Remove the null type from the union
      const nonNull = (schema as unknown as { anyOf: TSchema[] }).anyOf.find(
        (s) => typeof s === 'object' && 'type' in s && s.type !== 'null',
      ) as TSchema
      return Type.Optional(nonNull)
    }
    // Handle objects
    if (
      schema.type === 'object' &&
      'properties' in schema &&
      schema.properties
    ) {
      const newProps: Record<string, TSchema> = {}
      for (const [key, value] of Object.entries(schema.properties)) {
        const typedValue = value as TSchema
        if (typedValue.type !== 'null') {
          newProps[key] = transformNullableToOptional(typedValue)
        }
      }
      if (schema[OptionalKind] === 'Optional')
        return Type.Optional(Type.Object(newProps))
      return Type.Object(newProps)
    }
    // Handle arrays
    if (schema.type === 'array' && 'items' in schema && schema.items) {
      const newArr = Type.Array(
        transformNullableToOptional(schema.items as TSchema),
      )
      if (schema[OptionalKind] === 'Optional') return Type.Optional(newArr)
      return newArr
    }
    // Otherwise, return as is
    return schema
  }
  return Type.Optional(Type.Object({}))
}
