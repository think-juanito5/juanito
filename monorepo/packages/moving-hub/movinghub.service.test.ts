import { beforeAll, describe, expect, it } from 'bun:test'
import { ConsoleLogger } from '@dbc-tech/logger'
import { MovingHubService } from './movinghub.service'
import type { SaveNew } from './schema/moving-hub.schema'

describe('MovingHubService', () => {
  let service: MovingHubService

  const validRequest = (): SaveNew => {
    return {
      partner_code: 'phelp',
      application_type: 1,
      offer_type: 1,
      customer: {
        first_name: 'Probewabuyphstageone',
        last_name: 'Staging',
        email: 'accfortestingabc+99949895@gmail.com',
        primary_phone: '0418733463',
      },
      address: {
        to_address: {
          unit_number: '',
          street_number: '12A',
          street_name: 'Red',
          street_type: 'Street',
          suburb: 'Sample',
          state: 'WA',
          postcode: '5656',
        },
        from_address: {
          unit_number: '',
          street_number: '12A',
          street_name: 'Red',
          street_type: 'Street',
          suburb: 'Sample',
          state: 'WA',
          postcode: '5656',
        },
      },
      meta_tag: 'Buyer',
      meta_comment:
        'Buyer lead that is moving TO this address. Date provided is the settlement date, not moving date.',
      action: 'submit_quick',
      send_customer_sms: true,
      send_customer_email: true,
      move_in_date: '2024-07-25T00:00:00+10:00',
    }
  }

  beforeAll(() => {
    service = new MovingHubService({
      baseUrl: process.env['CCA_MHUB_API_URL']!,
      username: process.env['CCA_MHUB_USERNAME']!,
      password: process.env['CCA_MHUB_PASSWORD']!,
      partnerCode: process.env['CCA_MHUB_PARTNER_CODE']!,
      apiKey: process.env['CCA_MHUB_API_KEY']!,
      logger: ConsoleLogger(),
    })
  })

  describe('saveNew', () => {
    it('should create an application and return a response', async () => {
      const request = validRequest()

      const response = await service.saveNew(request)

      expect(response.successful).toBe(true)
      expect(response.reference_code).toEqual(expect.any(String))
      expect(response.customer_id).toEqual(expect.any(String))
      expect(response.application_status).toEqual(expect.any(Number))
      expect(response.application_status_tag).toBeNull()
    })

    const invalidDates = [
      '2024-04-12',
      '12/04/2024',
      '12-04-2024',
      '12/04/24',
      '12-04-24',
      '12-Apr-2024',
      '12-Apr-24',
      '12 Apr 2024',
    ]

    it.each(invalidDates)(
      'should not create an application with an invalid move_in_date',
      async (invalidDate: string) => {
        const request = validRequest()
        request.move_in_date = invalidDate

        expect(service.saveNew(request)).rejects.toThrowError(
          '{"successful":false,"error":"Invalid request.","error_detail":[{"field":"move_in_date","error_type":"format","error_message":"The attribute should match \'uhubdate\' format."}]}',
        )
      },
    )

    it('should create an application with an empty move_in_date', async () => {
      const request = validRequest()
      request.move_in_date = ''

      const response = await service.saveNew(request)

      expect(response.successful).toBe(true)
    })

    it('should not create an application with a null move_in_date', async () => {
      const request = validRequest()
      request.move_in_date = null!

      expect(service.saveNew(request)).rejects.toThrowError(
        '{"successful":false,"error":"Invalid request.","error_detail":[{"field":"move_in_date","error_type":"type","error_message":"The attribute expected to be of type \'\'string\'\' but \'null\' given."}]}',
      )
    })

    it('should not create an application with an empty postcode', async () => {
      const request = validRequest()
      request.address.from_address.postcode = ''

      expect(service.saveNew(request)).rejects.toThrowError(
        '{"successful":false,"error":"Invalid request.","error_detail":[{"field":"address=>from_address=>postcode","error_type":"minLength","error_message":"Minimum 1 character\\/s required."}]}',
      )
    })

    it('should not create an application with an empty firstName', async () => {
      const request = validRequest()
      request.customer.first_name = ''

      expect(service.saveNew(request)).rejects.toThrowError(
        '{"successful":false,"error":"Invalid request.","error_detail":[{"field":"customer=>first_name","error_type":"minLength","error_message":"Minimum 1 character\\/s required."}]}',
      )
    })

    it('should not create an application with an empty firstName', async () => {
      const request = validRequest()
      request.customer.last_name = ''

      expect(service.saveNew(request)).rejects.toThrowError(
        '{"successful":false,"error":"Invalid request.","error_detail":[{"field":"customer=>last_name","error_type":"minLength","error_message":"Minimum 1 character\\/s required."}]}',
      )
    })

    it('should not create an application with an empty email', async () => {
      const request = validRequest()
      request.customer.email = ''

      expect(service.saveNew(request)).rejects.toThrowError(
        '{"successful":false,"error":"Invalid request.","error_detail":[{"field":"customer=>email","error_type":"format","error_message":"The attribute should match \'email\' format."}]}',
      )
    })

    it('should not create an application with an empty primary_phone', async () => {
      const request = validRequest()
      request.customer.primary_phone = ''

      expect(service.saveNew(request)).rejects.toThrowError(
        '{"successful":false,"error":"Invalid request.","error_detail":[{"field":"customer=>primary_phone","error_type":"minLength","error_message":"Minimum 9 character\\/s required."}]}',
      )
    })
  })
})
