import { describe, expect, it } from 'bun:test'
import { validateAddress } from '@dbc-tech/cca-common'
import type { AddressValidationService } from '@dbc-tech/google'
import type { MatterCreateDetailAddress } from '@dbc-tech/johnny5/typebox'
import { ConsoleLogger } from '@dbc-tech/logger'
import { Ok } from 'ts-results-es'

describe('validateAddress', () => {
  const mockLogger = ConsoleLogger()

  it('returns valid result when allValid is true #case1 Residential', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: true,
            hasUnconfirmedComponents: false,
          },
          allValid: true,
          components: [],
          postal: {
            addressLines: ['40 Appenzeller Dr'],
            postalCode: '3978',
            state: 'VIC',
            suburb: 'Clyde North',
          },
          lowConfidence: false,
          invalidTypes: [],
        }),
    }

    const result = await validateAddress(
      mockService,
      '40 Appenzeller Dr VIC 3978',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: '40 Appenzeller Dr',
      suburb: 'Clyde North',
      state: 'VIC',
      postcode: '3978',
      type: 'physical',
    })
  })

  it('returns valid result in #case2 Apartment/Unit', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: true,
            hasUnconfirmedComponents: true,
          },
          components: [
            {
              text: 'Unit 12',
              type: 'subpremise',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: '35',
              type: 'streetNumber',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Wellington Street',
              type: 'streetName',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'St Kilda',
              type: 'suburb',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'VIC',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: '3182',
              type: 'postalCode',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: ['Unit 12/35 Wellington St'],
            postalCode: '3182',
            state: 'VIC',
            suburb: 'St Kilda',
          },
          allValid: false,
          lowConfidence: true,
          invalidTypes: ['subpremise'],
        }),
    }

    const result = await validateAddress(
      mockService,
      'Unit 12 35 Wellington Street St Kilda VIC 3182',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: 'Unit 12/35 Wellington Street',
      suburb: 'St Kilda',
      state: 'VIC',
      postcode: '3182',
      type: 'physical',
    })
  })

  it('returns valid result in #case3 PO Box', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: false,
            hasUnconfirmedComponents: true,
          },
          components: [
            {
              text: 'PO Box 1234',
              type: 'post_box',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Brisbane',
              type: 'colloquial_area',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'QLD',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: '4001',
              type: 'postalCode',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: ['PO Box 1234'],
            postalCode: '4001',
            state: 'QLD',
            suburb: 'Brisbane',
          },
          allValid: false,
          lowConfidence: true,
          invalidTypes: ['post_box', 'postalCode'],
        }),
    }

    const result = await validateAddress(
      mockService,
      'PO Box 1234 Brisbane QLD 4001',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: 'PO Box 1234',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4001',
      type: 'physical',
    })
  })

  it('returns valid result in #case4 With Lot', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: true,
            hasUnconfirmedComponents: true,
          },
          components: [
            {
              text: 'Lot 5',
              type: 'streetNumber',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Kingsford Smith Road',
              type: 'streetName',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Wagga Wagga',
              type: 'suburb',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'NSW',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: '2650',
              type: 'postalCode',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: ['Lot 5 Kingsford Smith Rd'],
            postalCode: '2650',
            state: 'NSW',
            suburb: 'Wagga Wagga',
          },
          allValid: false,
          lowConfidence: true,
          invalidTypes: ['streetNumber', 'suburb'],
        }),
    }

    const result = await validateAddress(
      mockService,
      'Lot 5 Smith Road Wagga Wagga NSW 2650',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: 'Lot 5 Kingsford Smith Road',
      suburb: 'Wagga Wagga',
      state: 'NSW',
      postcode: '2650',
      type: 'physical',
    })
  })

  it('returns valid result in #case5 Misspelled Suburb', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: true,
            hasUnconfirmedComponents: false,
          },
          components: [
            {
              text: '40',
              type: 'streetNumber',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Appenzeller Drive',
              type: 'streetName',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: ['40 Appenzeller Dr'],
            postalCode: '3978',
            state: 'VIC',
            suburb: 'Clyde North',
          },
          allValid: true,
          lowConfidence: false,
          invalidTypes: [],
        }),
    }

    const result = await validateAddress(
      mockService,
      '40 Appenzeller Drive Clyd North VIC 3978',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: '40 Appenzeller Drive',
      suburb: 'Clyde North',
      state: 'VIC',
      postcode: '3978',
      type: 'physical',
    })
  })

  it('returns valid result in #case5 Swapped letters in st name', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: false,
            hasUnconfirmedComponents: true,
          },
          components: [
            {
              text: '221B',
              type: 'streetNumber',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'George Street',
              type: 'streetName',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Sydney',
              type: 'colloquial_area',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'NSW',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: '2000',
              type: 'postalCode',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Waterloo',
              type: 'suburb',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: ['221B George St'],
            postalCode: '2000',
            state: 'NSW',
            suburb: 'Waterloo',
          },
          allValid: false,
          lowConfidence: true,
          invalidTypes: ['streetNumber'],
        }),
    }

    const result = await validateAddress(
      mockService,
      '221B Geogre Street Sydney NSW 2000',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: '221B George Street',
      suburb: 'Waterloo',
      state: 'NSW',
      postcode: '2000',
      type: 'physical',
    })
  })

  it('returns valid result in #case6 Wrong state abbreviation', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: true,
            hasUnconfirmedComponents: true,
          },
          components: [
            {
              text: 'Unit 12',
              type: 'subpremise',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: '35',
              type: 'streetNumber',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Wellington Street',
              type: 'streetName',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'St Kilda',
              type: 'suburb',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'NSV',
              type: 'state',
              confirmationLevel: 'UNCONFIRMED_AND_SUSPICIOUS',
              isValid: false,
            },
            {
              text: '3182',
              type: 'postalCode',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: ['Unit 12/35 Wellington St'],
            postalCode: '3182',
            state: 'NSV',
            suburb: 'St Kilda',
          },
          allValid: false,
          lowConfidence: true,
          invalidTypes: ['subpremise', 'state'],
        }),
    }

    const result = await validateAddress(
      mockService,
      'Unit 12, 35 Wellington Street St Kilda NSV 3182',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: 'Unit 12/35 Wellington Street',
      suburb: 'St Kilda',
      state: 'NSV',
      postcode: '3182',
      type: 'physical',
    })
  })

  it('returns valid result in #case6 Typo in postcode', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: false,
            hasUnconfirmedComponents: true,
          },
          components: [
            {
              text: 'PO Box 1234',
              type: 'post_box',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Brisbane',
              type: 'colloquial_area',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'QLD',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: '40011',
              type: 'postalCode',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: ['PO Box 1234'],
            postalCode: '40011',
            state: 'QLD',
            suburb: 'Brisbane',
          },
          allValid: false,
          lowConfidence: true,
          invalidTypes: ['post_box', 'postalCode'],
        }),
    }

    const result = await validateAddress(
      mockService,
      'PO Box 1234 Brisbane QLD 40011',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: 'PO Box 1234',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '40011',
      type: 'physical',
    })
  })

  it('returns valid result when allValid is false but components are valid', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: false,
            hasUnconfirmedComponents: true,
          },
          allValid: false,
          postal: {
            addressLines: [],
            postalCode: '2000',
            state: 'NSW',
            suburb: 'Faketown',
          },
          components: [
            {
              text: '401',
              type: 'streetNumber',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Fake Drive',
              type: 'streetName',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Faketown',
              type: 'suburb',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'NSW',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: '2000',
              type: 'postalCode',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          lowConfidence: false,
          invalidTypes: ['streetNumber', 'streetName'],
        }),
    }

    const result = await validateAddress(
      mockService,
      '401, Fake Dr, NSW 2000',
      mockLogger,
    )

    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: '401 Fake Drive',
      suburb: 'Faketown',
      state: 'NSW',
      postcode: '2000',
      type: 'physical',
    })
  })

  it('returns valid result when address is just VIC state', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: false,
            hasUnconfirmedComponents: true,
          },
          allValid: true,
          components: [],
          postal: {
            addressLines: [],
            postalCode: '',
            state: 'VIC',
            suburb: '',
          },
          lowConfidence: false,
          invalidTypes: [],
        }),
    }

    const result = await validateAddress(mockService, 'VIC', mockLogger)
    expect(result).toEqual(<MatterCreateDetailAddress>{
      line1: undefined,
      suburb: '',
      state: 'VIC',
      postcode: '',
      type: 'physical',
    })
  })

  it('returns Invalid Address when an input is Invalid Addres', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: false,
            hasUnconfirmedComponents: true,
          },
          allValid: false,
          components: [
            {
              text: 'Invalid',
              type: 'suburb',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Address',
              type: 'state',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: [],
            postalCode: '',
            state: 'Address',
            suburb: 'Invalid',
          },
          lowConfidence: false,
          invalidTypes: ['suburb', 'state'],
        }),
    }

    const result = await validateAddress(
      mockService,
      'Invalid Address',
      mockLogger,
    )
    const expected: MatterCreateDetailAddress = {
      line1: undefined,
      suburb: 'Invalid',
      state: 'Address',
      postcode: undefined,
      type: 'physical',
    }
    expect(result).toEqual(expected)
  })

  it('falls back to components when allValid is false', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: true,
            hasUnconfirmedComponents: true,
          },
          allValid: false,
          components: [
            {
              text: '401',
              type: 'streetNumber',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'Fake Dr',
              type: 'streetName',
              confirmationLevel: 'UNCONFIRMED_BUT_PLAUSIBLE',
              isValid: false,
            },
            {
              text: 'NSW',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: '2000',
              type: 'postalCode',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Sydney',
              type: 'suburb',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: ['401 Fake Dr'],
            postalCode: '2000',
            state: 'NSW',
            suburb: 'Sydney',
          },
          lowConfidence: true,
          invalidTypes: [],
        }),
    }

    const result = await validateAddress(
      mockService,
      '401 Fake Dr NSW 2000',
      mockLogger,
    )
    const expected: MatterCreateDetailAddress = {
      line1: '401 Fake Dr',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      type: 'physical',
    }
    expect(result).toEqual(expected)
  })

  it('provides relevant address info when the provided address is just state and postcode', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: false,
            hasUnconfirmedComponents: true,
          },
          allValid: false,
          components: [
            {
              text: 'VIC',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: '3978',
              type: 'postalCode',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Clyde',
              type: 'suburb',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: [],
            postalCode: '3978',
            state: 'VIC',
            suburb: 'Clyde',
          },
          lowConfidence: true,
          invalidTypes: [],
        }),
    }

    const result = await validateAddress(mockService, 'VIC 3978', mockLogger)
    const expected: MatterCreateDetailAddress = {
      line1: undefined,
      suburb: 'Clyde',
      state: 'VIC',
      postcode: '3978',
      type: 'physical',
    }
    expect(result).toEqual(expected)
  })

  it('provides relevant address info when input provided is just postcode', async () => {
    const mockService: Pick<AddressValidationService, 'validateWithFormat'> = {
      validateWithFormat: async () =>
        Ok({
          googleVerdict: {
            addressComplete: false,
            hasUnconfirmedComponents: true,
          },
          allValid: false,
          components: [
            {
              text: '2000',
              type: 'postalCode',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Australia',
              type: 'country',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'Sydney',
              type: 'suburb',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
            {
              text: 'NSW',
              type: 'state',
              confirmationLevel: 'CONFIRMED',
              isValid: true,
            },
          ],
          postal: {
            addressLines: [],
            postalCode: '2000',
            state: 'NSW',
            suburb: 'Sydney',
          },
          lowConfidence: true,
          invalidTypes: [],
        }),
    }

    const result = await validateAddress(mockService, '2000', mockLogger)
    const expected: MatterCreateDetailAddress = {
      line1: undefined,
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      type: 'physical',
    }
    expect(result).toEqual(expected)
  })
})
