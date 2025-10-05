import { type Static, Type } from '@sinclair/typebox'
import { Nullable, Numeric, TrueFalseSchema } from './common'

export type Division = Static<typeof DivisionSchema>
export const DivisionSchema = Type.Object({
  id: Numeric(),
  timezoneName: Type.String(),
  timezoneOffset: Type.Number(),
  isActive: TrueFalseSchema,
  taxMonths: Nullable(Type.Number()),
  taxAccountingMethod: Nullable(Type.String()),
  lockoutTimestamp: Nullable(Type.String()),
  openingBalanceTimestamp: Nullable(Type.String()),
  emailSignature: Nullable(Type.String()),
  invoiceAccountingMethod: Nullable(Type.String()),
  cashAccountingAllocation: Nullable(Type.String()),
  invoiceAccountingAllocation: Nullable(Type.String()),
  trustLockoutTimestamp: Nullable(Type.String()),
  links: Type.Object({
    participants: Type.String(),
    parent: Nullable(Type.String()),
  }),
})
