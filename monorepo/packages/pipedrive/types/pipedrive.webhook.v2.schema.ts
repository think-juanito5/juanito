import { type Static, type TSchema, Type } from '@sinclair/typebox'

const Nullable = <T extends TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()])

export type PipedriveWebhookV2CustomField = Static<
  typeof pipedriveWebhookV2CustomField
>
export const pipedriveWebhookV2CustomField = Type.Object({
  type: Type.String(),
  currency: Type.Optional(Nullable(Type.String())),
  id: Type.Optional(Type.Number()),
  timezone_id: Type.Optional(Type.Number()),
  from: Type.Optional(Type.String()),
  until: Type.Optional(Type.String()),
  country: Type.Optional(Type.String()),
  formatted_address: Type.Optional(Type.String()),
  locality: Type.Optional(Type.String()),
  sublocality: Type.Optional(Type.String()),
  subpremise: Type.Optional(Type.String()),
  route: Type.Optional(Type.String()),
  street_number: Type.Optional(Type.String()),
  admin_area_level_1: Type.Optional(Type.String()),
  admin_area_level_2: Type.Optional(Type.String()),
  postal_code: Type.Optional(Type.String()),
  value: Type.Optional(
    Nullable(Type.Union([Type.String(), Type.Number(), Type.Boolean()])),
  ),
  values: Type.Optional(Type.Array(Type.Object({ id: Type.Number() }))),
})

export type PipedriveWebhookV2Data = Static<typeof pipedriveWebhookV2Data>
export const pipedriveWebhookV2Data = Type.Object({
  add_time: Type.Optional(Nullable(Type.String())),
  close_time: Type.Optional(Nullable(Type.String())),
  creator_user_id: Type.Optional(Nullable(Type.Number())),
  currency: Type.Optional(Nullable(Type.String())),
  custom_fields: Type.Optional(
    Nullable(
      Type.Record(Type.String(), Nullable(pipedriveWebhookV2CustomField)),
    ),
  ),
  expected_close_date: Type.Optional(Nullable(Type.String())),
  first_won_time: Type.Optional(Nullable(Type.String())),
  id: Type.Optional(Type.Number()),
  label_ids: Type.Optional(Type.Array(Type.Number())),
  lost_reason: Type.Optional(Nullable(Type.String())),
  lost_time: Type.Optional(Nullable(Type.String())),
  org_id: Type.Optional(Nullable(Type.Number())),
  owner_id: Type.Optional(Nullable(Type.Number())),
  person_id: Type.Optional(Nullable(Type.Number())),
  pipeline_id: Type.Optional(Nullable(Type.Number())),
  probability: Type.Optional(Nullable(Type.Number())),
  stage_change_time: Type.Optional(Nullable(Type.String())),
  stage_id: Type.Optional(Type.Number()),
  status: Type.Optional(Nullable(Type.String())),
  title: Type.Optional(Nullable(Type.String())),
  update_time: Type.Optional(Nullable(Type.String())),
  value: Type.Optional(Type.Number()),
  visible_to: Type.Optional(Nullable(Type.String())),
  won_time: Type.Optional(Nullable(Type.String())),
})

export type PipedriveWebhookV2Meta = Static<typeof pipedriveWebhookV2Meta>
export const pipedriveWebhookV2Meta = Type.Object({
  action: Type.String(),
  company_id: Type.String(),
  correlation_id: Type.String(),
  entity_id: Type.String(),
  entity: Type.String(),
  id: Type.String(),
  is_bulk_edit: Type.Boolean(),
  timestamp: Type.String(),
  type: Type.String(),
  user_id: Type.String(),
  version: Type.String(),
  webhook_id: Type.String(),
  webhook_owner_id: Type.String(),
  attempt: Type.Number(),
  host: Type.String(),
})

export type PipedriveWebhookV2 = Static<typeof pipedriveWebhookV2>
export const pipedriveWebhookV2 = Type.Object({
  data: pipedriveWebhookV2Data,
  previous: Nullable(pipedriveWebhookV2Data),
  meta: pipedriveWebhookV2Meta,
})
