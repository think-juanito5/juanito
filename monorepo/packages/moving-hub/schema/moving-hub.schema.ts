import { type Static, type TSchema, Type as t } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

const Nullable = <T extends TSchema>(schema: T) => t.Union([schema, t.Null()])

export type MovingHubAuthToken = Static<typeof MovingHubAuthTokenSchema>
export const MovingHubAuthTokenSchema = t.Object({
  token: t.String(),
})
export const CMovingHubAuthToken = TypeCompiler.Compile(
  MovingHubAuthTokenSchema,
)
export const AddressSchema = t.Object({
  unit_number: t.String(),
  street_number: t.String(),
  street_name: t.String(),
  street_type: t.String(),
  suburb: t.String(),
  state: t.String(),
  postcode: t.String({ minLength: 4 }),
})

export const CustomerSchema = t.Object({
  first_name: t.String({ minLength: 1 }),
  last_name: t.String({ minLength: 1 }),
  email: t.String({ format: 'email' }),
  primary_phone: t.String({ minLength: 9 }),
})

export type SaveNew = Static<typeof SaveNewSchema>
export const SaveNewSchema = t.Object({
  partner_code: t.String(),
  application_type: t.Number(),
  offer_type: t.Number(),
  customer: CustomerSchema,
  address: t.Object({
    to_address: AddressSchema,
    from_address: AddressSchema,
  }),
  meta_tag: t.String(),
  meta_comment: t.String(),
  action: t.String(),
  send_customer_sms: t.Boolean(),
  send_customer_email: t.Boolean(),
  move_in_date: t.String(),
})

export const CSaveNew = TypeCompiler.Compile(SaveNewSchema)

export type SaveNewResponse = Static<typeof SaveNewResponseSchema>
export const SaveNewResponseSchema = t.Object({
  successful: t.Boolean(),
  reference_code: t.String(),
  customer_id: t.String(),
  application_status: t.Number(),
  application_status_tag: Nullable(t.Number()),
})

export const CSaveNewResponse = TypeCompiler.Compile(SaveNewResponseSchema)
