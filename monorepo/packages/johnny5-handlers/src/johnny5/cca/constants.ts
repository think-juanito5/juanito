import { customFields } from '@dbc-tech/pipedrive'

export const participantTypes = {
  adminStaff: 152,
  buyer: 155,
  client: 71,
  clientPrimary: 72,
  propertyAddress: 147,
  salesPerson: 150,
  seller: 157,
}

export const field = {
  dealId: 'id',
  title: 'title',
  creatorUserId: 'creator_user_id',
  personId: 'person_id',
  ownerId: 'owner_id',
  stageId: 'stage_id',
  status: 'status',
  won_time: 'won_time',
  fixedFee: customFields.fixedFee,
  billingAdditionalInfo: customFields.billingAdditionalInfo,
  pdNewConveyancingType: customFields.newConveyancingType,
  additionalInfo: customFields.additionalInfo,
  pdBST: customFields.bst,
  offerApplied: customFields.offerApplied,
  discountOffered: customFields.discountOffered,
  discountOfferedReviewFee: customFields.discountOfferedReviewFee,
  racvMembershipNo: customFields.racvMembershipNo,
  searchesFee: customFields.searchesFee,
  draftingFee: customFields.draftingFee,
  reviewFee: customFields.reviewFee,
  source: customFields.source,
  enableMarketing: customFields.enableMarketing,
  investorOwnerOccupier: customFields.investorOwnerOccupier,
  campaignTrigger: customFields.campaignTrigger,
  leadJourney: customFields.leadJourney,
  property_propertyCode: customFields.propertyDetIndex,
  property_postCode: customFields.postcode,
  property_state: customFields.state,
  property_streetName: customFields.propertyStreetName,
  property_streetNo: customFields.propertyStreetNo,
  property_streetType: customFields.propertyStreetType,
  property_suburb: customFields.propertySuburb,
  property_unitNo: customFields.propertyUnitNo,
  person_testLastName: customFields.personTestLastName,
  person_testMiddleName: customFields.personTestMiddleName,
  person_testAddress: customFields.personTestAddress,
  person_isCompany: customFields.personIsCompany,
  person_name: 'person_name',
  person_firstName: 'person_first_name',
  person_lastName: 'person_last_name',
  person_phone1: 'person_phones_1',
  person_phone2: 'person_phones_2',
  person_email1: 'person_emails_1',
  person_email2: 'person_emails_2',
  user_name: 'user_name',
  user_email: 'user_email',
}

export const MatterTransType: { [key: string]: string } = {
  buy: 'BUY',
  sell: 'SEL',
  transfer: 'RPT',
}

export const ConveyancingMatterTransType: { [key: string]: string } = {
  buy: 'Buyer',
  sell: 'Seller',
  transfer: 'Transfer',
}

export const bstIdMapIntent: { [key: number]: string } = {
  1: 'buy',
  2: 'sell',
  3: 'transfer',
} as const

export const FixedRequest: { [key: string]: number } = {
  defaultAssignedId: 513,
  defaultClientId: 113,
  defaultStatus: 8,
}

export const azureBlobStorage = {
  containerName: 'documents',
  virtualFolder: 'pipedrive',
}

export const OnlineConversionTypes = {
  racv: 'racv',
  leadJourney: 'leadjourney',
  wavie: 'wavie',
  sds: 'sds',
} as const

export type OnlineConversionType =
  (typeof OnlineConversionTypes)[keyof typeof OnlineConversionTypes]
