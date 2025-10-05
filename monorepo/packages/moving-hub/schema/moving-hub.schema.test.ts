import { describe, expect, it } from 'bun:test'
import { IsEmail } from '@dbc-tech/johnny5'
import { FormatRegistry } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { type SaveNew, SaveNewSchema } from './moving-hub.schema'

FormatRegistry.Set('email', (value) => IsEmail(value))

describe('MovingHub Schema', () => {
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

  describe('SaveNew', () => {
    describe('general', () => {
      it('should check true with a valid request', async () => {
        const request = validRequest()

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(true)
      })
    })

    describe('move_in_date', () => {
      it('should check false when null', async () => {
        const request = validRequest()
        request.move_in_date = null!

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })
    })

    describe('first_name', () => {
      it('should check false when null', async () => {
        const request = validRequest()
        request.customer.first_name = null!

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })

      it('should check false when string is empty', async () => {
        const request = validRequest()
        request.customer.first_name = ''

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })
    })

    describe('last_name', () => {
      it('should check false when null', async () => {
        const request = validRequest()
        request.customer.last_name = null!

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })

      it('should check false when string is empty', async () => {
        const request = validRequest()
        request.customer.first_name = ''

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })
    })

    describe('email', () => {
      it('should check false when null', async () => {
        const request = validRequest()
        request.customer.email = null!

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })

      it('should check false when string is empty', async () => {
        const request = validRequest()
        request.customer.email = ''

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })

      it('should check false when not in email format', async () => {
        const request = validRequest()
        request.customer.email = 'not_an_email'

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })
    })

    describe('primary_phone', () => {
      it('should check false when null', async () => {
        const request = validRequest()
        request.customer.primary_phone = null!

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })

      it('should check false when string is empty', async () => {
        const request = validRequest()
        request.customer.primary_phone = ''

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })
    })

    describe('postcode', () => {
      it('should check false when null', async () => {
        const request = validRequest()
        request.address.from_address.postcode = null!

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })

      it('should check false when string is empty', async () => {
        const request = validRequest()
        request.address.from_address.postcode = ''

        const response = Value.Check(SaveNewSchema, request)

        expect(response).toBe(false)
      })
    })
  })
})
