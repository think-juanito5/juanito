import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {
  MetaPagingSchema,
  Nullable,
  TrueFalseSchema,
  linksSchema,
} from './common'
import { DataCollectionSchema } from './datacollections'
import { TagSchema } from './tags'

export type DataCollectionFields = Static<typeof DataCollectionFieldsSchema>
export const DataCollectionFieldsSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  dataType: Type.String(),
  label: Nullable(Type.String()),
  formOrder: Nullable(Type.Number()),
  listOrder: Nullable(Type.Number()),
  required: Nullable(TrueFalseSchema),
  description: Nullable(Type.String()),
  customHtmlBelow: Nullable(Type.String()),
  customHtmlAbove: Nullable(Type.String()),
  links: Type.Object({
    dataCollection: Type.String(),
    tag: Nullable(Type.String()),
  }),
})

const linkedSchema = Type.Object({
  datacollections: Type.Optional(Type.Array(DataCollectionSchema)),
  tags: Type.Optional(Type.Array(TagSchema)),
})

export const SingleDataCollectionFieldSchema = Type.Object({
  links: linksSchema,
  datacollectionfields: DataCollectionFieldsSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionfields: MetaPagingSchema }),
  }),
})
export type SingleDataCollectionField = Static<
  typeof SingleDataCollectionFieldSchema
>
export const CSingleDataCollectionField = TypeCompiler.Compile(
  SingleDataCollectionFieldSchema,
)

export const PagedDataCollectionFieldsSchema = Type.Object({
  links: linksSchema,
  datacollectionfields: Type.Array(DataCollectionFieldsSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionfields: MetaPagingSchema }),
  }),
})
export type PagedDataCollectionFields = Static<
  typeof PagedDataCollectionFieldsSchema
>
export const CPagedDataCollectionFields = TypeCompiler.Compile(
  PagedDataCollectionFieldsSchema,
)

export const UnknownDataCollectionFieldsSchema = Type.Object({
  links: linksSchema,
  datacollectionfields: Type.Union([
    DataCollectionFieldsSchema,
    Type.Array(DataCollectionFieldsSchema),
  ]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionfields: MetaPagingSchema }),
  }),
})
export type UnknownDataCollectionFields = Static<
  typeof UnknownDataCollectionFieldsSchema
>
export const CUnknownDataCollectionFields = TypeCompiler.Compile(
  UnknownDataCollectionFieldsSchema,
)
