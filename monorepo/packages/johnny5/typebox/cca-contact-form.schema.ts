import { type Static, Type } from '@sinclair/typebox'

export type CcaContactForm = Static<typeof ccaContactFormSchema>
export const ccaContactFormSchema = Type.Object({
  brand: Type.Literal('CCA'),
  enquiryType: Type.Union([
    Type.Literal('Existing Customer'),
    Type.Literal('New Customer'),
  ]),
  firstName: Type.String({ minLength: 2 }),
  lastName: Type.String({ minLength: 2 }),
  email: Type.String({ format: 'email', minLength: 5 }),
  phone: Type.String({ format: 'mobile' }),
  message: Type.String({ minLength: 5 }),
  entryID: Type.Literal('contact-us'),
  entryTime: Type.String(),
  referralPage: Type.String(),
  utm_id: Type.String(),
  utm_source: Type.String(),
  utm_campaign: Type.String(),
  utm_medium: Type.String(),
  utm_content: Type.Optional(Type.String()),
  userAgent: Type.Optional(Type.String()),
  userIP: Type.Optional(Type.String()),
  cid: Type.String(),
})
