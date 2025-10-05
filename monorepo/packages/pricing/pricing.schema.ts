import { bstSchema } from '@dbc-tech/dataverse'
import {
  australianStateSchema,
  propertyTypeSchema,
} from '@dbc-tech/johnny5/typebox/common.schema'
import { type Static, Type } from '@sinclair/typebox'

const baseSchema = Type.Object({
  state: Type.Optional(australianStateSchema),
  bst: Type.Optional(bstSchema),
  propertyType: Type.Optional(propertyTypeSchema),
})

const versionSchema = Type.Union([
  Type.Literal('current'),
  Type.Literal('draft'),
])

// Version-based query schema
export const versionBasedSchema = Type.Intersect([
  baseSchema,
  Type.Object({
    version: versionSchema,
  }),
  // Ensure effectiveDate is not present
  Type.Object({
    effectiveDate: Type.Optional(Type.Null()),
  }),
])

// Date-based query schema
const dateBasedSchema = Type.Intersect([
  baseSchema,
  Type.Object({
    effectiveDate: Type.String(),
  }),
  // Ensure version is not present
  Type.Object({
    version: Type.Optional(Type.Null()),
  }),
])

// Combine them into a union type
export const queryInputSchema = Type.Union([
  versionBasedSchema,
  dateBasedSchema,
])
// Type extraction
export type QueryInput = Static<typeof queryInputSchema>
