import type { AustralianState, FormType, Intent } from '@dbc-tech/johnny5'

export const getFormType = (
  state: AustralianState,
  intent: Intent,
  filename: string | undefined,
): FormType | undefined => {
  const draftingStates = new Set(['NSW', 'VIC', 'QLD'])

  if (intent === 'sell' && draftingStates.has(state)) {
    return state === 'NSW' || state === 'VIC'
      ? 'Contract Drafting - NSWVIC'
      : 'Contract Drafting'
  }

  return filename ? 'Contract Upload' : 'No Contract Upload'
}
