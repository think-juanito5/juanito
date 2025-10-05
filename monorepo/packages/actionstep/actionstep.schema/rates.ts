import { type Static, Type } from '@sinclair/typebox'
import { Numeric, TrueFalseSchema } from './common'

export type Rate = Static<typeof RateSchema>
export const RateSchema = Type.Object({
  id: Numeric(),
  name: Type.Optional(Type.String()),
  rate: Type.Optional(Type.String()),
  includesTax: Type.Optional(TrueFalseSchema),
  costRate: Type.Optional(Type.String()),
  isActive: Type.Optional(TrueFalseSchema),
  isFixedFee: Type.Optional(TrueFalseSchema),
  isCustomRate: Type.Optional(TrueFalseSchema),
  links: Type.Object({
    unit: Type.String(),
  }),
})
