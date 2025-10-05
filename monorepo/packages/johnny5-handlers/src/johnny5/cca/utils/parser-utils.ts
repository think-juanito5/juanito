import {
  type AustralianState as AUState,
  type MatterCreateDetailAddress,
  AllStates as states,
} from '@dbc-tech/johnny5/typebox'

export const parseAddress = (input: string): MatterCreateDetailAddress => {
  //split with comma or space
  const parts = input.split(/,\s*|\s+/)
  let postcode = ''
  let state

  //? postcode at state
  const optPostCode = parts[parts.length - 1]
  if (/^\d{4}$/.test(optPostCode)) {
    postcode = parts.pop() as string
  }

  const optState = parts[parts.length - 1]
  if (states.includes(optState.toLocaleUpperCase() as AUState)) {
    state = parts.pop() as AUState
  }

  let unit_street_no = ''
  let street_name = ''
  let suburb = ''

  if (parts.length > 1) {
    suburb = parts.pop() as string
    street_name = parts.join(' ')
  } else if (parts.length === 1) {
    street_name = parts[0]
  }

  const streetParts = street_name.split(/\s+/)
  if (streetParts.length > 1) {
    unit_street_no = streetParts[0]
    street_name = streetParts.slice(1).join(' ')
  } else {
    street_name = streetParts[0]
  }

  return {
    line1: `${unit_street_no} ${street_name}`,
    suburb,
    state,
    postcode,
    type: 'physical',
  }
}
