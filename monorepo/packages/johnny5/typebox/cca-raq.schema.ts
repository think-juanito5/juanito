import { type Static, Type as t } from '@sinclair/typebox'
import { cloudEventSchema } from './cloud-event.schema'
import {
  australianStateSchema,
  bstSchema,
  propertyTypeSchema,
  tenantSchema,
  timeToTransactSchema,
} from './common.schema'

export type CcaRaqWebhook = Static<typeof ccaRaqWebhookSchema>
export const ccaRaqWebhookSchema = t.Object({
  firstName: t.String({ minLength: 2 }),
  lastName: t.String({ minLength: 2 }),
  email: t.String({ format: 'email' }),
  phone: t.String({ format: 'mobile' }),
  propertyType: propertyTypeSchema,
  timeToTransact: timeToTransactSchema,
  bst: bstSchema,
  state: australianStateSchema,
  cid: t.Optional(t.String()),
  sendEmailQuote: t.Optional(t.Boolean()),
  referralPage: t.Optional(t.String()),
  channel: t.Optional(t.String()),
  optIn: t.Optional(t.Boolean()),
  utm_id: t.Optional(t.String()),
  utm_source: t.Optional(t.String()),
  utm_campaign: t.Optional(t.String()),
  utm_medium: t.Optional(t.String()),
  utm_content: t.Optional(t.String()),
  acceptPartnerTerms: t.Optional(t.Boolean()),
  membershipNo: t.Optional(t.String()),
  offerCode: t.Optional(t.String()),
  datalake_request_id: t.Optional(t.String()),
  testMode: t.Optional(t.Boolean()),
  notes: t.Optional(t.String()),
  otoProductType: t.Optional(t.String()),
  preferredContactTime: t.Optional(t.String()),
  agent: t.Optional(t.String()),
  referralID: t.Optional(t.String()),
  referralPartnerEmail: t.Optional(t.String()),
  referralFranchiseeEmail: t.Optional(t.String()),
  conveyancingFirm: t.Optional(t.String()),
  conveyancingName: t.Optional(t.String()),
  experiment_id: t.Optional(t.String()),
  experiment_variation: t.Optional(t.String()),
  otoBuyerIdHash: t.Optional(t.String()),
  otoOfferIdHash: t.Optional(t.String()),
  otoListingIdHash: t.Optional(t.String()),
  sdsRequired: t.Optional(t.Boolean()),
  webhook_id: t.Optional(t.String()),
})

export type CcaRaqWebhookWithSource = Static<
  typeof ccaRaqWebhookSchemaWithSource
>
export const ccaRaqWebhookSchemaWithSource = t.Composite([
  ccaRaqWebhookSchema,
  t.Object({
    source: t.String(),
    sub: t.String(),
  }),
])

export type CcaRaqWebhookqCloudEvent = Static<
  typeof ccaRaqWebhookqCloudEventSchema
>
export const ccaRaqWebhookqCloudEventSchema = t.Composite([
  cloudEventSchema,
  t.Object({
    data: ccaRaqWebhookSchema,
  }),
])

export type CcaRaq = Static<typeof ccaRaqSchema>
export const ccaRaqSchema = t.Composite([
  ccaRaqWebhookSchema,
  t.Object({
    // The unique identifier for the RAQ
    id: t.String(),
    // Tenant Key: CCA, BTR, FCL etc.
    tenant: tenantSchema,
    // File Id
    fileId: t.String(),
    // Job Id
    jobId: t.String(),
    // The date the Job was created
    createdOn: t.String({ format: 'date-time' }),
  }),
])
