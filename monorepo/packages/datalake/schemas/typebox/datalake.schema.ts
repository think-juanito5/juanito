import { type Static, Type as t } from '@sinclair/typebox'
import { TypeCompiler } from 'elysia/type-system'

export type DuplicateUserCondition = Static<typeof DuplicateUserConditionSchema>
export const DuplicateUserConditionSchema = t.Object({
  fullName: t.String(),
  email: t.String(),
  phone: t.String(),
  firstName: t.String(),
  lastName: t.String(),
})
export const CDuplicateUserCondition = TypeCompiler.Compile(
  DuplicateUserConditionSchema,
)

export type DuplicateLeadCondition = Static<typeof DuplicateLeadConditionSchema>
export const DuplicateLeadConditionSchema = t.Object({
  UtmSource: t.String(),
  TransactionTypeID: t.Number(),
  PropertyTypeID: t.Number(),
  StateID: t.Number(),
  TimeToTransactID: t.Number(),
  CreatedDataInput: t.String(),
  UserID: t.Number(),
})
export const CDuplicateLeadCondition = TypeCompiler.Compile(
  DuplicateLeadConditionSchema,
)

export type DuplicateLeadOtoCondition = Static<
  typeof DuplicateLeadOtoConditionSchema
>
export const DuplicateLeadOtoConditionSchema = t.Object({
  otoProduct: t.String(),
  otoOfferIdHash: t.String(),
})
export const CDuplicateLeadOtoCondition = TypeCompiler.Compile(
  DuplicateLeadOtoConditionSchema,
)
