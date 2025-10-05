import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Nullable, Numeric, commonFields } from '../common'

const BtrPexaAuditSchema = Type.Object({
  dbc_action_id: Type.Optional(Numeric()),
  dbc_dbc_task_id: Type.Optional(Numeric()),
  dbc_name: Type.Optional(Nullable(Type.String())),
})

const BtrPexaAuditIdSchema = Type.Object({
  dbc_btr_pexa_auditid: Type.String(),
})

const BtrPexaAuditSchemaPost = Type.Intersect([
  Type.Object({
    'owningbusinessunit@odata.bind': Type.String(),
  }),
  BtrPexaAuditSchema,
])
export type dbcBtrPexaAuditPost = Static<typeof BtrPexaAuditSchemaPost>
export const dbcBtrPexaAuditPostResponseSchema = Type.Intersect([
  Type.Object({
    '@odata.context': Type.String(),
  }),
  commonFields,
  BtrPexaAuditIdSchema,
  BtrPexaAuditSchema,
])

export type dbcBtrPexaAuditPostResponse = Static<
  typeof dbcBtrPexaAuditPostResponseSchema
>
export const CBtrPexaAuditPostResponse = TypeCompiler.Compile(
  dbcBtrPexaAuditPostResponseSchema,
)

export const dbcBtrPexaAuditSchemaGet = Type.Object({
  '@odata.context': Type.String(),
  value: Type.Array(
    Type.Intersect([commonFields, BtrPexaAuditIdSchema, BtrPexaAuditSchema]),
  ),
})
export type dbcBtrPexaAuditGet = Static<typeof dbcBtrPexaAuditSchemaGet>
export const CBtrPexaAuditGet = TypeCompiler.Compile(dbcBtrPexaAuditSchemaGet)

const BtrPexaAuditResultsSchema = Type.Object({
  dbc_answer: Type.Optional(Nullable(Type.String())),
  _dbc_btr_pexa_audit_value: Type.Optional(Type.String()),
  dbc_btr_pexa_audit_question: Type.Optional(Type.String()),
  dbc_company_name: Type.Optional(Nullable(Type.String())),
  dbc_name: Type.Optional(Type.String()),
  dbc_part: Type.Optional(Type.String()),
  dbc_potential_answers: Type.Optional(Type.String()),
})

const BtrPexaAuditResultsIdSchema = Type.Object({
  dbc_btr_pexa_audit_resultid: Type.Optional(Type.String()),
})

export const btrPexaAuditResultsInnerSchema = Type.Array(
  Type.Intersect([
    commonFields,
    BtrPexaAuditResultsIdSchema,
    BtrPexaAuditResultsSchema,
  ]),
)
export type BtrPexaAuditResultsInner = Static<
  typeof btrPexaAuditResultsInnerSchema
>

export const btrPexaAuditResultsSchema = Type.Object({
  '@odata.context': Type.String(),
  value: btrPexaAuditResultsInnerSchema,
})
export type BtrPexaAuditResults = Static<typeof btrPexaAuditResultsSchema>
export const CBtrPexaAuditResults = TypeCompiler.Compile(
  btrPexaAuditResultsSchema,
)
