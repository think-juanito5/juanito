import { capitalise, capitalizePlus } from '@dbc-tech/johnny5/utils'

export function filterSearchCouncil(input: string): string | undefined {
  if (!input) return undefined

  const unwantedValues = [
    'Regional Council',
    'Shire Council',
    'City Council Of',
    'City Council',
    'City Of',
    'Bay Regional Council',
    'Authority',
    'Council',
  ]

  let cleanedInput = input
  unwantedValues.forEach((val) => {
    cleanedInput = cleanedInput
      .replace(new RegExp(`\\b${val}\\b`, 'gi'), '')
      .trim()
  })

  const words = cleanedInput.split(' ')
  const retval = words.slice(0, 2).join(' ')
  return retval ? capitalizePlus(retval) : undefined
}

export type SearchParam = {
  name: string
  value: string
}

export type CouncilSearchOutput = {
  searchParams: SearchParam[]
  filterVal: string
}

export function councilBuildSearch(
  refName: string | undefined,
): CouncilSearchOutput | undefined {
  if (!refName) return undefined
  const filterVal = filterSearchCouncil(refName)
  if (!filterVal) return undefined

  const searchParams: SearchParam[] = [
    { name: 'displayName', value: capitalizePlus(refName)! },
    {
      name: 'displayName_like',
      value: `${filterVal}*`,
    },
  ]
  // const firstPartValue = filterVal.split(' ')[0]
  // if (firstPartValue !== filterVal)
  //   searchParams.push({
  //     name: 'displayName_like',
  //     value: `${firstPartValue}*`,
  //   })
  return { searchParams, filterVal }
}

export function ctsNameSearch(
  refName: string,
): { searchParams: SearchParam[]; filterVal: string } | undefined {
  const searchParams: SearchParam[] = [
    { name: 'displayName', value: capitalise(refName) },
  ]
  return { searchParams, filterVal: capitalise(refName) }
}

export type ParticipantSearchEntity = {
  id: number
  displayName?: string
  companyName?: string
  firstName?: string
  lastName?: string
}

export function locateCouncilData(
  input: string,
  dataset: ParticipantSearchEntity[],
): ParticipantSearchEntity | undefined {
  const xInput = input.toLowerCase().trim()

  const matchingRecords = dataset.filter(
    (item) =>
      (item.displayName?.toLowerCase().includes(xInput) ||
        item.companyName?.toLowerCase().includes(xInput)) &&
      (item.displayName?.toLowerCase().includes('council') ||
        item.companyName?.toLowerCase().includes('council')),
  )

  if (matchingRecords.length === 0) return undefined

  const sortedMatches = matchingRecords.sort((a, b) => {
    const aPriority = a.displayName?.toLowerCase().includes('regional')
      ? 1
      : a.displayName?.toLowerCase().includes('city')
        ? 2
        : 3
    const bPriority = b.displayName?.toLowerCase().includes('regional')
      ? 1
      : b.displayName?.toLowerCase().includes('city')
        ? 2
        : 3
    return aPriority - bPriority
  })

  return sortedMatches[0]
}
