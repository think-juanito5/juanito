import { type Static, Type } from '@sinclair/typebox'
import { Numeric } from './common'

export type DocumentTemplate = Static<typeof DocumentTemplateSchema>
export const DocumentTemplateSchema = Type.Object({
  id: Numeric(),
  templateType: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  fileName: Type.Optional(Type.String()),
  directory: Type.Optional(Type.String()),
  fileSize: Type.Optional(Numeric()),
  createdTimestamp: Type.Optional(Type.String()),
  modifiedTimestamp: Type.Optional(Type.String()),
  oldNfsPath: Type.Optional(Type.String()),
  documentIdentifier: Type.Optional(Type.String()),
  currentVersion: Type.Optional(Type.String()),
  installedVersion: Type.Optional(Type.String()),
  lasCheckinTimestamp: Type.Optional(Type.String()),
  generatedCount: Type.Optional(Type.String()),
  links: Type.Object({
    actionType: Type.Optional(Type.String()),
    createdBy: Type.Optional(Type.String()),
    actionTypeFolder: Type.Optional(Type.String()),
    modifiedBy: Type.Optional(Type.String()),
  }),
})
