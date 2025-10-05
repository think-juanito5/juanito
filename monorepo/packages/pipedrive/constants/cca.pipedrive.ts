import type { PipedriveAdditionalInfoType } from '../schemas'

export const dealFields = [
  'status',
  'won_time',
  'lost_time',
  'lost_reason',
  'stage_id',
  'person_id',
  'person_name',
  'owner_name',
  'expected_close_date',
]

export const customFields = {
  bst: '32a26829a091f3b91608edac353d72af483ce188',
  state: '415157dbc97375a775fc1f28219a816ca52b9ca6',
  propertyDetIndex: 'af0c8bd753301f888695cfb36416dd40d9aaa0b3',
  offerApplied: 'f1122a434a9a8adf869714cf947464c56f2aec22',
  discountOffered: '191322d3f05a278eb337c08dd08aef13eb2625cb',
  discountOfferedCurrency: '191322d3f05a278eb337c08dd08aef13eb2625cb_currency',
  enableMarketing: 'f47d943aa2844859db1526047479b1d6f4b7088c',
  investorOwnerOccupier: '1c226f725db43faedd2db184dfb2309548abe33a',
  source: '663ab8642d7b35bc597c5a81673274afd5ca1cb6',
  postcode: 'a6170b0ef59b625144a0296f34888541cbb41d86',
  phone: '4b983e49f9a4ca07e164a1318f65e8914e1fb491',
  webformTtt: 'f30a200a4265ee41153fdff4ee719fac727a7a0b',
  dialerReason: 'dd6ca6ce22aa22a66a64ee3b7475763168498536',
  dialerSkill: '0d313d8379b096aeebafbe671553a9fe3789867f',
  agentReferee: '0cae48d9ce0cde6d3a1ecbdeba935b84581ca80e',
  leadSourceCampaign: 'd02ed568108fd1a20b8d70dcfc16812a250240b4',
  leadChannel: '6ec1c4d3f6765c41cc71a1fafb19b0d6ee5cd13f',
  leadSubSource: '8b26678b35710cf28456813fbf51665d6fba75b7',
  matterId: '405427b2fe4ab0809e258b370e9323db6e50d172',
  prefferredContactTime: 'c3115c3f3dcd404731008794824f6fdb84f79761',
  optIn: '2ae4b2c99bd7f8f920efbfe8238f9762f7a17053',
  athenaNoSaleReason: 'ccefac7bd052f7559d997641fe0286cd9d961c59',
  athenaConsent: '2cbf5818583cd73da23245313ce0b4d0c0dda9db',
  ReferralId: '9ff452b30289d9693690f87b9fa14642129b1f47',
  propertySaleTime: 'becd21ef4da25658d9888473bf074b9836c17127',
  ConciergeConfirmedTts: 'df1f8861ddb362786a9c96414fa90c6c34d32a90',
  leadSource: '43c3b066abecec155c7ab8f0b0ad8349866274dd',
  leadSourceCategory: 'd33850bb61d3142a9132dae8fd370a754efc6932',
  buyerSaleStatus: 'c00b37d4417143b7917df74acf0089d41b1a3698',
  referralPage: '79f5161215d8868d97f3e48b09aa0bc06ffb19c1',
  racvConsent: 'c4b2d35f542630d9a73dea2a6c075aedd9b4c59b',
  racvMembershipNo: 'd5ce59904c058913fbec6c0267736b35d610758d',
  otoProduct: '2a340fa55d18234d1352917ed819f5baaf388459',
  campaignTrigger: '5da12e1c8aa806c7b5f10ffe931fcd39dc18397d',
  leadJourney: 'd8bbfeda55bd5a67d0212c84e86ba3168ddcf225',
  matterName: '405427b2fe4ab0809e258b370e9323db6e50d172',
  webformUrl: '63fc1b787260eff28a2d738bc5ab9b8a68232345',
  discountOfferedReviewFee: '86361d93939b26bee134b22374c3beee81878dbf',
  searchesFee: 'cfca41c333c19b539f3acf76d89df7790d5b6f56',
  draftingFee: '70f2b2b994225e3bd1e107bc33819bbe2ae2b21f',
  reviewFee: 'a0eeb4a6c342df9290046e1d42055b3214309ca0',
  fixedFee: '596cb96595ed1561da74322039f45a4711f793d8',
  billingAdditionalInfo: '607538c553cfdfb0f2fe07f6421035c748ae9021',
  newConveyancingType: '0c0637325ba013d60d119ff415d50fd6c2dd3b06',
  additionalInfo: 'd158717bdfff0a742fe0a4670631edd2f0c70864',
  propertyStreetName: '8da7a98863d5dd86cd6cd54a4fd46b859cc7b3fa',
  propertyStreetNo: '3997f0d4eb2c37db2d0bce3d309d3bdf6c9add9b',
  propertyStreetType: 'd0da6921c9ce3a945ca85d4444010d853b422f7b',
  propertySuburb: 'f2ea1652bb0ee75470a045d615a3f28783479502',
  propertyUnitNo: '3b1aa5bdc46fbf35bfdd71fcc5998d7840c417a8',
  personTestLastName: 'fa73897383f1f9b770336537db7500cf8d075509',
  personTestMiddleName: '33767eb28b8b2195c8aa0ce9a35de12bc23a5673',
  personTestAddress: '445d83bc0eed59a72f3a3b22eec06a3ec42f9aa8',
  personIsCompany: '9be2d2996aca412eb7b2ae50258cf106bcb686a0',
}

