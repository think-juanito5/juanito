import type { RefdataConfig } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbJohnny5Config } from '../schema'

export const mapJohnny5Config = (
  config: FlattenMaps<DbJohnny5Config> & { _id: Types.ObjectId },
): RefdataConfig => {
  const { _id, ...rest } = config
  return {
    ...rest,
    id: config._id.toString(),
  }
}
