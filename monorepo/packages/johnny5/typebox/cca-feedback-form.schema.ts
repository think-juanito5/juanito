import { type Static, Type } from '@sinclair/typebox'

export type CcaFeedbackForm = Static<typeof ccaFeedbackFormSchema>
export const ccaFeedbackFormSchema = Type.Object({
  firstName: Type.String({ minLength: 2 }),
  lastName: Type.String({ minLength: 2 }),
  email: Type.String({ format: 'email', minLength: 5 }),
  phone: Type.String({ format: 'mobile' }),
  matterId: Type.Optional(Type.String()),
  feedbackValue: Type.Number(),
  feedbackMessage: Type.String({ minLength: 5 }),
  referralPage: Type.Optional(Type.String()),
  userIP: Type.Optional(Type.String()),
  cid: Type.String(),
})
