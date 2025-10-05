import { type Static, Type } from '@sinclair/typebox'
import { urlPattern } from '../constants'

export const btrSdsPersonSchema = Type.Object({
  full_name: Type.String({ minLength: 2 }),
  email: Type.String({ format: 'email' }),
  phone: Type.String({ format: 'mobile' }),
})
export type BtrSdsPerson = Static<typeof btrSdsPersonSchema>

export const btrSdsMediaLinkSchema = Type.Object({
  type: Type.String(),
  url: Type.String({ pattern: urlPattern }),
})
export type BtrSdsMediaLink = Static<typeof btrSdsMediaLinkSchema>

export const btrSdsAgentWebhookSchema = Type.Object({
  webhook_id: Type.String(),
  agent: btrSdsPersonSchema,
  agency_name: Type.String(),
  agent_id: Type.String(),
  agent_profile_url: Type.Optional(Type.String({ pattern: urlPattern })),
  customer_landing_url: Type.Optional(Type.String({ pattern: urlPattern })),
  customer_form_url: Type.Optional(Type.String({ pattern: urlPattern })),
  agent_website_url: Type.Optional(Type.String({ pattern: urlPattern })),
  postcodes: Type.Array(Type.Number()),
  slug: Type.String(),
  agency_image: Type.Optional(Type.String({ pattern: urlPattern })),
  profile_image: Type.Optional(Type.String({ pattern: urlPattern })),
  agency_bio: Type.Optional(Type.String()),
  agency_service_area: Type.Optional(Type.String()),
  media_links: Type.Optional(Type.Array(btrSdsMediaLinkSchema)),
  created_on: Type.String(),
  conveyancer_email: Type.Optional(Type.String({ format: 'email' })),
  conveyancer_area: Type.Optional(Type.String()),
})

export type BtrSdsAgentWebhook = Static<typeof btrSdsAgentWebhookSchema>

export const btrSdsAgentEmailSchema = Type.Object({
  agent: btrSdsPersonSchema,
  agency_name: Type.String(),
  agency_service_area: Type.Optional(Type.String()),
  agent_profile_url: Type.Optional(Type.String({ pattern: urlPattern })),
  customer_landing_url: Type.Optional(Type.String({ pattern: urlPattern })),
  customer_form_url: Type.Optional(Type.String({ pattern: urlPattern })),
  agent_website_url: Type.Optional(Type.String({ pattern: urlPattern })),
  created_on: Type.String(),
  subject: Type.String(),
  postcode: Type.String(),
  area: Type.String(),
  region: Type.String(),
  conveyancerName: Type.String(),
})

export type BtrSdsAgentEmail = Static<typeof btrSdsAgentEmailSchema>

export const btrSdsClientWebhookSchema = Type.Object({
  webhook_id: Type.String(),
  property_address: Type.String(),
  sellers: Type.Array(btrSdsPersonSchema, { minItems: 1 }),
  agent: btrSdsPersonSchema,
  agency_name: Type.String(),
  agent_id: Type.Optional(Type.String()),
  referral_url: Type.String({ pattern: urlPattern }),
  created_on: Type.Optional(Type.String({ format: 'date-time' })),
  conveyancer_email: Type.Optional(Type.String({ format: 'email' })),
  conveyancer_area: Type.Optional(Type.String()),
})

export type BtrSdsClientWebhook = Static<typeof btrSdsClientWebhookSchema>
