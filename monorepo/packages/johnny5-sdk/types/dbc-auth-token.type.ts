import { type Static, Type as t } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export type DbcAuthToken = Static<typeof dbcAuthTokenSchema>
export const dbcAuthTokenSchema = t.Object({
  access_token: t.String(),
})
export const CDbcAuthToken = TypeCompiler.Compile(dbcAuthTokenSchema)
