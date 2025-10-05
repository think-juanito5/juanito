import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { adaptiveCardSchema } from './adaptive-card'

// Response
export const PowerappTeamsResponseSchema = Type.Object({
  operationStatus: Type.Literal('Success'),
  teamsId: Type.String(),
  channelId: Type.String(),
})

export type PowerappTeamsResponse = Static<typeof PowerappTeamsResponseSchema>
export const CPowerappTeamsResponse = TypeCompiler.Compile(
  PowerappTeamsResponseSchema,
)

//Body
export const PowerappTeamsNotificationsBodySchema = Type.Object({
  teamsId: Type.String(),
  channelId: Type.String(),
  body: Type.Object({
    adaptiveCard: adaptiveCardSchema,
  }),
})

export type PowerappTeamsNotificationsBody = Static<
  typeof PowerappTeamsNotificationsBodySchema
>
export const CPowerappTeamsNotificationsBody = TypeCompiler.Compile(
  PowerappTeamsNotificationsBodySchema,
)
