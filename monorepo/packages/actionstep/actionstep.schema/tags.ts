import { type Static, Type } from '@sinclair/typebox'
import { Nullable, Numeric } from './common'

export type Tag = Static<typeof TagSchema>
export const TagSchema = Type.Object({
  id: Numeric(),
  name: Type.String(),
  description: Type.String(),
  links: Type.Object({
    parentTag: Nullable(Numeric()),
  }),
})
