import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Nullable } from '../actionstep.enhanced.schema'

export const resthookEvents = [
  'ActionCreated',
  'ActionUpdated',
  'ActionDocumentCreated',
  'ActionDocumentUpdated',
  'ActionDocumentDeleted',
  'ActionParticipantAdded',
  'ActionParticipantDeleted',
  'DataCollectionRecordUpdated',
  'DataCollectionRecordDeleted',
  'DataCollectionRecordValueUpdated',
  'DisbursementCreated',
  'DisbursementUpdated',
  'FileNoteCreated',
  'FileNoteUpdated',
  'ParticipantCreated',
  'ParticipantUpdated',
  'StepChanged',
  'TaskCreated',
  'TaskUpdated',
  'TimeEntryCreated',
  'TimeEntryUpdated',
]

const resthookSchema = Type.Object({
  id: Type.Number(),
  eventName: Type.String(),
  targetUrl: Type.String(),
  status: Type.String(),
  triggeredCount: Type.Number(),
  triggeredLastTimestamp: Nullable(Type.String()),
})

export const singleResthookSchema = Type.Object({
  resthooks: resthookSchema,
})
export type SingleResthook = Static<typeof singleResthookSchema>
export const CSingleResthook = TypeCompiler.Compile(singleResthookSchema)

export const resthooksSchema = Type.Object({
  resthooks: Type.Array(resthookSchema),
})
export type Resthooks = Static<typeof resthooksSchema>
export const CResthooks = TypeCompiler.Compile(resthooksSchema)

export const CUnknownResthook = TypeCompiler.Compile(
  Type.Object({
    resthooks: Type.Union([resthookSchema, Type.Array(resthookSchema)]),
  }),
)

const resthookPutPostInnerSchema = Type.Object({
  eventName: Type.String(),
  targetUrl: Type.String(),
  status: Type.String(),
})

export const resthookPutPostSchema = Type.Object({
  resthooks: Type.Union([
    resthookPutPostInnerSchema,
    Type.Array(resthookPutPostInnerSchema),
  ]),
})
export type ResthookPutPost = Static<typeof resthookPutPostSchema>
export const CResthookPutPost = TypeCompiler.Compile(resthookPutPostSchema)
