import { type Static, Type } from '@sinclair/typebox'

export type ServiceType = Static<typeof serviceTypeSchema>
export const serviceTypeSchema = Type.Union([
  Type.Literal('conveyancing-buy'),
  Type.Literal('conveyancing-sell'),
  Type.Literal('conveyancing-transfer'),
  Type.Literal('internal'),
  Type.Literal('unknown'),
])

export const AllServiceTypes: Array<ServiceType> = [
  'conveyancing-buy',
  'conveyancing-sell',
  'conveyancing-transfer',
  'internal',
  'unknown',
]
