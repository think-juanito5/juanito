import { type Static, type TSchema, Type as t } from '@sinclair/typebox'

const Nullable = <T extends TSchema>(schema: T) => t.Union([schema, t.Null()])

export type HiddenFields = Static<typeof hiddenFieldsSchema>
export const hiddenFieldsSchema = t.Object({
  actiontype: t.Optional(t.String()),
  clientemail: t.Optional(t.String()),
  clientfirstname: t.Optional(t.String()),
  clientname: t.Optional(t.String()),
  matterowneremail: t.Optional(t.String()),
  matterownerfirstname: t.Optional(t.String()),
  matterownernumber: t.Optional(t.String()),
  refmatid: t.Optional(t.String()),
  alemail: t.Optional(t.String()),
  alname: t.Optional(t.String()),
  propadd: t.Optional(t.String()),
  sp: t.Optional(t.String()),
})

export type DefinitionEnding = Static<typeof definitionEndingSchema>
export const definitionEndingSchema = t.Object({
  id: t.String(),
  ref: t.String(),
  type: t.String(),
  title: t.String(),
  properties: t.Object({}),
  attachment: t.Optional(t.Object({})),
  layout: t.Optional(t.Object({})),
})

export type DefinitionField = Static<typeof definitionFieldSchema>
export const definitionFieldSchema = t.Object({
  id: t.String(),
  ref: t.String(),
  type: t.String(),
  title: t.String(),
  properties: t.Object({}),
  allow_multiple_selections: t.Optional(t.Boolean()),
  allow_other_choice: t.Optional(t.Boolean()),
  choices: t.Optional(
    t.Array(t.Object({ id: t.String(), label: t.String(), ref: t.String() })),
  ),
})

export type AnswerField = Static<typeof answerFieldSchema>
export const answerFieldSchema = t.Object({
  id: t.String(),
  type: t.String(),
  ref: t.String(),
})

export type AnswerChoiceOther = Static<typeof answerChoiceOtherSchema>
export const answerChoiceOtherSchema = t.Object({
  other: t.String(),
})

export type AnswerChoice = Static<typeof answerChoiceSchema>
export const answerChoiceSchema = t.Object({
  id: t.String(),
  label: t.String(),
  ref: t.String(),
})

export type AnswerChoices = Static<typeof answerChoicesSchema>
export const answerChoicesSchema = t.Object({
  ids: Nullable(t.Array(t.String())),
  labels: Nullable(t.Array(t.String())),
  refs: Nullable(t.Array(t.String())),
})

export type AnswerPayment = Static<typeof answerPaymentSchema>
export const answerPaymentSchema = t.Object({
  amount: t.String(),
  last4: t.String(),
  name: t.String(),
  success: t.Boolean(),
})

export type AnswerType = Static<typeof answerTypeSchema>
export const answerTypeSchema = t.Union([
  t.Literal('boolean'),
  t.Literal('choice'),
  t.Literal('choices'),
  t.Literal('date'),
  t.Literal('email'),
  t.Literal('file_url'),
  t.Literal('long_text'),
  t.Literal('number'),
  t.Literal('payment'),
  t.Literal('phone_number'),
  t.Literal('short_text'),
  t.Literal('text'),
  t.Literal('url'),
])

export type Answer = Static<typeof answerSchema>
export const answerSchema = t.Object({
  type: answerTypeSchema,
  text: t.Optional(t.String()),
  email: t.Optional(t.String()),
  file_url: t.Optional(t.String()),
  date: t.Optional(t.String()),
  field: answerFieldSchema,
  choice: t.Optional(t.Union([answerChoiceSchema, answerChoiceOtherSchema])),
  choices: t.Optional(answerChoicesSchema),
  url: t.Optional(t.String()),
  boolean: t.Optional(t.Boolean()),
  phone_number: t.Optional(t.String()),
  number: t.Optional(t.Number()),
  payment: t.Optional(answerPaymentSchema),
})

const definitionSchema = t.Object({
  id: t.String(),
  title: t.String(),
  fields: t.Array(definitionFieldSchema),
  endings: t.Array(definitionEndingSchema),
})

const endingSchema = t.Object({
  id: t.String(),
  ref: t.String(),
})

export type FormResponse = Static<typeof formResponseSchema>
export const formResponseSchema = t.Object({
  form_id: t.String(),
  token: t.String(),
  landed_at: t.String(),
  submitted_at: t.String(),
  calculated: t.Optional(t.Object({ score: t.Number() })),
  hidden: t.Optional(hiddenFieldsSchema),
  variables: t.Optional(
    t.Array(
      t.Object({
        key: t.String(),
        type: t.String(),
        number: t.Optional(t.String()),
        text: t.Optional(t.String()),
      }),
    ),
  ),
  definition: definitionSchema,
  answers: t.Array(answerSchema),
  ending: endingSchema,
})

export type TypeFormWebhook = Static<typeof typeFormWebhookSchema>
export const typeFormWebhookSchema = t.Object({
  event_id: t.String(),
  event_type: t.String(),
  form_response: formResponseSchema,
})

export const answerSimplifiedSchema = t.Object({
  type: t.Union([answerTypeSchema, t.Literal('ending')]),
  definition: t.Union([definitionFieldSchema, definitionEndingSchema]),
  response: t.String(),
})
export type AnswerSimplified = Static<typeof answerSimplifiedSchema>

export const formResponseReshapedSchema = t.Record(
  t.String(),
  answerSimplifiedSchema,
)
export type FormResponseReshaped = Static<typeof formResponseReshapedSchema>
