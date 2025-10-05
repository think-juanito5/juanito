import {
  Nullable,
  dataCollectionRecordValuePutPostInnerSchema,
} from '@dbc-tech/actionstep'
import {
  idStringSchema,
  matterCreateFileNoteSchema,
  tenantSchema,
} from '@dbc-tech/johnny5'
import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from 'elysia/type-system'

export const hypercareSchema = Type.Object({
  hypercare_identified_date: Type.String(),
  reason_for_hypercare: Type.String(),
  other: Type.Optional(Type.String()),
  requirements_lawyer_comments: Type.Optional(Type.String()),
  follow_up_date: Type.Optional(Type.String()),
  other_side_relationship: Type.Optional(Type.String()),
})
export type Hypercare = Static<typeof hypercareSchema>

export const createTaskSchema = Type.Object({
  name: Type.String(),
  description: Type.String(),
  status: Type.Literal('Incomplete'),
  dueTimestamp: Type.String(),
  links: Type.Object({
    action: Type.String(),
    assignee: Type.Number(),
  }),
})
export type CreateTask = Static<typeof createTaskSchema>

export const completeTaskSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  status: Type.Literal('Complete'),
  completedTimestamp: Type.String(),
  links: Type.Object({
    action: Type.String(),
    assignee: Type.String(),
  }),
})
export type CompleteTask = Static<typeof completeTaskSchema>

export const datafieldCreateSchema = Type.Object({
  stringValue: Type.String(),
  links: Type.Object({
    action: Type.String(),
    dataCollection: Type.String(),
    dataCollectionField: Type.String(),
  }),
})
export type DatafieldCreate = Static<typeof datafieldCreateSchema>

export const bespokeTasksDataFieldsSchema = Type.Object({
  create: Type.Array(datafieldCreateSchema),
  update: Type.Array(dataCollectionRecordValuePutPostInnerSchema),
})
export type BespokeTasksDataFields = Static<typeof bespokeTasksDataFieldsSchema>

export const bespokeTasksFilesSchema = Type.Object({
  url: Nullable(Type.String()),
  rename: Type.String(),
  folder: Type.Number(),
  parentFolder: Nullable(Type.String()),
  isMissing: Type.Boolean(),
})
export type BespokeTasksFiles = Static<typeof bespokeTasksFilesSchema>

export const bespokeTasksEmailSchema = Type.Object({
  to: Type.String(),
  subject: Type.String(),
  body: Type.String(),
})
export type BespokeTasksEmail = Static<typeof bespokeTasksEmailSchema>

export const bespokeTasksManifestSchema = Type.Object({
  tenant: tenantSchema,
  job: idStringSchema,
  createTasks: Type.Array(createTaskSchema),
  completeTasks: Type.Array(completeTaskSchema),
  datafields: bespokeTasksDataFieldsSchema,
  files: Type.Array(bespokeTasksFilesSchema),
  filenotes: Type.Array(matterCreateFileNoteSchema),
  emails: Type.Array(bespokeTasksEmailSchema),
})
export type BespokeTasksManifest = Static<typeof bespokeTasksManifestSchema>
export const CBespokeTasksManifest = TypeCompiler.Compile(
  bespokeTasksManifestSchema,
)
