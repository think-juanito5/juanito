import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionSchema } from './actions'
import {
  MetaPagingSchema,
  Numeric,
  TrueFalseSchema,
  linksSchema,
} from './common'
import { DataCollectionSchema } from './datacollections'

export const DataCollectionRecordsLinksSchema = Type.Object({
  action: Type.String(),
  dataCollection: Type.String(),
})
export type DataCollectionRecordsLinks = Static<
  typeof DataCollectionRecordsLinksSchema
>

export const DataCollectionRecordsSchema = Type.Object({
  id: Numeric(),
  canWrite: TrueFalseSchema,
  canDelete: TrueFalseSchema,
  links: DataCollectionRecordsLinksSchema,
})
export type DataCollectionRecords = Static<typeof DataCollectionRecordsSchema>

export const dataCollectionRecordPostInnerSchema = Type.Object({
  links: DataCollectionRecordsLinksSchema,
})
export type DataCollectionRecordPostInner = Static<
  typeof dataCollectionRecordPostInnerSchema
>

export const DataCollectionRecordPostSchema = Type.Object({
  datacollectionrecords: dataCollectionRecordPostInnerSchema,
})
export type DataCollectionRecordPost = Static<
  typeof DataCollectionRecordPostSchema
>

export const dataCollectionRecordsPostMultipleSchema = Type.Object({
  datacollectionrecords: Type.Array(dataCollectionRecordPostInnerSchema),
})
export type DataCollectionRecordsPostMultiple = Static<
  typeof dataCollectionRecordsPostMultipleSchema
>

const linkedSchema = Type.Object({
  actions: Type.Optional(Type.Array(ActionSchema)),
  datacollections: Type.Optional(Type.Array(DataCollectionSchema)),
})

export const SingleDataCollectionRecordSchema = Type.Object({
  links: linksSchema,
  datacollectionrecords: DataCollectionRecordsSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecords: MetaPagingSchema }),
  }),
})
export type SingleDataCollectionRecord = Static<
  typeof SingleDataCollectionRecordSchema
>
export const CSingleDataCollectionRecord = TypeCompiler.Compile(
  SingleDataCollectionRecordSchema,
)

export const dataCollectionRecordInnerSchema = Type.Object({
  id: Numeric(),
  canWrite: TrueFalseSchema,
  canDelete: TrueFalseSchema,
  links: Type.Object({
    action: Type.Union([Numeric(), Type.String()]),
    dataCollection: Type.Union([Numeric(), Type.String()]),
  }),
})
export type DataCollectionRecordInner = Static<
  typeof dataCollectionRecordInnerSchema
>

export const DataCollectionRecordSchema = Type.Object({
  links: linksSchema,
  datacollectionrecords: dataCollectionRecordInnerSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecords: MetaPagingSchema }),
  }),
})
export type DataCollectionRecord = Static<typeof DataCollectionRecordSchema>
export const CDataCollectionRecord = TypeCompiler.Compile(
  DataCollectionRecordSchema,
)

export const PagedDataCollectionRecordsSchema = Type.Object({
  links: linksSchema,
  datacollectionrecords: Type.Array(DataCollectionRecordsSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecords: MetaPagingSchema }),
  }),
})
export type PagedDataCollectionRecords = Static<
  typeof PagedDataCollectionRecordsSchema
>
export const CPagedDataCollectionRecords = TypeCompiler.Compile(
  PagedDataCollectionRecordsSchema,
)

export const UnknownDataCollectionRecordsSchema = Type.Object({
  links: linksSchema,
  datacollectionrecords: Type.Union([
    DataCollectionRecordsSchema,
    Type.Array(DataCollectionRecordsSchema),
  ]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecords: MetaPagingSchema }),
  }),
})
export type UnknownDataCollectionRecords = Static<
  typeof UnknownDataCollectionRecordsSchema
>
export const CUnknownDataCollectionRecords = TypeCompiler.Compile(
  UnknownDataCollectionRecordsSchema,
)
