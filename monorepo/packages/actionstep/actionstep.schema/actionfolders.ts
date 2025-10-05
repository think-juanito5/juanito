import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionSchema } from './actions'
import { MetaPagingSchema, Nullable, linksSchema } from './common'

export type ActionFolderLink = Static<typeof ActionFolderLinkSchema>
export const ActionFolderLinkSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  links: Type.Object({
    action: Type.String(),
    parentFolder: Nullable(Type.String()),
  }),
})

const linkedSchema = Type.Object({
  actions: Type.Optional(Type.Array(ActionSchema)),
})

export const SingleActionDocumentFolderSchema = Type.Object({
  links: linksSchema,
  actionfolders: ActionFolderLinkSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ actionfolders: MetaPagingSchema }),
  }),
})
export type SingleActionDocumentFolder = Static<
  typeof SingleActionDocumentFolderSchema
>
export const CSingleActionDocumentFolder = TypeCompiler.Compile(
  SingleActionDocumentFolderSchema,
)

export const PagedActionDocumentFolderSchema = Type.Object({
  links: linksSchema,
  actionfolders: Type.Array(ActionFolderLinkSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ actionfolders: MetaPagingSchema }),
  }),
})
export type PagedActionDocumentFolder = Static<
  typeof PagedActionDocumentFolderSchema
>
export const CPagedActionDocumentFolder = TypeCompiler.Compile(
  PagedActionDocumentFolderSchema,
)

export const unknownActionFoldersSchema = Type.Object({
  links: linksSchema,
  actionfolders: Type.Union([
    Type.Array(ActionFolderLinkSchema),
    ActionFolderLinkSchema,
  ]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ actionfolders: MetaPagingSchema }),
  }),
})
export type UnknownActionFolders = Static<typeof unknownActionFoldersSchema>
export const CUnknownActionFolders = TypeCompiler.Compile(
  unknownActionFoldersSchema,
)
