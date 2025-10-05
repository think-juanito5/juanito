import { type Static, t } from 'elysia'

export type JwtSchema = Static<typeof jwtSchema>
export const jwtSchema = t.Object({
  tenant: t.Union([t.Literal('BTR'), t.Literal('CCA'), t.Literal('FCL')]),
  scope: t.Literal('client'),
  source: t.Optional(t.String()),
  sub: t.Optional(t.String()),
  exp: t.Optional(t.Number()),
})

export type AccessTokenSchema = Static<typeof accessTokenSchema>
export const accessTokenSchema = t.Object({
  access_token: t.String(),
})
