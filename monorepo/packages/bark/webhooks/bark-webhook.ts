import { type Static, type TSchema, Type as t } from '@sinclair/typebox'

const Nullable = <T extends TSchema>(schema: T) => t.Union([schema, t.Null()])

export const createdAtSchema = t.Object({
  date_utc: t.String(),
  friendly: t.String(),
})

export type Answer = Static<typeof answerSchema>
export const answerSchema = t.Object({
  question: t.String(),
  type: t.String(),
  possible_answers: Nullable(t.Array(t.String())),
  is_required: t.Boolean(),
  is_custom_answer: t.Boolean(),
  answer_type: t.String(),
  answer: t.String(),
})

export type Bark = Static<typeof barkSchema>
export const barkSchema = t.Object({
  id: t.Number(),
  credits_required: t.Number(),
  purchase_cap: t.Number(),
  purchased_count: t.Number(),
  created_at: createdAtSchema,
  display: t.Object({
    html: t.String(),
    text: t.String(),
  }),
  interactions: t.Object({
    is_shortlisted: t.Boolean(),
    interaction_types: Nullable(t.Unknown()),
    last_interaction: t.Number(),
    last_message: t.String(),
  }),
  entities: t.Object({
    buyer: t.Object({
      name: Nullable(t.String()),
      email: Nullable(t.String()),
      telephone: Nullable(t.String()),
      telephone_formatted: Nullable(t.String()),
      business_name: Nullable(t.String()),
      short_name: Nullable(t.String()),
    }),
  }),
  metadata: t.Object({
    images: t.Array(t.Unknown()),
    country: t.Object({
      id: t.Number(),
      name: t.String(),
    }),
    category: t.Object({
      id: t.Number(),
      name: t.String(),
    }),
    questions: t.Object({
      data: t.Array(answerSchema),
    }),
    location: t.Object({
      name: t.String(),
      latitude: t.String(),
      longitude: t.String(),
      is_local: t.Boolean(),
      postcode: t.String(),
    }),
  }),
  project_response_status: t.Number(),
  is_urgent: t.Boolean(),
  is_top_opportunity: t.Boolean(),
  contact_preferences: t.Object({
    prefers_contact_by_phone: t.Boolean(),
    prefers_contact_by_email: t.Boolean(),
    prefers_contact_by_sms: t.Boolean(),
  }),
  trusted_form: t.Object({
    has_trusted_form_certificate: t.Boolean(),
    certificate_id: Nullable(t.Unknown()),
    certificate_url: Nullable(t.Unknown()),
  }),
  business_name: Nullable(t.Unknown()),
  response_type: t.String(),
  enquiry_message: t.String(),
})

export type BarkWebhook = Static<typeof barkwebhookSchema>
export const barkwebhookSchema = t.Object({
  bark: barkSchema,
  created_at: createdAtSchema,
  quote: t.Object({
    type: Nullable(t.Unknown()),
    value: Nullable(t.Unknown()),
    detail: t.String(),
  }),
  note: t.String(),
  last_message: t.Object({
    type: t.String(),
    label: t.String(),
    time: t.Number(),
    is_read: t.Boolean(),
    sender: t.String(),
  }),
})
