export const getObjectDifference = (
  original: Record<string, unknown>,
  updated: Record<string, unknown>,
): Record<string, unknown> => {
  const differences: Record<string, unknown> = {}

  for (const key in original) {
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (original.hasOwnProperty(key)) {
      // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
      if (updated.hasOwnProperty(key)) {
        if (original[key] !== updated[key]) {
          differences[key] = updated[key]
        }
      } else {
        differences[key] = undefined
      }
    }
  }

  for (const key in updated) {
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (updated.hasOwnProperty(key) && !original.hasOwnProperty(key)) {
      differences[key] = updated[key]
    }
  }

  return differences
}
