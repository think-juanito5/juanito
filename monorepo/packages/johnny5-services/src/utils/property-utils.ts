import { AllStates, type BtrSdsClientWebhook } from '@dbc-tech/johnny5/typebox'

export const extractPostcode = (address: string): string | undefined => {
  if (!address) return undefined

  const matches = address.match(/\b\d{4}\b/g)
  if (!matches) return undefined

  const upperAddress = address.toUpperCase()

  for (const state of AllStates) {
    const stateIndex = upperAddress.indexOf(state)
    if (stateIndex !== -1) {
      const afterState = address.slice(stateIndex)
      const postcodeAfterState = afterState.match(/\b\d{4}\b/)
      if (postcodeAfterState) {
        return postcodeAfterState[0]
      }
    }
  }

  // Fallback: last 4-digit number in the string
  return matches[matches.length - 1]
}

export const hasIgnoreInNames = (payload: BtrSdsClientWebhook): boolean => {
  const containsIgnore = (value: unknown): boolean =>
    typeof value === 'string' && value.toLowerCase().includes('ignore')

  const firstSeller = payload.sellers?.[0]
  const sellerHasIgnore = containsIgnore(firstSeller?.full_name)
  const agentHasIgnore = containsIgnore(payload.agent?.full_name)
  const agencyHasIgnore = containsIgnore(payload.agency_name)

  return sellerHasIgnore || agentHasIgnore || agencyHasIgnore
}
