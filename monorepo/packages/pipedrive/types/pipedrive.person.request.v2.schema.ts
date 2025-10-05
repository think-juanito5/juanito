import { TypeCompiler } from '@sinclair/typebox/compiler'
import { type Static, t } from 'elysia'
import { v2customFieldSchema } from '../schemas'
import { v2DealDataSchema } from '../schemas/v2/deal.schema'

const PhoneSchema = t.Object({
  label: t.Nullable(t.String()),
  value: t.Nullable(t.String()),
  primary: t.Boolean(),
})

const EmailSchema = t.Object({
  label: t.Nullable(t.String()),
  value: t.Nullable(t.String()),
  primary: t.Boolean(),
})

const DataSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  first_name: t.String(),
  last_name: t.String(),
  add_time: t.Optional(t.String()),
  update_time: t.Optional(t.String()),
  visible_to: t.Optional(t.Number()),
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
  owner_id: t.Number(),
  org_id: t.Union([t.Nullable(t.Object({})), t.Number()]),
  is_deleted: t.Boolean(),
  picture_id: t.Nullable(t.Union([t.Number(), t.String()])),
  phones: t.Optional(t.Array(PhoneSchema)),
  emails: t.Optional(t.Array(EmailSchema)),
  im: t.Optional(t.Array(t.Object({}))),
  postal_address: t.Optional(t.Nullable(t.String())),
  notes: t.Optional(t.Nullable(t.String())),
  job_title: t.Optional(t.Nullable(t.String())),
  birthday: t.Optional(t.Nullable(t.String())),
})

export const DealPersonResponseSchema = t.Object({
  success: t.Boolean(),
  data: DataSchema,
})

export type DealPersonCustomFieldsResponse = Pick<
  Static<typeof DataSchema>,
  'custom_fields'
>
export type DealPersonMainOnly = Omit<
  Static<typeof DataSchema>,
  'custom_fields'
>

export type DealPersonResponse = Static<typeof DealPersonResponseSchema>
export const CDealPersonResponse = TypeCompiler.Compile(
  DealPersonResponseSchema,
)

export type FullV2Response = Static<typeof FullV2ResponseData>
export const FullV2ResponseData = t.Object({
  deal: v2DealDataSchema,
  person: DataSchema,
})
