export function containsPercentage(input: string): boolean {
  const regex = /\d%/i

  return regex.test(input)
}

export function convertPercentageToDecimal(input: string): number | undefined {
  const re = /(\d+)%/i
  const match = input.match(re)
  if (!match) return undefined
  return Number(match[1]) / 100.0
}

export function parseNumberOnly(input: string): number | undefined {
  if (!input) return undefined

  if (containsPercentage(input)) return undefined

  const charsToRemove = ['$', ' ', ',']
  let temp: string = input

  charsToRemove.forEach((char) => {
    temp = temp.replace(char, '')
  })
  const match = temp.match(/\d+/)

  return match ? +match[0] : undefined
}
