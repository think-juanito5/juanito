import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionFolderLinkSchema } from './actionfolders'
import { ActionSchema } from './actions'
import { MetaPagingSchema, Nullable, Numeric, linksSchema } from './common'
import { DocumentTemplateSchema } from './documenttemplates'
import { ParticipantSchema } from './participants'
import { TagSchema } from './tags'

export type LinkMatterDocumentPost = Static<typeof LinkMatterDocumentSchema>
export const LinkMatterDocumentSchema = Type.Object({
  actiondocuments: Type.Object({
    displayName: Type.String(),
    file: Type.String(),
    links: Type.Object({
      action: Type.String(),
      createdBy: Type.Optional(Type.String()),
      folder: Type.Optional(Type.String()),
    }),
  }),
})

export const DocumentLinksSchema = Type.Object({
  action: Type.String(),
  checkedOutBy: Nullable(Type.String()),
  folder: Nullable(Type.String()),
  createdBy: Type.String(),
  tags: Type.Array(Type.String()),
  documentTemplate: Nullable(Type.String()),
})

export const ActionDocumentLinksSchema = Type.Object({
  id: Numeric(),
  name: Type.String(),
  createdTimestamp: Type.String(),
  modifiedTimestamp: Type.String(),
  documentTimestamp: Nullable(Type.String()),
  status: Type.String(),
  keywords: Nullable(Type.String()),
  summary: Nullable(Type.String()),
  checkedOutTimestamp: Nullable(Type.String()),
  fileType: Nullable(Type.String()),
  checkedOutTo: Nullable(Type.String()),
  checkedOutEtaTimestamp: Nullable(Type.String()),
  fileSize: Numeric(),
  extension: Type.String(),
  sharepointUrl: Nullable(Type.String()),
  fileName: Type.String(),
  isDeleted: Type.Union([Type.Literal('T'), Type.Literal('F')]),
  file: Type.String(),
  links: DocumentLinksSchema,
})

const linkedSchema = Type.Object({
  actions: Type.Optional(Type.Array(ActionSchema)),
  participants: Type.Optional(Type.Array(ParticipantSchema)),
  actionfolders: Type.Optional(Type.Array(ActionFolderLinkSchema)),
  tags: Type.Optional(Type.Array(TagSchema)),
  documenttemplates: Type.Optional(Type.Array(DocumentTemplateSchema)),
})

export type SingleDocumentLinkMatterValue = Static<
  typeof SingleDocumentLinkMatterSchema
>
export const SingleDocumentLinkMatterSchema = Type.Object({
  links: linksSchema,
  actiondocuments: ActionDocumentLinksSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ actiondocuments: MetaPagingSchema }),
  }),
})
export const CSingleDocumentLinkMatterValue = TypeCompiler.Compile(
  SingleDocumentLinkMatterSchema,
)
