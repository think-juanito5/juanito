import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionSchema } from './actions'
import { MetaPagingSchema, Nullable, Numeric, linksSchema } from './common'
import { DataCollectionFieldsSchema } from './datacollectionfields'
import { dataCollectionRecordInnerSchema } from './datacollectionrecords'
import { DataCollectionSchema } from './datacollections'

export type DataCollectionRecordValueLinks = Static<
  typeof DataCollectionRecordValueLinksSchema
>
export const DataCollectionRecordValueLinksSchema = Type.Object({
  action: Type.String(),
  dataCollectionField: Type.String(),
  dataCollectionRecord: Type.String(),
  dataCollection: Type.String(),
})

export type DataCollectionRecordValue = Static<
  typeof DataCollectionRecordValueSchema
>
export const DataCollectionRecordValueSchema = Type.Object({
  id: Type.String(),
  stringValue: Nullable(Type.String()),
  last_modified_time_stamp: Nullable(Type.String()),
  last_modified_by_user_id: Nullable(Numeric()),
  links: DataCollectionRecordValueLinksSchema,
})

export const dataCollectionRecordValuePutPostInnerSchema = Type.Object({
  id: Type.String(),
  stringValue: Nullable(Type.String()),
  links: DataCollectionRecordValueLinksSchema,
})
export type DataCollectionRecordValuePutPostInner = Static<
  typeof dataCollectionRecordValuePutPostInnerSchema
>

export type DataCollectionRecordValuePost = Static<
  typeof DataCollectionRecordValuePostSchema
>
export const DataCollectionRecordValuePostSchema = Type.Object({
  datacollectionrecordvalues: dataCollectionRecordValuePutPostInnerSchema,
})

export type DataCollectionRecordValuePut = Static<
  typeof DataCollectionRecordValuePutSchema
>
export const DataCollectionRecordValuePutSchema = Type.Object({
  datacollectionrecordvalues: dataCollectionRecordValuePutPostInnerSchema,
})

export type DataCollectionRecordValuesPut = Static<
  typeof DataCollectionRecordValuesPutSchema
>
export const DataCollectionRecordValuesPutSchema = Type.Object({
  datacollectionrecordvalues: Type.Array(
    dataCollectionRecordValuePutPostInnerSchema,
  ),
})

const linkedSchema = Type.Object({
  actions: Type.Optional(Type.Array(ActionSchema)),
  datacollections: Type.Optional(Type.Array(DataCollectionSchema)),
  datacollectionrecords: Type.Optional(
    Type.Array(dataCollectionRecordInnerSchema),
  ),
  datacollectionfields: Type.Optional(Type.Array(DataCollectionFieldsSchema)),
})

export type SingleDataCollectionRecordValue = Static<
  typeof SingleDataCollectionRecordValueSchema
>
export const SingleDataCollectionRecordValueSchema = Type.Object({
  links: linksSchema,
  datacollectionrecordvalues: DataCollectionRecordValueSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecordvalues: MetaPagingSchema }),
  }),
})
export const CSingleDataCollectionRecordValue = TypeCompiler.Compile(
  SingleDataCollectionRecordValueSchema,
)

export type PagedDataCollectionRecordValues = Static<
  typeof PagedDataCollectionRecordValuesSchema
>
export const PagedDataCollectionRecordValuesSchema = Type.Object({
  links: linksSchema,
  datacollectionrecordvalues: Type.Array(DataCollectionRecordValueSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecordvalues: MetaPagingSchema }),
  }),
})
export const CPagedDataCollectionRecordValues = TypeCompiler.Compile(
  PagedDataCollectionRecordValuesSchema,
)

export type UnknownDataCollectionRecordValues = Static<
  typeof UnknownDataCollectionRecordValuesSchema
>
export const UnknownDataCollectionRecordValuesSchema = Type.Object({
  links: linksSchema,
  datacollectionrecordvalues: Type.Union([
    DataCollectionRecordValueSchema,
    Type.Array(DataCollectionRecordValueSchema),
  ]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecordvalues: MetaPagingSchema }),
  }),
})
export const CUnknownDataCollectionRecordValues = TypeCompiler.Compile(
  UnknownDataCollectionRecordValuesSchema,
)

export const DataCollectionRecordValueMetaSchema = Type.Object({
  paging: Type.Object({
    datacollectionrecordvalues: Type.Object({
      recordCount: Numeric(),
      pageCount: Numeric(),
      page: Numeric(),
      pageSize: Numeric(),
      prevPage: Nullable(Type.String()),
      nextPage: Nullable(Type.String()),
    }),
  }),
  debug: Type.Optional(Type.Object({})),
})

export type PagedDataCollectionRecordValuesv2 = Static<
  typeof PagedDataCollectionRecordValuesSchemav2
>
export const PagedDataCollectionRecordValuesSchemav2 = Type.Object({
  links: linksSchema,
  datacollectionrecordvalues: Type.Array(
    Type.Object({
      id: Type.String(),
      stringValue: Nullable(Type.String()),
      last_modified_time_stamp: Nullable(Type.String()),
      last_modified_by_user_id: Nullable(Numeric()),
      links: Type.Object({
        action: Type.String(),
        dataCollectionField: Type.String(),
        dataCollectionRecord: Type.String(),
        dataCollection: Type.String(),
      }),
    }),
  ),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecordvalues: MetaPagingSchema }),
  }),
})

export const CPagedDataCollectionRecordValuesv2 = TypeCompiler.Compile(
  PagedDataCollectionRecordValuesSchemav2,
)

//--------------------------------------------------------------------------
export type SingleDataCollectionRecordValuev2 = Static<
  typeof SingleDataCollectionRecordValueSchemav2
>
export const SingleDataCollectionRecordValueSchemav2 = Type.Object({
  links: linksSchema,
  datacollectionrecordvalues: Type.Object({
    id: Type.String(),
    stringValue: Nullable(Type.String()),
    last_modified_time_stamp: Nullable(Type.String()),
    last_modified_by_user_id: Nullable(Numeric()),
    links: Type.Object({
      action: Type.String(),
      dataCollectionField: Type.String(),
      dataCollectionRecord: Type.String(),
      dataCollection: Type.String(),
    }),
  }),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ datacollectionrecordvalues: MetaPagingSchema }),
  }),
})
export const CSingleDataCollectionRecordValuev2 = TypeCompiler.Compile(
  SingleDataCollectionRecordValueSchemav2,
)

//--------------------------------------------------------------------------
export type DataCollectionRecordValuePutv2 = Static<
  typeof DataCollectionRecordValuePutSchemav2
>
export const DataCollectionRecordValuePutSchemav2 = Type.Object({
  datacollectionrecordvalues: Type.Object({
    stringValue: Nullable(Type.String()),
    links: Type.Object({
      action: Type.String(),
      dataCollectionField: Type.String(),
      dataCollectionRecord: Type.String(),
      dataCollection: Type.String(),
    }),
  }),
})
