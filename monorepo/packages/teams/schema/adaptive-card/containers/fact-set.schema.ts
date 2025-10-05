import { type Static, Type } from '@sinclair/typebox'

export type Fact = Static<typeof factSchema>
export const factSchema = Type.Object({
  title: Type.String(),
  value: Type.String(),
})

export type FactSet = Static<typeof factSetSchema>
export const factSetSchema = Type.Object({
  type: Type.Literal('FactSet'),
  facts: Type.Array(factSchema),
})
