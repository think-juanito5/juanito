import { type Static, t } from 'elysia'
import { TypeCompiler } from 'elysia/type-system'
import { v2customFieldSchema } from './custom-field.schema'

export type V2DealCustomFields = Pick<V2DealData, 'custom_fields'>
export type V2DealMainOnly = Omit<V2DealData, 'custom_fields'>
export type V2DealUpdate = Omit<V2DealData, 'id'>

export type V2DealData = Static<typeof v2DealDataSchema>
export const v2DealDataSchema = t.Object({
  acv: t.Optional(t.Nullable(t.String())),
  add_time: t.Optional(t.Nullable(t.String())),
  arr: t.Optional(t.Nullable(t.String())),
  channel: t.Optional(t.Nullable(t.String())),
  channel_id: t.Optional(t.Nullable(t.String())),
  close_time: t.Optional(t.Nullable(t.String())),
  creator_user_id: t.Optional(t.Nullable(t.Number())),
  currency: t.Optional(t.Nullable(t.String())),
  custom_fields: t.Optional(
    t.Nullable(
      t.Record(
        t.String(),
        t.Union([
          t.Nullable(v2customFieldSchema),
          t.String(),
          t.Number(),
          t.Boolean(),
        ]),
      ),
    ),
  ),
  expected_close_date: t.Optional(t.Nullable(t.String())),
  first_won_time: t.Optional(t.Nullable(t.String())),
  id: t.Number(),
  is_deleted: t.Optional(t.Boolean()),
  label_ids: t.Optional(t.Array(t.Number())),
  local_close_date: t.Optional(t.Nullable(t.String())),
  local_lost_date: t.Optional(t.Nullable(t.String())),
  local_won_date: t.Optional(t.Nullable(t.String())),
  lost_reason: t.Optional(t.Nullable(t.String())),
  lost_time: t.Optional(t.Nullable(t.String())),
  mrr: t.Optional(t.Nullable(t.String())),
  org_id: t.Optional(t.Nullable(t.Number())),
  origin: t.Optional(t.Nullable(t.String())),
  origin_id: t.Optional(t.Nullable(t.String())),
  owner_id: t.Optional(t.Nullable(t.Number())),
  person_id: t.Optional(t.Nullable(t.Number())),
  pipeline_id: t.Optional(t.Nullable(t.Number())),
  probability: t.Optional(t.Nullable(t.Number())),
  stage_change_time: t.Optional(t.Nullable(t.String())),
  stage_id: t.Optional(t.Number()),
  status: t.Optional(t.Nullable(t.String())),
  title: t.Optional(t.Nullable(t.String())),
  update_time: t.Optional(t.Nullable(t.String())),
  value: t.Optional(t.Number()),
  visible_to: t.Optional(t.Nullable(t.Number())),
  won_time: t.Optional(t.Nullable(t.String())),
})

export type V2Deal = Static<typeof v2DealSchema>
export const v2DealSchema = t.Object({
  data: v2DealDataSchema,
  success: t.Literal(true),
})

export const CV2Deal = TypeCompiler.Compile(v2DealSchema)

export type V2DealCustomField = Static<typeof v2DealCustomField>
export const v2DealCustomField = t.Union([
  t.String(),
  t.Number(),
  t.Object({
    value: t.Union([t.String(), t.Number()]),
    currency: t.Literal('AUD'),
  }),
])

export type V2DealCreate = Static<typeof v2DealCreateSchema>
export const v2DealCreateSchema = t.Object({
  person_id: t.Number(),
  title: t.String(),
  stage_id: t.Number(),
  creator_user_id: t.Optional(t.Number()),
  owner_id: t.Optional(t.Number()),
  custom_fields: t.Record(t.String(), v2DealCustomField),
})

