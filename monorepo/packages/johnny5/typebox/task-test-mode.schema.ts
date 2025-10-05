import { type Static, t } from 'elysia'

export type TaskTestMode = Static<typeof taskTestModeSchema>
export const taskTestModeSchema = t.Union([t.Literal('enabled')])

export const AllTaskTestModes: Array<TaskTestMode> = ['enabled']
