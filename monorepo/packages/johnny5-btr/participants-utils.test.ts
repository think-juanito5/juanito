import { describe, expect, it } from 'bun:test'
import {
  CouncilData as CD,
  WaterAuthority as WA,
  type WaterAuthorityId,
} from './constants'
import { getUnMatchedWaterAuthByCouncilId } from './participants-utils'

describe('utils > getUnMatchedWaterAuthByCouncilId', () => {
  const justRandomCouncilId = 123
  describe.each([
    [CD.brisbaneCityCouncil, WA.QueenslandUrbanUtilities],
    [CD.ipswichCityCouncil, WA.QueenslandUrbanUtilities],
    [CD.lockyerValleyRegionalCouncil, WA.QueenslandUrbanUtilities],
    [CD.moretonBayRegionalCouncil, WA.UnityWater],
    [CD.noosaShireCouncil, WA.UnityWater],
    [CD.scenicRimRegionalCouncil, WA.QueenslandUrbanUtilities],
    [CD.somersetRegionalCouncil, WA.QueenslandUrbanUtilities],
    [CD.sunshineCoastCouncil, WA.UnityWater],
    [211, undefined],
    [justRandomCouncilId, undefined],
    [3, undefined],
    [999, undefined],
    [0, undefined],
  ])('.getUnMatchedWaterAuthByCouncilId(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(getUnMatchedWaterAuthByCouncilId(input)).toEqual(
        expected as WaterAuthorityId,
      )
    })
  })
})