export type V2DealCustom = Static<typeof v2DealCustomSchema>
export const v2DealCustomSchema = t.Object({
  phone: t.Optional(t.Nullable(t.String())),
  source: t.Optional(t.Nullable(t.String())),
  referralPage: t.Optional(t.Nullable(t.String())),
  leadSourceCampaign: t.Optional(t.Nullable(t.String())),
  leadSourceCategory: t.Optional(t.Nullable(t.Number())),
  leadChannel: t.Optional(t.Nullable(t.String())),
  leadSubSource: t.Optional(t.Nullable(t.String())),
  state: t.Optional(t.Nullable(t.Number())),
  bst: t.Optional(t.Nullable(t.Number())),
  propertyDetIndex: t.Optional(t.Nullable(t.Number())),
  webformTtt: t.Optional(t.Nullable(t.String())),
  enableMarketing: t.Optional(t.Nullable(t.Number())),
  racvConsent: t.Optional(t.Nullable(t.Number())),
  racvMembershipNo: t.Optional(t.Nullable(t.String())),
  offerApplied: t.Optional(t.Nullable(t.Number())),
  otoProduct: t.Optional(t.Nullable(t.Number())),
  prefferredContactTime: t.Optional(t.Nullable(t.String())),
  agentReferee: t.Optional(t.Nullable(t.String())),
  ReferralId: t.Optional(t.Nullable(t.String())),
  campaignTrigger: t.Optional(t.Nullable(t.Number())),
  leadJourney: t.Optional(t.Nullable(t.String())),
  searchesFee: t.Optional(t.Nullable(t.Number())),
  draftingFee: t.Optional(t.Nullable(t.Number())),
  reviewFee: t.Optional(t.Nullable(t.Number())),
  fixedFee: t.Optional(t.Nullable(t.Number())),
  additionalInfo: t.Optional(t.Nullable(t.Number())),
  discountOffered: t.Optional(t.Nullable(t.Number())),
  webformUrl: t.Optional(t.Nullable(t.String())),
  leadSource: t.Optional(t.Nullable(t.Number())),
})

export type V2DealResponse = Static<typeof v2DealResponseSchema>
export const v2DealResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    id: t.Number(),
    creator_user_id: t.Number(),
    add_time: t.String(),
    status: t.String(),
    owner_id: t.Number(),
    custom_fields: t.Record(t.String(), t.Nullable(v2DealCustomField)),
  }),
})
export const CV2DealResponse = TypeCompiler.Compile(v2DealResponseSchema)

export type V2PersonResponseItem = Static<typeof V2PersonResponseItemSchema>
export const V2PersonResponseItemSchema = t.Object({
  result_score: t.Number(),
  item: t.Object({
    id: t.Number(),
    type: t.String(),
    name: t.String(),
    phones: t.Array(t.String()),
    emails: t.Array(t.String()),
    primary_email: t.Nullable(t.String()),
    visible_to: t.Number(),
    owner: t.Object({
      id: t.Number(),
    }),
    organization: t.Nullable(t.Any()), // Define the structure if known
    custom_fields: t.Array(t.Any()), // Define the structure if known
    notes: t.Array(t.Any()), // Define the structure if known
    update_time: t.String(),
  }),
})

export type V2PersonResponse = Static<typeof v2PersonResponseSchema>
export const v2PersonResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Optional(
    t.Nullable(
      t.Object({
        items: t.Array(V2PersonResponseItemSchema), // Define the structure of the items if known
      }),
    ),
  ),
  additional_data: t.Optional(
    t.Nullable(
      t.Object({
        next_cursor: t.Nullable(t.String()),
      }),
    ),
  ),
})
export const CV2PersonResponse = TypeCompiler.Compile(v2PersonResponseSchema)

export type V2PersonCreate = Static<typeof v2PersonCreateSchema>
export const v2PersonCreateSchema = t.Object({
  name: t.String(),
  emails: t.Array(
    t.Object({
      value: t.String(),
    }),
  ),
  phones: t.Array(
    t.Object({
      value: t.String(),
    }),
  ),
  marketing_status: t.String(),
})

export type V2SearchPerson = Static<typeof V2SearchPersonSchema>
export const V2SearchPersonSchema = t.Object({
  field: t.String(),
  term: t.String(),
})

export type V2CreatePersonResponse = Static<typeof v2CreatePersonResponseSchema>
export const v2CreatePersonResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    id: t.Number(),
    marketing_status: t.Optional(t.String()),
  }),
})
export const CV2CreatePersonResponse = TypeCompiler.Compile(
  v2CreatePersonResponseSchema,
)

export type V2PersonUpdate = Static<typeof v2PersonUpdateSchema>
export const v2PersonUpdateSchema = t.Object({
  marketing_status: t.String(),
})

export type V2Deals = Static<typeof v2DealSchemas>
export const v2DealSchemas = t.Object({
  data: t.Array(v2DealDataSchema),
  success: t.Literal(true),
})

export const CV2Deals = TypeCompiler.Compile(v2DealSchemas)

export const NotificationDealSchema = t.Object({
  id: t.Number({ minimum: 1 }),
  person_id: t.Object({
    name: t.String({ minLength: 1 }),
  }),
  user_id: t.Object({
    name: t.String({ minLength: 1 }),
  }),
})
export type NotificationDeal = Static<typeof NotificationDealSchema>
