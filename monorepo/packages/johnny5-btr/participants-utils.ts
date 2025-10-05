import {
  UnMatchedCouncilWaterAuthorityMapping,
  type WaterAuthorityId,
} from './constants'

export function getUnMatchedWaterAuthByCouncilId(
  councilId: number,
): WaterAuthorityId | undefined {
  return UnMatchedCouncilWaterAuthorityMapping[councilId] || undefined
}
