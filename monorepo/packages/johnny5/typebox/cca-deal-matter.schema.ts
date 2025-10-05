import { type Static, Type } from '@sinclair/typebox'

export type CcaDealMatter = Static<typeof ccaDealMatterSchema>
export const ccaDealMatterSchema = Type.Object({
  dealId: Type.Number(),
  testMode: Type.Optional(Type.Boolean()),
})
