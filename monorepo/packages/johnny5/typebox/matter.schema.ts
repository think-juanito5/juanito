import { type Static, Type } from '@sinclair/typebox'

export type MatterStatus = Static<typeof matterStatusSchema>
export const matterStatusSchema = Type.Union([
  Type.Literal('closed'),
  Type.Literal('closing'),
  Type.Literal('created'),
  Type.Literal('error-processing'),
  Type.Literal('populated'),
])

export const AllMatterStatus: Array<MatterStatus> = [
  'closed',
  'closing',
  'created',
  'error-processing',
  'populated',
]

export type MatterId = Static<typeof matterIdSchema>
export const matterIdSchema = Type.Object({
  // The Matter Id
  number: Type.Number(),
  // The Matter status
  status: matterStatusSchema,
})

export type MatterClose = Static<typeof matterCloseSchema>
export const matterCloseSchema = Type.Object({
  closureReason: Type.String(),
})

export type MatterDeactivation = Static<typeof matterDeactivationSchema>
export const matterDeactivationSchema = Type.Object({
  deactivationReason: Type.String(),
})

export type MatterReactivation = Static<typeof matterReactivationSchema>
export const matterReactivationSchema = Type.Object({
  reactivationReason: Type.String(),
})

export type MatterDetails = Static<typeof matterDetailsSchema>
export const matterDetailsSchema = Type.Object({
  matterId: Type.Number(),
  status: Type.Union([Type.String(), Type.Null()]),
})
