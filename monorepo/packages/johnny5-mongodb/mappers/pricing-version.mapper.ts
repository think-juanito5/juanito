import type { PricingVersion } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbPricingVersion } from '../schema'

export const mapPricingVersion = (
  pricingVersion: FlattenMaps<DbPricingVersion> & { _id: Types.ObjectId },
): PricingVersion => {
  const { _id, ...rest } = pricingVersion
  return {
    ...rest,
    activeOn: pricingVersion.activeOn.toISOString(),
    id: _id.toString(),
  }
}
