import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from 'elysia/type-system'

export const DocumentUploadSchema = Type.Object({
  files: Type.Object({
    id: Type.String(),
    status: Type.String(),
  }),
})
export type SingleDocumentValue = Static<typeof DocumentUploadSchema>
export const CSingleDocumentValue = TypeCompiler.Compile(DocumentUploadSchema)
