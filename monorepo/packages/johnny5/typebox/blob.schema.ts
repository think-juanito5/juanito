import { type Static, Type } from '@sinclair/typebox'

export type BlobType = Static<typeof blobTypeSchema>
export const blobTypeSchema = Type.Union([Type.Literal('contract')])

export const AllBlobTypes: Array<BlobType> = ['contract']

export type Blob = Static<typeof blobSchema>
export const blobSchema = Type.Object({
  // The blob name
  name: Type.String(),
  // The blob type (should be union / enum)
  type: blobTypeSchema,
})
