import { type Static, t } from 'elysia'

export const unauthorizedSchema = t.Literal('Unauthorized')

export type AuthHeader = Static<typeof authHeaderSchema>
export const authHeaderSchema = t.Object({
  authorization: t.String(),
})

export type ApiKeyHeader = Static<typeof apikeyHeaderSchema>
export const apikeyHeaderSchema = t.Object({
  apikey: t.String(),
})
