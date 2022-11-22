type UnknownArrayOrObject = unknown[] | Record<string, unknown>

export const dirtyValues = <T>(dirtyFields: UnknownArrayOrObject | true, allValues: T): Partial<T> => {
  // NOTE: Recursive function.

  // If *any* item in an array was modified, the entire array must be submitted, because there's no
  // way to indicate "placeholders" for unchanged elements. `dirtyFields` is `true` for leaves.
  if (dirtyFields === true || Array.isArray(dirtyFields)) {
    return allValues
  }

  return Object.fromEntries(
    Object.keys(dirtyFields).map((key) => {
      const dirtyField = dirtyFields[key]
      const value = (allValues as Record<string, unknown>)[key]
      return [key, dirtyValues(dirtyField as UnknownArrayOrObject | true, value as UnknownArrayOrObject)]
    })
  ) as Partial<T>
}
