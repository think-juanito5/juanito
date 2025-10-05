import type { Quote } from '@dbc-tech/johnny5/typebox'
import type { FlattenMaps, Types } from 'mongoose'
import type { DbCcaRaq, DbQuote } from '../schema'
import { mapRaq } from './raq.mapper'

export const mapQuote = (
  quote: FlattenMaps<DbQuote> & { _id: Types.ObjectId },
  raq?: FlattenMaps<DbCcaRaq> & { _id: Types.ObjectId },
): Quote => {
  const { _id, ...rest } = quote
  return {
    ...rest,
    fileId: quote.fileId.toString(),
    pricingId: quote.pricingId?.toString(),
    createdOn: quote.createdOn.toISOString(),
    completedOn: quote.completedOn?.toISOString(),
    id: _id.toString(),
    raq: raq ? mapRaq(raq) : undefined,
  }
}
