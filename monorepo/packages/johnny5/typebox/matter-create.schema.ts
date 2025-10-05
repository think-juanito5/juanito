import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { tenantSchema } from './common.schema'
import { manifestMetaSchema } from './manifest-meta.schema'

export type MatterCreateBasics = Static<typeof matterCreateBasicsSchema>
export const matterCreateBasicsSchema = Type.Object({
  name: Type.String(),
  matter_type_id: Type.Number(),
  reference: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
})

export type MatterCreateExistingParticipant = Static<
  typeof matterCreateExistingParticipantSchema
>
export const matterCreateExistingParticipantSchema = Type.Object({
  id: Type.Number(),
  type_id: Type.Number(),
  description: Type.String(),
})

export type MatterCreateDetailPhone = Static<
  typeof matterCreateDetailsPhoneSchema
>
export const matterCreateDetailsPhoneSchema = Type.Object({
  number: Type.String(),
  label: Type.Optional(Type.String()),
})

export type MatterCreateDetailAddress = Static<
  typeof matterCreateDetailsAddressSchema
>
export const matterCreateDetailsAddressSchema = Type.Object({
  type: Type.Union([Type.Literal('physical'), Type.Literal('mailing')]),
  line1: Type.Optional(Type.String()),
  line2: Type.Optional(Type.String()),
  suburb: Type.Optional(Type.String()),
  state: Type.Optional(Type.String()),
  postcode: Type.Optional(Type.String()),
})

export type MatterCreateNewParticipantDetails = Static<
  typeof matterCreateNewParticipantDetailsSchema
>
const matterCreateNewParticipantDetailsSchema = Type.Object({
  is_company: Type.Boolean(),
  company_name: Type.Optional(Type.String()),
  salutation: Type.Optional(Type.String()),
  first_name: Type.Optional(Type.String()),
  middle_name: Type.Optional(Type.String()),
  last_name: Type.Optional(Type.String()),
  suffix: Type.Optional(Type.String()),
  preffered_name: Type.Optional(Type.String()),
  addresses: Type.Optional(Type.Array(matterCreateDetailsAddressSchema)),
  phones_numbers: Type.Optional(Type.Array(matterCreateDetailsPhoneSchema)),
  email_address: Type.Optional(Type.String()),
})

export type MatterCreateNewParticipant = Static<
  typeof matterCreateNewParticipantSchema
>
export const matterCreateNewParticipantSchema = Type.Object({
  type_id: Type.Number(),
  description: Type.Optional(Type.String()),
  details: matterCreateNewParticipantDetailsSchema,
})

export type MatterCreateLinkToParticipant = Static<
  typeof matterCreateLinkMatterSchema
>
export const matterCreateLinkMatterSchema = Type.Object({
  target_type_id: Type.Number(),
  source_type_id: Type.Optional(Type.Number()),
  participant_id: Type.Optional(Type.Number()),
})

export type MatterCreateParticipants = Static<
  typeof matterCreateParticipantsSchema
>
export const matterCreateParticipantsSchema = Type.Object({
  existing: Type.Optional(Type.Array(matterCreateExistingParticipantSchema)),
  new: Type.Optional(Type.Array(matterCreateNewParticipantSchema)),
  link_matter: Type.Optional(Type.Array(matterCreateLinkMatterSchema)),
})

export type MatterCreateCreateDataCollection = Static<
  typeof matterCreateCreateDataCollectionSchema
>
export const matterCreateCreateDataCollectionSchema = Type.Object({
  field_name: Type.String(),
  description: Type.Optional(Type.String()),
  value: Type.String(),
})

export type MatterCreateDataCollections = Static<
  typeof matterCreateDataCollectionsSchema
>
export const matterCreateDataCollectionsSchema = Type.Object({
  prepare: Type.Record(Type.String(), Type.Number()),
  create: Type.Array(matterCreateCreateDataCollectionSchema),
})

export type MatterCreateFileNote = Static<typeof matterCreateFileNoteSchema>
export const matterCreateFileNoteSchema = Type.Object({
  note: Type.String(),
})

export type MatterCreateTask = Static<typeof matterCreateTaskSchema>
export const matterCreateTaskSchema = Type.Object({
  assignee_id: Type.Number(),
  name: Type.String(),
  description: Type.String(),
})

export type MatterCreateFile = Static<typeof matterCreateFileSchema>
export const matterCreateFileSchema = Type.Object({
  filename: Type.String(),
  url: Type.String(),
})

export type MatterCreateStep = Static<typeof matterCreateStepsSchema>
export const matterCreateStepsSchema = Type.Object({
  ready: Type.Optional(Type.Number()),
})

export type MatterManifestMeta = Static<typeof manifestMetaSchema>

export type MatterManifest = Static<typeof matterManifestSchema>
export const matterManifestSchema = Type.Object({
  participants: matterCreateParticipantsSchema,
  data_collections: matterCreateDataCollectionsSchema,
  filenotes: Type.Optional(Type.Array(matterCreateFileNoteSchema)),
  tasks: Type.Optional(Type.Array(matterCreateTaskSchema)),
  files: Type.Optional(Type.Array(matterCreateFileSchema)),
  steps: Type.Optional(matterCreateStepsSchema),
  meta: Type.Optional(Type.Array(manifestMetaSchema)),
})

export type Issues = Static<typeof issuesSchema>
export const issuesSchema = Type.Object({
  description: Type.String(),
  log: Type.Optional(Type.String()),
  meta: Type.Optional(Type.Array(Type.String())),
})

export type MatterCreateResponse = Static<typeof matterCreateResponseSchema>
export const matterCreateResponseSchema = Type.Object({
  matterId: Type.Number(),
})

export const CMatterCreateResponse = TypeCompiler.Compile(
  matterCreateResponseSchema,
)

export type MatterCreateStatus = Static<typeof matterCreateStatusSchema>
export const matterCreateStatusSchema = Type.Union([
  Type.Literal('basics'),
  Type.Literal('participants'),
  Type.Literal('data-collections'),
  Type.Literal('filenotes'),
  Type.Literal('tasks'),
  Type.Literal('files'),
  Type.Literal('stepchange'),
  Type.Literal('completed'),
])

export const AllMatterCreateStatus: Array<MatterCreateStatus> = [
  'basics',
  'participants',
  'data-collections',
  'filenotes',
  'tasks',
  'files',
  'stepchange',
  'completed',
]

export type MatterCreate = Static<typeof matterCreateSchema>
export const matterCreateSchema = Type.Object({
  // The unique identifier for Matter Create
  id: Type.String(),
  tenant: tenantSchema,
  fileId: Type.String(),
  jobId: Type.String(),
  status: matterCreateStatusSchema,
  matterId: Type.Optional(Type.Number()),
  manifest: matterManifestSchema,
  issues: Type.Optional(Type.Array(issuesSchema)),
  errorReason: Type.Optional(Type.String()),
  createdOn: Type.Date(),
  completedOn: Type.Optional(Type.Date()),
  erroredOn: Type.Optional(Type.Date()),
})
