export const checkIfTest = (data: {
  firstName: string
  lastName: string
}): boolean => {
  const firstNameUpper = data.firstName.toUpperCase()
  const lastNameUpper = data.lastName.toUpperCase()
  return firstNameUpper.includes('TEST') || lastNameUpper.includes('TEST')
}

export const empty = (value: string): boolean => {
  return value === null || value === undefined || value === ''
}

export const checkCommonPhone = (phone: string): boolean => {
  // Add your logic to check common fake phone numbers
  const commonPhone = [
    '0',
    '400000000',
    '+61400000000',
    '412345678',
    '+61412345678',
    '411111111',
    '+61411111111',
  ]

  if (commonPhone.includes(phone)) {
    return true
  }
  return false
}
