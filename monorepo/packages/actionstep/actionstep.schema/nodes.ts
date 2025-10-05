import { type Static, Type } from '@sinclair/typebox'
import { Nullable, Numeric, TrueFalseSchema } from './common'

export type Node = Static<typeof NodeSchema>
export const NodeSchema = Type.Object({
  id: Numeric(),
  stepNumber: Numeric(),
  isActive: TrueFalseSchema,
  weight: Nullable(Numeric()),
  links: Type.Object({
    actionType: Type.Optional(Type.String()),
    parent: Type.Optional(Type.String()),
  }),
})
