import { type Static, Type } from '@sinclair/typebox'

export const documentUploadSchema = Type.Object({
  matterId: Type.Number(),
  parentFolder: Type.Optional(Type.String()),
  folder: Type.String(),
  filename: Type.String(),
  bloburl: Type.String(),
})
export type DocumentUpload = Static<typeof documentUploadSchema>
