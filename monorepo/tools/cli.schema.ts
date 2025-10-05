import { type Static, Type } from '@sinclair/typebox'
import { serviceBusSchema } from './sb/sb.schema'

export type CliConfig = Static<typeof CliConfigSchema>
export const CliConfigSchema = Type.Object({
  serviceBus: Type.Optional(serviceBusSchema),
})
