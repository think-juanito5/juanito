import type { Participant } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbParticipant } from '../schema'

export const mapRefdataParticipant = (
  refdata: FlattenMaps<DbParticipant> & { _id: Types.ObjectId },
): Participant => {
  const { _id, ...rest } = refdata
  return {
    ...rest,
    id: refdata._id.toString(),
  }
}
