import { describe, expect, it } from 'bun:test'
import {
  type LeadTag,
  applyRules,
  leadSource,
  leadSourceCategory,
  source,
  utmMedium,
  utmSource,
} from './lead-tagging-utils'

describe('leadTagRules', () => {
  const makeLeadTag = (): LeadTag => ({
    leadSource: '',
    leadSourceCategory: '',
    source: null,
  })

  it('should set DBC/Direct when utmSource and utmMedium are null or empty', () => {
    const leadTag = makeLeadTag()
    applyRules(null, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.DBC)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.Direct)

    const leadTag2 = makeLeadTag()
    applyRules('', '', leadTag2)
    expect(leadTag2.leadSource).toBe(leadSource.DBC)
    expect(leadTag2.leadSourceCategory).toBe(leadSourceCategory.Direct)
  })

  it('should set B2C/PerformanceMedia/Organic for google/organic', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.google, utmMedium.organic, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.B2C)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.PerformanceMedia)
    expect(leadTag.source).toBe(source.Organic)
  })

  it('should set DBC/Direct for utmSource Unknown', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.Unknown, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.DBC)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.Direct)
  })

  it('should set DBC/Direct for utmSource WebformDirect', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.WebformDirect, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.DBC)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.Direct)
  })

  it('should set B2B/CorporatePartner for utmSource racv', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.racv, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.B2B)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.CorporatePartner)
  })

  it('should set B2B/CorporatePartner for utmSource RACVEDMLink', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.RACVEDMLink, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.B2B)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.CorporatePartner)
  })

  it('should set B2B/PropertyPartner for utmSource DirectReferralProgram', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.DirectReferralProgram, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.B2B)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.PropertyPartner)
  })

  it('should set Referral/NetworkPartner for utmSource trustpilot', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.trustpilot, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.Referral)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.NetworkPartner)
  })

  it('should set DBC/Direct for utmSource ReturnClient', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.ReturnClient, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.DBC)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.Direct)
  })

  it('should set B2C/PerformanceMedia for utmSource EmailMarketing', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.EmailMarketing, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.B2C)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.PerformanceMedia)
  })

  it('should set B2C/PerformanceMedia for utmSource bing', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.bing, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.B2C)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.PerformanceMedia)
  })

  it('should set B2C/PerformanceMedia for utmSource facebook', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.facebook, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.B2C)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.PerformanceMedia)
  })

  it('should set B2C/PerformanceMedia for utmSource Google', () => {
    const leadTag = makeLeadTag()
    applyRules(utmSource.Google, null, leadTag)
    expect(leadTag.leadSource).toBe(leadSource.B2C)
    expect(leadTag.leadSourceCategory).toBe(leadSourceCategory.PerformanceMedia)
  })

  it('should not change leadTag if no rule matches', () => {
    const leadTag = makeLeadTag()
    applyRules('someOtherSource', 'someOtherMedium', leadTag)
    expect(leadTag.leadSource).toBe('')
    expect(leadTag.leadSourceCategory).toBe('')
    expect(leadTag.source).toBeNull()
  })
})
