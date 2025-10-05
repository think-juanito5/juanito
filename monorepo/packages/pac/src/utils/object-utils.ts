/**
 * ExcludeKey function
 *
 * This function takes an object and a key, and returns a new object with the specified key excluded.
 *
 * @template T - The type of the object.
 * @template U - The type of the key to be excluded, which must be a key of T.
 *
 * @param {T} obj - The object from which the key should be excluded.
 * @param {U} key - The key to be excluded from the object.
 *
 * @returns {Omit<T, U>} - A new object with the specified key excluded.
 *
 * @example
 * const original = { a: 1, b: 2, c: 3 };
 * const result = ExcludeKey(original, 'b');
 * console.log(result); // Output: { a: 1, c: 3 }
 */
export function ExcludeKey<T extends object, U extends keyof T>(
  obj: T,
  key: U,
): Omit<T, U> {
  const { [key]: _, ...rest } = obj
  return rest
}

// Returns true if obj is a plain object and has no own properties
function isEmptyObject(obj: unknown): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    Object.keys(obj).length === 0
  )
}

export function RemoveNullsFromArray(arr: unknown[]): unknown[] {
  return arr.reduce((acc: unknown[], item) => {
    if (item !== null && item !== undefined) {
      if (Array.isArray(item)) {
        acc.push(RemoveNullsFromArray(item))
      } else if (typeof item === 'object' && item !== null) {
        const check = RemoveNullsFromObject(item as Record<string, unknown>)
        if (!isEmptyObject(check)) {
          acc.push(check)
        }
      } else {
        acc.push(item)
      }
    }
    return acc
  }, [])
}

export function RemoveNullsFromObject<T extends object>(obj: T) {
  const result = Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          acc[key] = RemoveNullsFromArray(value)
        } else if (typeof value === 'object') {
          acc[key] = RemoveNullsFromObject(value)
        } else {
          acc[key] = value
        }
      }
      return acc
    },
    {} as Record<string, unknown>,
  )
  return result
}

/**
 * RemoveNulls function
 *
 * This function recursively removes all properties with null or undefined values from an object.
 * If a property is an array, it will recursively process each element.
 * If a property is an object, it will recursively process its properties.
 *
 * @param obj - The object to process.
 * @returns {Record<string, unknown>} - A new plain object with all null or undefined properties removed.
 *
 * @example
 * const original = { a: 1, b: null, c: { d: undefined, e: 2 }, f: [null, 3, { g: null }] };
 * const result = RemoveNulls(original);
 * // result: { a: 1, c: { e: 2 }, f: [3, {}] }
 */
export function RemoveNulls<T extends object>(obj: T): Record<string, unknown> {
  const result = Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          acc[key] = RemoveNullsFromArray(value)
        } else if (typeof value === 'object') {
          acc[key] = RemoveNullsFromObject(value)
        } else {
          acc[key] = value
        }
      }
      return acc
    },
    {} as Record<string, unknown>,
  )
  return result
}
