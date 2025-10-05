import {
  type BtrConveyancer,
  BtrPostcodeConveyancerModel,
} from '@dbc-tech/johnny5-mongodb'

/**
 * Returns the conveyancer assigned to the given postcode.
 * @param postcode - AU postcode to look up (e.g. 4014)
 * @param tenant - Tenant key (e.g. 'BTR')
 */
export async function findConveyancerByPostcode(
  tenant: string,
  postcode: number,
): Promise<BtrConveyancer | null> {
  const postcodeDoc = await BtrPostcodeConveyancerModel.findOne({
    postcode,
    tenant,
  }).populate('conveyancerId') // will populate with BtrConveyancer

  if (!postcodeDoc) {
    return null
  }

  const conveyancer = postcodeDoc.conveyancerId as unknown as BtrConveyancer
  return conveyancer
}
