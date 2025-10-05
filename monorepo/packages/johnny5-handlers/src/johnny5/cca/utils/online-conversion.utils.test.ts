import { describe, expect, it } from 'bun:test'
import type { V2Deal } from '@dbc-tech/pipedrive'
import { OnlineConversionTypes } from '../constants'
import {
  checkOnlineConversion,
  getOnlineConversionType,
} from './online-conversion.utils'

describe('checkOnlineConversion', () => {
  const mockV2DealCustomFields: V2Deal = {
    success: true,
    data: {
      id: 414118,
      title: 'Probenswocleadprodtwo Do Not Move The Deal_NSW',
      creator_user_id: 2901792,
      value: 0.0,
      person_id: 381211,
      org_id: null,
      stage_id: 6,
      currency: 'AUD',
      add_time: '2024-08-06T01:17:28Z',
      update_time: '2025-04-08T15:54:55Z',
      status: 'won',
      probability: null,
      lost_reason: null,
      visible_to: 3,
      close_time: '2025-04-08T14:35:27Z',
      pipeline_id: 1,
      won_time: '2025-04-08T14:35:27Z',
      lost_time: null,
      stage_change_time: '2025-04-08T14:35:27Z',
      local_won_date: '2025-04-08',
      local_lost_date: null,
      local_close_date: '2025-04-08',
      expected_close_date: null,
      custom_fields: {
        d158717bdfff0a742fe0a4670631edd2f0c70864: 401,
        '0c0637325ba013d60d119ff415d50fd6c2dd3b06': 411,
        '3b1aa5bdc46fbf35bfdd71fcc5998d7840c417a8': '321',
        '3997f0d4eb2c37db2d0bce3d309d3bdf6c9add9b': '111',
        '8da7a98863d5dd86cd6cd54a4fd46b859cc7b3fa': 'Margallo',
        d0da6921c9ce3a945ca85d4444010d853b422f7b: 'Ave',
        f2ea1652bb0ee75470a045d615a3f28783479502: 'Sydney',
        a6170b0ef59b625144a0296f34888541cbb41d86: '2211',
        '415157dbc97375a775fc1f28219a816ca52b9ca6': 13,
        '32a26829a091f3b91608edac353d72af483ce188': 2,
        af0c8bd753301f888695cfb36416dd40d9aaa0b3: 21,
        '511d677f54b4bce8b0d44f0f14758f85a9ff2b22': null,
        '4b983e49f9a4ca07e164a1318f65e8914e1fb491': '+61418733463',
        '596cb96595ed1561da74322039f45a4711f793d8': {
          value: 1049,
          currency: 'AUD',
        },
        cfca41c333c19b539f3acf76d89df7790d5b6f56: {
          value: 250,
          currency: 'AUD',
        },
        a0eeb4a6c342df9290046e1d42055b3214309ca0: null,
        '70f2b2b994225e3bd1e107bc33819bbe2ae2b21f': {
          value: 299,
          currency: 'AUD',
        },
        '191322d3f05a278eb337c08dd08aef13eb2625cb': null,
        f1122a434a9a8adf869714cf947464c56f2aec22: null,
        '23bf3fad424e7c0bd3d1508b8c94862a1804a35f': null,
        '405427b2fe4ab0809e258b370e9323db6e50d172':
          'TEST-NSW-SEL-CG-TA-DEA01-14672588',
        '415b15c7c0cc062d5cd1ce109c34cd03367a39be': null,
        f85f28cc7089652fb3db1f9a187cc17b06c2d178: null,
        '7ca6a59de28fbabbdb1ce17972e61d633a12eead': null,
        '1c226f725db43faedd2db184dfb2309548abe33a': null,
        f47d943aa2844859db1526047479b1d6f4b7088c: 184,
        '2cbf5818583cd73da23245313ce0b4d0c0dda9db': null,
        '282d149d1c4c18ac8a0eeb95bf87c13152acb7a9': null,
        c44f3ddd4fb77a5accc3c9395b2b18627fb3da3b: null,
        d5ce59904c058913fbec6c0267736b35d610758d: null,
        c4b2d35f542630d9a73dea2a6c075aedd9b4c59b: null,
        '43c3b066abecec155c7ab8f0b0ad8349866274dd': 425,
        d33850bb61d3142a9132dae8fd370a754efc6932: 427,
        d254c3d57f197349f3bf72f402d708dad577be5b: '',
        d02ed568108fd1a20b8d70dcfc16812a250240b4: '',
        '8b26678b35710cf28456813fbf51665d6fba75b7': '',
        d8bbfeda55bd5a67d0212c84e86ba3168ddcf225: 'Online Conversion',
        df1f8861ddb362786a9c96414fa90c6c34d32a90: null,
        f30a200a4265ee41153fdff4ee719fac727a7a0b: null,
        ed2343ee607956dbab20aa5fac3a3221c3ab42bb: null,
        '2ae4b2c99bd7f8f920efbfe8238f9762f7a17053': null,
        '100ce3caa42ad54d8d18cdc7db29fb85d5a5f7d0': 'Auto Dial',
        '607538c553cfdfb0f2fe07f6421035c748ae9021': null,
        '0cae48d9ce0cde6d3a1ecbdeba935b84581ca80e': null,
        c33bffc1cc27bdb2389020cf45a813eac27d3f3e: null,
        '663ab8642d7b35bc597c5a81673274afd5ca1cb6': '',
        bfac60cdc63301fc511a23bce96f1b7eb50a4cc9:
          'https://www.conveyancing.com.au/',
        '45f32b948f238b122a78f12a38effad3825a4150': null,
        '7561f6d2921dfac7b24c0fffe89578054cd8ae72': null,
        dd6ca6ce22aa22a66a64ee3b7475763168498536: null,
        '8922b10191991c0b9c4dc3f5f4043ff8cab0d6d9': null,
        '0d313d8379b096aeebafbe671553a9fe3789867f': null,
        '2a340fa55d18234d1352917ed819f5baaf388459': null,
        '3d6543cec52704b26b5f679c1cca3bf5207f842b': null,
        '386c00f05839aefbe206a4ac107a3b5687dc83a4': null,
        c3115c3f3dcd404731008794824f6fdb84f79761: null,
        '63fc1b787260eff28a2d738bc5ab9b8a68232345': '?r=NDE0MTE4',
        '6ec1c4d3f6765c41cc71a1fafb19b0d6ee5cd13f': 'RAQ',
        ccefac7bd052f7559d997641fe0286cd9d961c59: null,
        '9ff452b30289d9693690f87b9fa14642129b1f47': null,
        '755f373792729b55495dda89f420618c8c6d1bcf': null,
        '761c0a0fbc9bd6321ca1b800fb04f60cbdb9b110': null,
        a8b1f14330f7bde695afc9505efe4be39739c951: null,
        c00b37d4417143b7917df74acf0089d41b1a3698: null,
        becd21ef4da25658d9888473bf074b9836c17127: null,
        '2d296de3afdeac2da2cbe11bcf621dfc117af11e': null,
        f336e5208d80d4f2c15838112cfe14eb58ea0249: null,
        e15289ee07f91488d56225bc574b1ff8e4f8796c: null,
        a243213c96d515eb52b232fbeb46ab67da9a7102: null,
        '65c1e5b1640832e41832bfa753122b2fc54de956': null,
        '5da12e1c8aa806c7b5f10ffe931fcd39dc18397d': null,
        ecec95d887740f920acebaf5a5dc0503a331a02a: null,
      },
      owner_id: 7713197,
      label_ids: [],
      is_deleted: false,
      origin: 'API',
      origin_id: null,
      channel: null,
      channel_id: null,
      acv: null,
      arr: null,
      mrr: null,
    },
  }

  it('should return undefined if intent is not "sell"', async () => {
    const result = await checkOnlineConversion(
      { intent: 'buy', state: 'VIC' },
      mockV2DealCustomFields.data.custom_fields,
    )
    expect(result).toBeUndefined()
  })

  it('should return undefined if leadJourney or campaignTriggerId is missing', async () => {
    const myMockV2DealCustomFields = {
      ...mockV2DealCustomFields,
      data: {
        ...mockV2DealCustomFields.data,
        custom_fields: {
          ...mockV2DealCustomFields.data.custom_fields,
          '5da12e1c8aa806c7b5f10ffe931fcd39dc18397d': null,
          d8bbfeda55bd5a67d0212c84e86ba3168ddcf225: null,
        },
      },
    }
    const result = await checkOnlineConversion(
      { intent: 'sell', state: 'VIC' },
      myMockV2DealCustomFields.data.custom_fields,
    )
    expect(result).toBeUndefined()
  })

  it('should return OnlineConversionTypes.leadJourney if leadJourney includes "online conversion" but not "wavie"', async () => {
    const result = await checkOnlineConversion(
      { intent: 'sell', state: 'VIC' },
      mockV2DealCustomFields.data.custom_fields,
    )
    expect(result).toBe(OnlineConversionTypes.leadJourney)
  })

  it('should return OnlineConversionTypes.wavie if campaignId is "RACV"', async () => {
    const myMockV2DealCustomFields = {
      ...mockV2DealCustomFields,
      data: {
        ...mockV2DealCustomFields.data,
        custom_fields: {
          ...mockV2DealCustomFields.data.custom_fields,
          '5da12e1c8aa806c7b5f10ffe931fcd39dc18397d': 603, // RACV
          d8bbfeda55bd5a67d0212c84e86ba3168ddcf225: 'Online Conversion - RACV',
        },
      },
    }
    const result = await checkOnlineConversion(
      { intent: 'sell', state: 'VIC' },
      myMockV2DealCustomFields.data.custom_fields,
    )
    expect(result).toBe(OnlineConversionTypes.racv)
  })

  it('should return OnlineConversionTypes.wavie if campaignId is "wavie"', async () => {
    const myMockV2DealCustomFields = {
      ...mockV2DealCustomFields,
      data: {
        ...mockV2DealCustomFields.data,
        custom_fields: {
          ...mockV2DealCustomFields.data.custom_fields,
          '5da12e1c8aa806c7b5f10ffe931fcd39dc18397d': 607, // Wavie
          d8bbfeda55bd5a67d0212c84e86ba3168ddcf225: 'Online Conversion - Wavie',
        },
      },
    }
    const result = await checkOnlineConversion(
      { intent: 'sell', state: 'VIC' },
      myMockV2DealCustomFields.data.custom_fields,
    )
    expect(result).toBe(OnlineConversionTypes.wavie)
  })

  it('should return OnlineConversionTypes.racv if campaignTriggerId matches "RACV" and state is allowed', async () => {
    const myMockV2DealCustomFields = {
      ...mockV2DealCustomFields,
      data: {
        ...mockV2DealCustomFields.data,
        custom_fields: {
          ...mockV2DealCustomFields.data.custom_fields,
          '5da12e1c8aa806c7b5f10ffe931fcd39dc18397d': 603, // RACV
          d8bbfeda55bd5a67d0212c84e86ba3168ddcf225: 'Online Conversion - RACV',
        },
      },
    }

    const resultWithAllowedState = await checkOnlineConversion(
      { intent: 'sell', state: 'NSW' },
      myMockV2DealCustomFields.data.custom_fields,
    )
    expect(resultWithAllowedState).toBe(OnlineConversionTypes.racv)
  })

  it('should return OnlineConversionTypes.racv if campaignTriggerId matches "Wavie" and state is allowed', async () => {
    const myMockV2DealCustomFields = {
      ...mockV2DealCustomFields,
      data: {
        ...mockV2DealCustomFields.data,
        custom_fields: {
          ...mockV2DealCustomFields.data.custom_fields,
          '5da12e1c8aa806c7b5f10ffe931fcd39dc18397d': 607, // Wavie
          d8bbfeda55bd5a67d0212c84e86ba3168ddcf225: 'Online Conversion - Wavie',
        },
      },
    }

    const result = await checkOnlineConversion(
      { intent: 'sell', state: 'NSW' },
      myMockV2DealCustomFields.data.custom_fields,
    )
    expect(result).toBe(OnlineConversionTypes.wavie)
  })

  it('should return undefined if campaignTriggerId even if matches "Wavie" and state is not allowed', async () => {
    const myMockV2DealCustomFields = {
      ...mockV2DealCustomFields,
      data: {
        ...mockV2DealCustomFields.data,
        custom_fields: {
          ...mockV2DealCustomFields.data.custom_fields,
          '5da12e1c8aa806c7b5f10ffe931fcd39dc18397d': 607, // Wavie
          d8bbfeda55bd5a67d0212c84e86ba3168ddcf225: 'Online Conversion - Wavie',
        },
      },
    }

    const result = await checkOnlineConversion(
      { intent: 'sell', state: 'QLD' },
      myMockV2DealCustomFields.data.custom_fields,
    )
    expect(result).toBeUndefined()
  })
})

