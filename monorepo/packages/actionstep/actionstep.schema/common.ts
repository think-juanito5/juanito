import {
  type NumberOptions,
  type Static,
  type TNumber,
  type TSchema,
  Type,
} from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'

export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()])
export const Numeric = (property?: NumberOptions) => {
  const schema = Type.Number(property)

  return Type.Transform(
    Type.Union(
      [
        Type.String({
          format: 'numeric',
          default: 0,
        }),
        Type.Number(property),
      ],
      property,
    ),
  )
    .Decode((value) => {
      const number = +value
      if (isNaN(number)) return value

      if (property && !Value.Check(schema, number))
        throw new Error(
          `Validation error: ${JSON.stringify({ property, schema, number })}`,
        )

      return number
    })
    .Encode((value) => value) as unknown as TNumber
}

export type ActionStepToken = Static<typeof ActionStepTokenSchema>
export const ActionStepTokenSchema = Type.Object({
  access_token: Type.String(),
  api_endpoint: Type.String(),
  expires_at: Type.String(),
  expires_in: Type.Number(),
  orgkey: Type.String(),
  refresh_token: Type.String(),
  token_type: Type.Literal('bearer'),
})
export const CActionStepToken = TypeCompiler.Compile(ActionStepTokenSchema)

export type TrueFalse = Static<typeof TrueFalseSchema>
export const TrueFalseSchema = Type.Union([
  Type.Literal('T'),
  Type.Literal('F'),
])

export type Priority = Static<typeof PrioritySchema>
export const PrioritySchema = Type.Union([
  Type.Literal('Low'),
  Type.Literal('Normal'),
  Type.Literal('High'),
])

export type EmptyResponse = Static<typeof EmptyResponseSchema>
export const EmptyResponseSchema = Type.Unknown()
export const CEmptyResponse = TypeCompiler.Compile(EmptyResponseSchema)
export type NoContent = Static<typeof EmptyResponseSchema>

export const linksSchema = Type.Record(
  Type.String(),
  Type.Optional(
    Type.Object({
      href: Nullable(Type.String()),
      type: Nullable(Type.String()),
    }),
  ),
)

export const MetaPagingSchema = Type.Object({
  recordCount: Numeric(),
  pageCount: Numeric(),
  page: Numeric(),
  pageSize: Numeric(),
  prevPage: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  nextPage: Type.Optional(Type.Union([Type.String(), Type.Null()])),
})

const MetaResthook = Type.Object({
  id: Type.String(),
  target: Type.String(),
  trigger_count: Type.Number(),
  event_name: Type.String(),
  resource_type: Type.String(),
  resource_id: Type.Union([Type.String(), Type.Number()]),
})

const MetaDebugSchema = Type.Optional(
  Type.Object({
    requestTime: Type.String(),
    mem: Type.String(),
    server: Type.String(),
    cb: Type.String(),
    time: Type.String(),
    appload: Type.String(),
    app: Type.String(),
    db: Type.String(),
    dbc: Type.String(),
    qc: Type.String(),
    uqc: Type.String(),
    fc: Type.String(),
    rl: Nullable(Type.String()),
    resthook: Type.Optional(MetaResthook),
  }),
)

export const metaSchema = Type.Object({
  paging: Type.Record(Type.String(), MetaPagingSchema),
  debug: MetaDebugSchema,
})
