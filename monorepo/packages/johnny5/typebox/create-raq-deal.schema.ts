import { type Static, Type } from '@sinclair/typebox'

export type CreateRaqDeal = Static<typeof createRaqDealSchema>
export const createRaqDealSchema = Type.Object({
  ccaRaqId: Type.String(),
})
