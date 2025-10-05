import type { PricingFees } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbPricingFees } from '../schema'

export const mapPricingFees = (
  pricingFees: FlattenMaps<DbPricingFees> & { _id: Types.ObjectId },
): PricingFees => {
  const { _id, ...rest } = pricingFees
  return {
    ...rest,
    id: _id.toString(),
  }
}
