import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Nullable, linksSchema } from './common'

export type ActionInitParam = Static<typeof ActionCreatePostSchema>
export type ActionCreatePost = Static<typeof ActionCreatePostSchema>
export const ActionCreatePostSchema = Type.Object({
  actioncreate: Type.Object({
    actionName: Type.String(),
    fileReference: Type.Optional(Nullable(Type.String())),
    priority: Type.Optional(Type.String()),
    assignedToParticipant: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    timestamp: Type.Optional(Type.String()),
    fileNote: Type.Optional(Type.String()),
    links: Type.Object({
      actionType: Type.Number(),
      stepTasks: Type.Optional(Nullable(Type.Array(Type.Number()))),
      documentTemplates: Type.Optional(Nullable(Type.Array(Type.Number()))),
      stepMessages: Type.Optional(Nullable(Type.Array(Type.Number()))),
      trustAccounts: Type.Optional(Type.Array(Type.String())),
    }),
  }),
})
const ActionCreateInnerLinksSchema = Type.Object({
  assignedTo: Nullable(Type.String()),
  division: Nullable(Type.String()),
  actionType: Type.String(),
  primaryParticipants: Nullable(Type.Array(Type.String())),
})

const ActionCreateInsideSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  reference: Nullable(Type.String()),
  priority: Type.Number(),
  status: Type.String(),
  statusTimestamp: Nullable(Type.String()),
  isBillableOverride: Nullable(Type.String()),
  createdTimestamp: Nullable(Type.String()),
  modifiedTimestamp: Nullable(Type.String()),
  isDeleted: Nullable(Type.String()),
  deletedBy: Nullable(Type.String()),
  deletedTimestamp: Nullable(Type.String()),
  isFavorite: Nullable(Type.String()),
  links: ActionCreateInnerLinksSchema,
})

export const ActionCreateSchema = Type.Object({
  links: linksSchema,
  actioncreate: ActionCreateInsideSchema,
})
export type ActionCreate = Static<typeof ActionCreateSchema>
export const CActionCreate = TypeCompiler.Compile(ActionCreateSchema)
