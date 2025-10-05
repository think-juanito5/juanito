import { type Static, Type } from '@sinclair/typebox'
import { Nullable } from './common'

export type Countries = Static<typeof CountriesSchema>
export const CountriesSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  dialingCode: Nullable(Type.String()),
  currencyCode: Nullable(Type.String()),
})
