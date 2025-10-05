import { Nullable } from '@dbc-tech/actionstep'
import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export type CcaPaymentForm = Static<typeof ccaPaymentFormSchema>
export const ccaPaymentFormSchema = Type.Object({
  matter_id: Type.Number(),
  matter_reference: Nullable(Type.String()),
  customer_token: Nullable(Type.String()),
  customer_name: Nullable(Type.String()),
  payment_method_token: Nullable(Type.String()),
  amount: Nullable(Type.Number()),
  email: Nullable(Type.String({ format: 'email' })),
  invoice_number: Nullable(Type.String()),
  payment_type: Nullable(Type.String()),
})

export const CCcaPaymentForm = TypeCompiler.Compile(ccaPaymentFormSchema)
