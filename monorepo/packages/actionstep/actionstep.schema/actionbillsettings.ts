import { type Static, Type } from '@sinclair/typebox'
import { TrueFalseSchema } from './common'

export type ActionBillSettings = Static<typeof ActionBillSettingsSchema>
export const ActionBillSettingsSchema = Type.Object({
  id: Type.String(),
  quotedAmountIncludes: Type.Optional(Type.String()),
  isBillable: Type.Optional(TrueFalseSchema),
  isUtbmsEnabled: Type.Optional(TrueFalseSchema),
  defaultTimeEntryBehaviour: Type.Optional(Type.String()),
  salesTaxAppliesTo: Type.Optional(Type.String()),
  discountType: Type.Optional(Type.String()),
  links: Type.Object({
    currency: Type.Optional(Type.String()),
    salesTaxRate: Type.Optional(Type.String()),
  }),
})
