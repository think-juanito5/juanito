import { t } from 'elysia'

export const v2customFieldSchema = t.Object({
  type: t.Optional(t.Nullable(t.String())),
  currency: t.Optional(t.String()),
  id: t.Optional(t.Nullable(t.Number())),
  timezone_id: t.Optional(t.Number()),
  from: t.Optional(t.String()),
  until: t.Optional(t.String()),
  country: t.Optional(t.String()),
  formatted_address: t.Optional(t.String()),
  locality: t.Optional(t.String()),
  sublocality: t.Optional(t.String()),
  subpremise: t.Optional(t.String()),
  route: t.Optional(t.String()),
  street_number: t.Optional(t.String()),
  admin_area_level_1: t.Optional(t.String()),
  admin_area_level_2: t.Optional(t.String()),
  postal_code: t.Optional(t.String()),
  value: t.Optional(t.Nullable(t.Union([t.String(), t.Number(), t.Boolean()]))),
  values: t.Optional(t.Array(t.Object({ id: t.Number() }))),
})