export const customDealFields = [
  customFields.bst,
  customFields.state,
  customFields.propertyDetIndex,
  customFields.offerApplied,
  customFields.discountOffered,
  customFields.discountOfferedCurrency,
  customFields.enableMarketing,
  customFields.investorOwnerOccupier,
  customFields.source,
  customFields.postcode,
  customFields.phone,
  customFields.webformTtt,
  customFields.dialerReason,
  customFields.dialerSkill,
  customFields.agentReferee,
  customFields.leadSourceCampaign,
  customFields.leadChannel,
  customFields.leadSubSource,
  customFields.matterId,
  customFields.prefferredContactTime,
  customFields.optIn,
  customFields.athenaNoSaleReason,
  customFields.athenaConsent,
  customFields.ReferralId,
  customFields.propertySaleTime,
  customFields.ConciergeConfirmedTts,
  customFields.leadSource,
  customFields.leadSourceCategory,
  customFields.buyerSaleStatus,
]

export const personFields = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'marketing_status',
]

export const pipedriveStage = {
  matterCreated: 6,
  workInProgress: 17,
}

export const pipedriveDealStatus = {
  open: 'open',
  won: 'won',
  lost: 'lost',
}

export const pipedriveCampaignTrigger: { [key: number]: string } = {
  602: 'General partner',
  603: 'RACV',
  604: 'Weeknight',
  605: 'Weekend',
  607: 'Wavie',
}

export const pipedrivePropertyType: { [key: number]: string } = {
  19: 'Apartment/Townhouse/Villa',
  20: 'Existing House',
  21: 'Land Only',
  22: 'Off the Plan',
}

export const pipedriveNatureProperty: { [key: number]: string } = {
  21: 'Farm/Rural',
  20: 'House',
  22: 'Other',
  19: 'Units/Apartments',
}

export const intentConveyancingType: { [key: string]: string } = {
  buy: 'Purchase',
  sell: 'Sale',
  transfer: 'Transfer',
}

export const matterTypeId: { [key: string]: number } = {
  QLD: 67,
  NSW: 68,
  VIC: 69,
  SA: 70,
  TAS: 71,
  WA: 72,
}

export const matterTypeCompatId: { [key: string]: string } = {
  sell: '01',
  transfer: '02',
}

export const yesNoOptionsEnableMarketing: { [key: number]: string } = {
  183: 'Yes',
  184: 'No',
}

export const PipedriveAdditionalInfo = {
  conveyance: 'Conveyance',
  drafting: 'Drafting',
  review: 'Review',
  transferA: 'Transfer A',
  transferB: 'Transfer B',
  transferC: 'Transfer C',
  transferD: 'Transfer D',
  ssr: 'Self-service Review',
  sds: 'Seller disclosure statement',
} as const

export const pipedriveAdditionalInfoTypes: {
  [key: number]: PipedriveAdditionalInfoType
} = {
  401: PipedriveAdditionalInfo.conveyance,
  402: PipedriveAdditionalInfo.drafting,
  403: PipedriveAdditionalInfo.review,
  404: PipedriveAdditionalInfo.transferA,
  405: PipedriveAdditionalInfo.transferB,
  406: PipedriveAdditionalInfo.transferC,
  432: PipedriveAdditionalInfo.transferD,
  622: PipedriveAdditionalInfo.ssr,
  630: PipedriveAdditionalInfo.sds,
}

export const pipedriveConveyancingTypeNewfield: { [key: number]: string } = {
  411: 'Sale',
  412: 'Purchase',
  413: 'Purchase - OTP',
  414: 'Transfer',
}

export const pipdriveState: { [key: number]: string } = {
  11: 'QLD',
  12: 'VIC',
  13: 'NSW',
  14: 'TAS',
  15: 'ACT',
  16: 'WA',
  17: 'SA',
  18: 'NT',
}

export const investmentPropertyCode: { [key: number]: string } = {
  419: 'Investor',
  420: 'Owner Occupier',
}

export const racvCustomData = {
  offerCode: 'RACV-VIC-100-OFF',
  discount: 100,
  utmCampaign: 'racv_member_campaign_2024',
}

export const OnlineConversionNotes = {
  racv: 'Online Conversion - RACV',
  wavie: 'Online Conversion - Wavie',
  leadjourney: 'Online Conversion',
  sds: 'Online Conversion - SDS',
} as const

export const lostReason = {
  doNotCall: 'Do not call - Remove from Marketing',
}

export const offerCodeData = {
  default: 'AAA-NO-OFFER-APPLIED',
}
