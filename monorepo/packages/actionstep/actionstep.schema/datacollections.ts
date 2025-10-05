import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionTypesSchema } from './actiontypes'
import {
  MetaPagingSchema,
  Nullable,
  TrueFalseSchema,
  linksSchema,
} from './common'

export type DataCollectionLinks = Static<typeof DataCollectionLinksSchema>
export const DataCollectionLinksSchema = Type.Object({
  actionType: Type.String(),
})

export type DataCollectionPost = Static<typeof DataCollectionPostSchema>
export const DataCollectionPostSchema = Type.Object({
  datacollections: Type.Object({
    name: Type.String(),
    description: Type.String(),
    multipleRecords: TrueFalseSchema,
    order: Type.Optional(Type.Number()),
    label: Type.String(),
    alwaysShowDescriptions: Type.Optional(TrueFalseSchema),
    links: DataCollectionLinksSchema,
  }),
})

export type DataCollection = Static<typeof DataCollectionSchema>
export const DataCollectionSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  description: Type.Optional(Nullable(Type.String())),
  multipleRecords: TrueFalseSchema,
  order: Nullable(Type.Number()),
  label: Type.String(),
  alwaysShowDescriptions: Nullable(TrueFalseSchema),
  links: DataCollectionLinksSchema,
})

const linkedSchema = Type.Object({
  actiontypes: Type.Optional(Type.Array(ActionTypesSchema)),
})

export type SingleDataCollection = Static<typeof SingleDataCollectionSchema>
export const SingleDataCollectionSchema = Type.Object({
  links: linksSchema,
  datacollections: DataCollectionSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollections: MetaPagingSchema }),
  }),
})
export const CSingleDataCollection = TypeCompiler.Compile(
  SingleDataCollectionSchema,
)

export type PagedDataCollections = Static<typeof PagedDataCollectionsSchema>
export const PagedDataCollectionsSchema = Type.Object({
  links: linksSchema,
  datacollections: Type.Array(DataCollectionSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollections: MetaPagingSchema }),
  }),
})
export const CPagedDataCollections = TypeCompiler.Compile(
  PagedDataCollectionsSchema,
)

export type UnknownDataCollections = Static<typeof UnknownDataCollectionsSchema>
export const UnknownDataCollectionsSchema = Type.Object({
  links: linksSchema,
  datacollections: Type.Union([
    DataCollectionSchema,
    Type.Array(DataCollectionSchema),
  ]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollections: MetaPagingSchema }),
  }),
})
export const CUnknownDataCollections = TypeCompiler.Compile(
  UnknownDataCollectionsSchema,
)
