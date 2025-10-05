import { TypeCompiler } from '@sinclair/typebox/compiler'
import { type Static, t } from 'elysia'

// BoundingBox here
export const BoundingBoxSchema = t.Object({
  '@odata.type': t.String(),
  left: t.Number(),
  top: t.Number(),
  width: t.Number(),
  height: t.Number(),
  polygon: t.Object({
    '@odata.type': t.String(),
    'coordinates@odata.type': t.String(),
    coordinates: t.Array(
      t.Object({
        '@odata.type': t.String(),
        x: t.Number(),
        y: t.Number(),
      }),
    ),
  }),
})

// ValueLocation here
export const ValueLocationSchema = t.Object({
  '@odata.type': t.String(),
  pageNumber: t.Number(),
  boundingBox: BoundingBoxSchema,
  'regions@odata.type': t.String(),
  regions: t.Array(
    t.Object({
      '@odata.type': t.String(),
      pageNumber: t.Number(),
      polygon: t.Object({
        '@odata.type': t.String(),
        'coordinates@odata.type': t.String(),
        coordinates: t.Array(
          t.Object({
            '@odata.type': t.String(),
            x: t.Number(),
            y: t.Number(),
          }),
        ),
      }),
    }),
  ),
})

// Label here
export type Label = Static<typeof LabelSchema>
export const LabelSchema = t.Object({
  value: t.Optional(t.Union([t.String(), t.Number(), t.Boolean()])),
  displayName: t.String(),
  fieldType: t.String(),
  confidence: t.Number(),
  text: t.String(),
  valueLocation: ValueLocationSchema,
})

export const PredictionOutputSchema = t.Object({
  pageCount: t.Number(),
  layoutName: t.String(),
  layoutConfidenceScore: t.Number(),
  readResults: t.Array(t.Object({})),
  tables: t.Object({}),
  labels: t.Record(t.String(), t.Union([LabelSchema, t.String()])),
})

// ResponseV2 here
export const ResponseV2Schema = t.Object({
  operationStatus: t.Literal('Success'),
  predictionId: t.String(),
  predictionOutput: PredictionOutputSchema,
})

// Main here
export const PowerappExtractResponseSchema = t.Object({
  '@odata.context': t.String(),
  responsev2: ResponseV2Schema,
})

export type PowerappExtractResponse = Static<
  typeof PowerappExtractResponseSchema
>
export const CPowerappExtractResponse = TypeCompiler.Compile(
  PowerappExtractResponseSchema,
)
