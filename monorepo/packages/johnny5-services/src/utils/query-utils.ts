export const filter = (query: Record<string, string | undefined>) => {
  if (!query) return
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  ) as Record<string, string>
}
