import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export const businessUnitsInnerSchema = Type.Object({
  '@odata.etag': Type.Optional(Type.String()),
  businessunitid: Type.String(),
  name: Type.String(),
  divisionName: Type.Optional(Type.String()),
})
export type BusinessUnitsInner = Static<typeof businessUnitsInnerSchema>
export const CBusinessUnitsInner = TypeCompiler.Compile(
  businessUnitsInnerSchema,
)

export const businessUnitsSchema = Type.Object({
  '@odata.context': Type.String(),
  value: Type.Array(businessUnitsInnerSchema),
})
export type BusinessUnits = Static<typeof businessUnitsSchema>
export const CBusinessUnits = TypeCompiler.Compile(businessUnitsSchema)