describe('getOnlineConversionType', () => {
  it('should return OnlineConversionTypes.leadJourney if leadJourney contains "online conversion"', () => {
    const result = getOnlineConversionType(
      'VIC',
      'online conversion',
      undefined,
    )
    expect(result).toBe(OnlineConversionTypes.leadJourney)
  })

  it('should return undefined if leadJourney does not contain "online conversion" and campaignTriggerId is missing', () => {
    const result = getOnlineConversionType(
      'VIC',
      'some other journey',
      undefined,
    )
    expect(result).toBeUndefined()
  })

  it('should return OnlineConversionTypes.racv if campaignTriggerId matches "RACV" and state is allowed', () => {
    const result = getOnlineConversionType(
      'VIC',
      'Online Conversion - RACV',
      '603',
    ) // Assuming 603 maps to "RACV"
    expect(result).toBe(OnlineConversionTypes.racv)
  })

  it('should return OnlineConversionTypes.wavie if campaignTriggerId matches "Wavie" and state is allowed', () => {
    const result = getOnlineConversionType(
      'VIC',
      'Online Conversion - Wavie',
      '607',
    ) // Assuming 607 maps to "Wavie"
    expect(result).toBe(OnlineConversionTypes.wavie)
  })

  it('should return undefined if campaignTriggerId does not match any known triggers', () => {
    const result = getOnlineConversionType('VIC', undefined, '999') // Assuming 999 is not a valid trigger
    expect(result).toBeUndefined()
  })

  it('should return undefined if state is not allowed for campaignTriggerId', () => {
    const result = getOnlineConversionType('TAS', undefined, '603') // Assuming "TAS" is not in AllowedOnlineConversionStates
    expect(result).toBeUndefined()
  })
})
