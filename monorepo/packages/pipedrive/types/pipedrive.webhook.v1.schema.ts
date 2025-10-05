import { type Static, Type as t } from '@sinclair/typebox'

export type PipedriveWebhookV1 = Static<typeof pipedriveWebhookV1Schema>
export const pipedriveWebhookV1Schema = t.Object(
  {
    v: t.Literal(1),
    matches_filters: t.Optional(
      t.Object(
        {},
        {
          additionalProperties: true,
        },
      ),
    ),
    meta: t.Object(
      {
        id: t.Number(),
        action: t.String(),
        object: t.String(),
        webhook_id: t.String(),
      },
      {
        additionalProperties: true,
      },
    ),
    current: t.Object(
      {},
      {
        additionalProperties: true,
      },
    ),
    previous: t.Object(
      {},
      {
        additionalProperties: true,
      },
    ),
    retry: t.Number(),
    event: t.String(),
  },
  {
    additionalProperties: true,
  },
)
