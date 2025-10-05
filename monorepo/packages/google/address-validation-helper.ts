import { Err, Ok, type Result } from 'ts-results-es'
function isGoogleValidationResponse(
  obj: unknown,
): obj is GoogleAddressValidationResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'result' in obj &&
    typeof (obj as Record<string, unknown>).result === 'object'
  )
}

function isValidComponent(level: string): boolean {
  return level === 'CONFIRMED'
}

function mapComponentTypeToAU(type: string): string {
  switch (type) {
    case 'route':
      return 'streetName'
    case 'locality':
      return 'suburb'
    case 'administrative_area_level_1':
      return 'state'
    case 'postal_code':
      return 'postalCode'
    case 'street_number':
      return 'streetNumber'
    case 'country':
      return 'country'
    default:
      return type
  }
}

type GoogleValidationComponent = {
  componentName: { text: string; languageCode: string }
  componentType: string
  confirmationLevel: string
}

type GooglePostalAddress = {
  addressLines: string[]
  regionCode: string
  postalCode: string
  administrativeArea: string
  locality: string
  sublocality: string
  recipients: string[]
  revision: number
  languageCode: string
  sortingCode: string
  organization: string
}

type GoogleAddressVerdict = {
  inputGranularity: string
  validationGranularity: string
  geocodeGranularity: string
  addressComplete: boolean
  hasUnconfirmedComponents: boolean
  hasInferredComponents: boolean
  hasReplacedComponents: boolean
}

type GoogleValidationResult = {
  address: {
    addressComponents: GoogleValidationComponent[]
    postalAddress: GooglePostalAddress
  }
  verdict: GoogleAddressVerdict
}

type GoogleAddressValidationResponse = {
  result: GoogleValidationResult
}

type AddressComponentSummary = {
  text: string
  type: string
  confirmationLevel: string
  isValid: boolean
}

type PostalSummary = {
  addressLines: string[]
  postalCode: string
  state: string
  suburb: string
}

export type ValidateAddressMinimal = {
  googleVerdict: {
    addressComplete: boolean
    hasUnconfirmedComponents: boolean
  }
  components: AddressComponentSummary[]
  postal: PostalSummary
  allValid: boolean
  lowConfidence: boolean
  invalidTypes: string[]
}

export function formatAddressValidation(
  raw: Result<unknown[], string>,
  verbose = false,
): Result<ValidateAddressMinimal, string> {
  if (!raw.ok) return Err(raw.val)

  const rawEntry = raw.val[0]
  if (!isGoogleValidationResponse(rawEntry)) {
    return Err('Invalid format: missing `result` in Google response')
  }

  const { address, verdict } = rawEntry.result

  const components: AddressComponentSummary[] = address.addressComponents.map(
    (component) => {
      const isValid = isValidComponent(component.confirmationLevel)
      return {
        text: component.componentName.text,
        type: mapComponentTypeToAU(component.componentType),
        confirmationLevel: component.confirmationLevel,
        isValid,
      }
    },
  )

  const allValid = components.every((c) => c.isValid)
  const invalidTypes = components.filter((c) => !c.isValid).map((c) => c.type)

  const postal: PostalSummary = {
    addressLines: address.postalAddress.addressLines,
    postalCode: address.postalAddress.postalCode,
    state: address.postalAddress.administrativeArea,
    suburb: address.postalAddress.locality,
  }

  return Ok({
    googleVerdict: {
      addressComplete: verdict.addressComplete,
      hasUnconfirmedComponents: verdict.hasUnconfirmedComponents,
    },
    components: !verbose && allValid ? [] : components,
    postal,
    allValid,
    lowConfidence: !allValid,
    invalidTypes,
  })
}
