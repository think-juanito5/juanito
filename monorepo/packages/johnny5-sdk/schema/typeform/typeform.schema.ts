import { tenantSchema } from '@dbc-tech/johnny5/typebox'
import { typeFormWebhookSchema } from '@dbc-tech/typeform'
import { type Static, t } from 'elysia'

export const typeFormWebhookReceivedSchema = t.Intersect([
  t.Object({ tenant: tenantSchema }),
  typeFormWebhookSchema,
])
export type TypeFormWebhookReceived = Static<
  typeof typeFormWebhookReceivedSchema
>
