import { type Static, Type } from '@sinclair/typebox'
import { australianStateSchema } from './common.schema'

export const propertyAddressSchema = Type.Object({
  addressLine1: Type.String(),
  addressLine2: Type.Optional(Type.String()),
  suburb: Type.String(),
  state: australianStateSchema,
  postcode: Type.String(),
})

export type PropertyAddress = Static<typeof propertyAddressSchema>
