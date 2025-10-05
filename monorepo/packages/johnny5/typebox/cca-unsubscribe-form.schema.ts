import { type Static, Type } from '@sinclair/typebox'

export type UnsubscribeOption = Static<typeof unsubscribeOptionSchema>
export const unsubscribeOptionSchema = Type.Union([Type.Literal('all')])
export const AllUnsubscribeOption: Array<UnsubscribeOption> = ['all']

export type CcaUnsubscribeForm = Static<typeof ccaUnsubscribeFormSchema>
export const ccaUnsubscribeFormSchema = Type.Object({
  email: Type.String({ format: 'email', minLength: 5 }),
  option: unsubscribeOptionSchema,
})
