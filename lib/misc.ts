export const singleParam = (
  value: string | string[] | undefined | null
): string => {
  if (value == null) return ""
  if (Array.isArray(value)) return value[0] || ""
  return value || ""
}
