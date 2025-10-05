type InitialsOptions = {
  maxLength?: number
  stopWords?: string[] // Words to ignore for companies (e.g., ["The"])
  isCompany?: boolean
  sanitize?: boolean
}

export function getInitials(
  name: string,
  options: InitialsOptions = { isCompany: false },
): string {
  const {
    maxLength = 2,
    stopWords = ['the', 'and', 'of', 'a', 'an', '&'],
    isCompany = false,
    sanitize = true,
  } = options

  // Sanitize: Remove backticks (`), apostrophes ('), and non-letters
  const clean = (text: string): string => {
    if (!sanitize) return text.trim()
    return text
      .replace(/[`']/g, '')
      .replace(/[^a-zA-Z\s]/g, '')
      .trim()
  }

  const cleanedName = clean(name)

  // Handle PERSON names (split first/last)
  if (!isCompany) {
    const [first, last] = cleanedName.split(/\s+/)
    const firstInitial = first?.charAt(0)?.toUpperCase()
    const lastInitial = last?.charAt(0)?.toUpperCase()
    return `${firstInitial}${lastInitial}`.slice(0, maxLength)
  }

  // Handle COMPANY names (ignore stop words)
  const initials = cleanedName
    .split(/\s+/)
    .filter((word) => !stopWords.includes(word.toLowerCase()))
    .slice(0, maxLength)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return initials
}
