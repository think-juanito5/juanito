import { TypeCompiler } from '@sinclair/typebox/compiler'
import { type Static, t } from 'elysia'

export const settlementCalcuMatterUpdateResponseSchema = t.Union([
  t.Null(),
  t.Object({}),
  t.Object({
    success: t.Optional(t.Boolean()),
    reply: t.Optional(t.String()),
  }),
])

export type SettlementCalcuMatterUpdateResponse = Static<
  typeof settlementCalcuMatterUpdateResponseSchema
>
export const CSettlementCalcuMatterUpdateResponse = TypeCompiler.Compile(
  settlementCalcuMatterUpdateResponseSchema,
)
