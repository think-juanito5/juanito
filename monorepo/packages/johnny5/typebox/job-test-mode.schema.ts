import { type Static, t } from 'elysia'

export type JobTestMode = Static<typeof jobTestModeSchema>
export const jobTestModeSchema = t.Union([
  t.Literal('enabled'),
  t.Literal('ignore-deal'),
])

export const AllJobTestModes: Array<JobTestMode> = ['enabled', 'ignore-deal']
