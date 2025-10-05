import { type Static, Type } from '@sinclair/typebox'

export type UnsubscribeOption = Static<typeof unsubscribeOptionSchema>
export const unsubscribeOptionSchema = Type.Union([Type.Literal('all')])
export const AllUnsubscribeOption: Array<UnsubscribeOption> = ['all']

export type CcaEmailUnsubscribeForm = Static<
  typeof ccaEmailUnsubscribeFormSchema
>
export const ccaEmailUnsubscribeFormSchema = Type.Object({
  email: Type.String({ format: 'email', minLength: 5 }),
  option: unsubscribeOptionSchema,
})
