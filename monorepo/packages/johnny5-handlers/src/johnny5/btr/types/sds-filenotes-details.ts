export type SdsLeadType =
  | 'Agent Cold Lead'
  | 'Agent Warm Lead'
  | 'Client Cold Lead'
  | 'Client Warm Lead'

export type SdsLeadSource = 'BTR Page' | 'Agent Page' | 'Franchisee Page'

export interface FileNotesMatterCreationDetails {
  leadSource: SdsLeadSource
  leadType: 'Cold Lead' | 'Warm Lead'
  basis: string
  templateId: string
  postcode: string
}

export interface FileNotesReferences {
  matter: string
  file: string
  job: string
  webhook: string
  created: string
  environment: string
}

export interface ContactCardMatching {
  existingName: string
  existingPhone: string
  existingEmail: string
  givenPhone: string
  givenEmail: string
}

export type SdsPreferredLeadDetails = {
  templateId: number
  email: string
  areaCode: string
}

export type SdsFormLeadDetails = {
  leadSource: SdsLeadSource
  leadType: SdsLeadType
  openingBasis: 'Property Address Postcode' | 'Area Code'
}
