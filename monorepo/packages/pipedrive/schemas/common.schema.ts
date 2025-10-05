import { type Static, Type } from '@sinclair/typebox'
import { PipedriveAdditionalInfo } from '../constants'

export const pipedriveAdditionalInfoSchema = Type.Union(
  Object.values(PipedriveAdditionalInfo).map((val) => Type.Literal(val)),
)
export type PipedriveAdditionalInfoType = Static<
  typeof pipedriveAdditionalInfoSchema
>
