import { type Static, Type } from '@sinclair/typebox'
import { adaptiveCardSchema } from './adaptive-card'

export const adaptiveCardAttachmentSchema = Type.Object({
  contentType: Type.Literal('application/vnd.microsoft.card.adaptive'),
  content: adaptiveCardSchema,
})

export type TeamsChatWebhook = Static<typeof teamsChatWebhookSchema>
export const teamsChatWebhookSchema = Type.Object({
  type: Type.Literal('message'),
  attachments: Type.Array(adaptiveCardAttachmentSchema),
})
