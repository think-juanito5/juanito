export type LeadTag = {
  leadSource: string
  leadSourceCategory: string
  source: string | null
}

export type LeadTagRule = (
  utmSource: string | null,
  utmMedium: string | null,
  leadTag: LeadTag,
) => void

export const utmSource = {
  Unknown: 'Unknown',
  WebformDirect: 'Webform - Direct',
  racv: 'racv',
  RACVEDMLink: 'RACV/EDM Link',
  DirectReferralProgram: 'Direct Referral Program',
  trustpilot: 'trustpilot',
  ReturnClient: 'Return Client',
  EmailMarketing: 'Email Marketing',
  bing: 'bing',
  facebook: 'facebook',
  Google: 'Google',
  google: 'google',
} as const

export const utmMedium = {
  organic: 'organic',
} as const

export const leadSource = {
  DBC: 'DBC',
  B2B: 'B2B',
  Referral: 'Referral',
  B2C: 'B2C',
} as const

export const leadSourceCategory = {
  Direct: 'Direct',
  CorporatePartner: 'Corporate Partner',
  PropertyPartner: 'Property Partner',
  NetworkPartner: 'Network Partner',
  PerformanceMedia: 'Performance Media',
} as const

export const source = {
  Organic: 'Organic',
} as const

export const leadTagRules: LeadTagRule[] = [
  (
    utmSourceValue: string | null,
    utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (!utmSourceValue && !utmMediumValue) {
      leadTag.leadSource = leadSource.DBC
      leadTag.leadSourceCategory = leadSourceCategory.Direct
    }
  },
  (
    utmSourceValue: string | null,
    utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (
      utmSourceValue === utmSource.google &&
      utmMediumValue === utmMedium.organic
    ) {
      leadTag.leadSource = leadSource.B2C
      leadTag.leadSourceCategory = leadSourceCategory.PerformanceMedia
      leadTag.source = source.Organic
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.Unknown) {
      leadTag.leadSource = leadSource.DBC
      leadTag.leadSourceCategory = leadSourceCategory.Direct
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.WebformDirect) {
      leadTag.leadSource = leadSource.DBC
      leadTag.leadSourceCategory = leadSourceCategory.Direct
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.racv) {
      leadTag.leadSource = leadSource.B2B
      leadTag.leadSourceCategory = leadSourceCategory.CorporatePartner
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.RACVEDMLink) {
      leadTag.leadSource = leadSource.B2B
      leadTag.leadSourceCategory = leadSourceCategory.CorporatePartner
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.DirectReferralProgram) {
      leadTag.leadSource = leadSource.B2B
      leadTag.leadSourceCategory = leadSourceCategory.PropertyPartner
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.trustpilot) {
      leadTag.leadSource = leadSource.Referral
      leadTag.leadSourceCategory = leadSourceCategory.NetworkPartner
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.ReturnClient) {
      leadTag.leadSource = leadSource.DBC
      leadTag.leadSourceCategory = leadSourceCategory.Direct
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.EmailMarketing) {
      leadTag.leadSource = leadSource.B2C
      leadTag.leadSourceCategory = leadSourceCategory.PerformanceMedia
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.bing) {
      leadTag.leadSource = leadSource.B2C
      leadTag.leadSourceCategory = leadSourceCategory.PerformanceMedia
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.facebook) {
      leadTag.leadSource = leadSource.B2C
      leadTag.leadSourceCategory = leadSourceCategory.PerformanceMedia
    }
  },
  (
    utmSourceValue: string | null,
    _utmMediumValue: string | null,
    leadTag: LeadTag,
  ) => {
    if (utmSourceValue === utmSource.Google) {
      leadTag.leadSource = leadSource.B2C
      leadTag.leadSourceCategory = leadSourceCategory.PerformanceMedia
    }
  },
]

export const applyRules = (
  utmSource: string | null,
  utmMedium: string | null,
  leadTag: LeadTag,
) => {
  leadTagRules.forEach((rule) => rule(utmSource, utmMedium, leadTag))
}
