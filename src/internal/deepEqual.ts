export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) {
    return true
  }

  if (a === null || b === null) {
    return a === b
  }

  if (typeof a !== typeof b) {
    return false
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isNaN(a) && Number.isNaN(b) ? true : a === b
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]))
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    const allKeys = new Set([...keysA, ...keysB])

    for (const key of allKeys) {
      if (!deepEqual(Reflect.get(a, key), Reflect.get(b, key))) {
        return false
      }
    }

    return true
  }

  return false
}
