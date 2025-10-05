import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ActionSchema } from './actions'
import { MetaPagingSchema, Nullable, Numeric, linksSchema } from './common'
import { ParticipantSchema } from './participants'

export const FileNoteLinksPostSchema = Type.Object({
  action: Type.String(),
  document: Type.Optional(Type.String()),
  participant: Type.Optional(Numeric()),
})
export type FileNoteLinksPost = Static<typeof FileNoteLinksPostSchema>

export const FileNoteLinksSchema = Type.Object({
  action: Type.String(),
  document: Nullable(Type.String()),
  participant: Nullable(Type.String()),
})
export type FileNoteLinks = Static<typeof FileNoteLinksSchema>

export const FileNoteSchema = Type.Object({
  id: Numeric(),
  enteredTimestamp: Type.String(),
  text: Type.String(),
  enteredBy: Type.String(),
  source: Type.String(),
  noteTimestamp: Type.String(),
  links: FileNoteLinksSchema,
})
export type FileNote = Static<typeof FileNoteSchema>

export const fileNotePostInnerSchema = Type.Object({
  text: Type.String(),
  links: FileNoteLinksPostSchema,
})
export type FileNotePostInner = Static<typeof fileNotePostInnerSchema>

export const FileNotePostSchema = Type.Object({
  filenotes: fileNotePostInnerSchema,
})
export type FileNotePost = Static<typeof FileNotePostSchema>

export const fileNotePostMultipleSchema = Type.Object({
  filenotes: Type.Array(fileNotePostInnerSchema),
})
export type FileNotePostMultiple = Static<typeof fileNotePostMultipleSchema>

const linkedSchema = Type.Object({
  actions: Type.Optional(Type.Array(ActionSchema)),
  participants: Type.Optional(Type.Array(ParticipantSchema)),
})

export const SingleFileNoteSchema = Type.Object({
  links: linksSchema,
  filenotes: FileNoteSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ filenotes: MetaPagingSchema }),
  }),
})
export type SingleFileNote = Static<typeof SingleFileNoteSchema>
export const CSingleFileNote = TypeCompiler.Compile(SingleFileNoteSchema)

export const PagedFileNotesSchema = Type.Object({
  links: linksSchema,
  filenotes: Type.Array(FileNoteSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ filenotes: MetaPagingSchema }),
  }),
})
export type PagedFileNotes = Static<typeof PagedFileNotesSchema>
export const CPagedFileNotes = TypeCompiler.Compile(PagedFileNotesSchema)

export const UnknownFileNotesSchema = Type.Object({
  links: linksSchema,
  filenotes: Type.Union([FileNoteSchema, Type.Array(FileNoteSchema)]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ filenotes: MetaPagingSchema }),
  }),
})
export type UnknownFileNotes = Static<typeof UnknownFileNotesSchema>
export const CUnknownFileNotes = TypeCompiler.Compile(UnknownFileNotesSchema)

export const FileNoteSchemav2 = Type.Object({
  id: Numeric(),
  enteredTimestamp: Type.String(),
  text: Type.String(),
  enteredBy: Type.String(),
  source: Type.String(),
  noteTimestamp: Type.String(),
  links: Type.Object({
    action: Type.String(),
    document: Nullable(Type.String()),
    participant: Nullable(Type.String()),
  }),
})
export type FileNotev2 = Static<typeof FileNoteSchemav2>

export const SingleFileNoteSchemav2 = Type.Object({
  links: linksSchema,
  filenotes: FileNoteSchemav2,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ filenotes: MetaPagingSchema }),
  }),
})
export type SingleFileNotev2 = Static<typeof SingleFileNoteSchemav2>
export const CSingleFileNotev2 = TypeCompiler.Compile(SingleFileNoteSchemav2)

export const FileNotePostSchemav2 = Type.Object({
  filenotes: Type.Object({
    text: Type.String(),
    links: Type.Object({
      action: Type.String(),
    }),
  }),
})
export type FileNotePostv2 = Static<typeof FileNotePostSchemav2>
