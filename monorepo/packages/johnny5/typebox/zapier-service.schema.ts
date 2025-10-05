import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export const FormTypeSchema = Type.Union([
  Type.Literal('Contract Drafting'),
  Type.Literal('Contract Drafting - NSWVIC'),
  Type.Literal('Contract Upload'),
  Type.Literal('No Contract Upload'),
])
export type FormType = Static<typeof FormTypeSchema>

export const ZapierPayloadSchema = Type.Object({
  dealID: Type.Number(),
  Campaign: Type.Optional(Type.String()),
  Source: Type.Optional(Type.String()),
  Medium: Type.Optional(Type.String()),
  UtmID: Type.Optional(Type.String()),
  Ref: Type.Optional(Type.String()),
  Consent: Type.Optional(Type.Union([Type.Literal('yes'), Type.Literal('no')])),
  Formtype: FormTypeSchema,
  Email: Type.String({ format: 'email' }),
  Firstname: Type.String(),
  Lastname: Type.String(),
  Phone: Type.String(),
})

export type ZapierPayload = Static<typeof ZapierPayloadSchema>

export const ZapierResponseSchema = Type.Object({
  attempt: Type.String(),
  id: Type.String(),
  request_id: Type.String(),
  status: Type.Literal('success'),
})

export type ZapierResponse = Static<typeof ZapierResponseSchema>
export const CZapierResponse = TypeCompiler.Compile(ZapierResponseSchema)
