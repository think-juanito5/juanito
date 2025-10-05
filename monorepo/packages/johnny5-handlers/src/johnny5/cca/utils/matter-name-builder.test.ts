import { describe, expect, it } from 'bun:test'
import {
  type EntityMatterNameParams,
  MatterNameBuilder,
  MatterNamingMethod,
} from '@dbc-tech/cca-common'
import type { AustralianState } from '@dbc-tech/johnny5/typebox'
import type { ManifestMeta } from '@dbc-tech/johnny5/typebox/manifest-meta.schema'
import type { Intent } from '@dbc-tech/johnny5/utils'

describe('MatterNameBuilder.fromData', () => {
  // Base parameters for the test cases
  const baseParams: EntityMatterNameParams = {
    isCompany: true,
    companyName: 'Test Company Pty Ltd',
    lastName: 'Smith',
    state: 'NSW' as AustralianState,
    intent: 'buy' as Intent,
    matterId: 12345,
    testMode: false,
    additionalInfo: 'Review',
  }

  it('should build a valid matter name for a company with default naming method', () => {
    const builder = MatterNameBuilder.fromData(baseParams)
    const result = builder.build()
    expect(result).toBe('NSW-BUY-TEST COMPANY PTY LTD-REVIEW-12345')
  })

  it('should build a valid matter name for an individual with additionalInfo of Drafting', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      isCompany: false,
      additionalInfo: 'Drafting',
    }).withMethod(MatterNamingMethod.Initial)
    const result = builder.build()
    expect(result).toBe('NSW-BUY-SMITH-DRAFT-12345')
  })

  it('should build a test-mode matter name', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      testMode: true,
      additionalInfo: 'Conveyance',
      roleInitials: 'JD',
    })
    const result = builder.build()
    expect(result).toBe('TEST-NSW-BUY-TEST COMPANY PTY LTD-JD-12345')
  })

  it('should build a matter name for SDS', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      testMode: false,
      additionalInfo: 'Seller disclosure statement',
      roleInitials: 'JD',
    })
    const result = builder.build()
    expect(result).toBe('NSW-BUY-TEST COMPANY PTY LTD-SDS-12345')
  })

  it('should throw an error for PreSettlement method without conveyancer initials', () => {
    const builder = MatterNameBuilder.fromData(baseParams).withMethod(
      MatterNamingMethod.PreSettlement,
    )
    expect(() => builder.build()).toThrow(
      'Missing roleInitials for Pre-Settlement',
    )
  })

  it('should create matter name for PreSettlement', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      isCompany: false,
      lastName: 'Jameson Quinn',
      roleInitials: 'JD',
    }).withMethod(MatterNamingMethod.PreSettlement)
    const result = builder.build()
    expect(result).toBe('NSW-BUY-JAMESON QUINN-JD-12345')
  })

  it('should create matter name for Uknown namingMethod', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      isCompany: false,
      lastName: 'Jameson Quinn',
      roleInitials: 'JD',
      additionalInfo: 'Review',
    }).withMethod(MatterNamingMethod.PreSettlement)
    const result = builder.build()
    expect(result).toBe('NSW-BUY-JAMESON QUINN-JD-12345')
  })

  it('should create matter name for ContractDrafting ignoring ConvInitials', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      isCompany: false,
      lastName: 'Jameson Quinn',
      roleInitials: 'JD',
    }).withMethod(MatterNamingMethod.Initial)
    const result = builder.build()
    expect(result).toBe('NSW-BUY-JAMESON QUINN-REVIEW-12345')
  })

  it('should truncate company name to 20 characters', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      companyName: 'A Very Long Company Name That Exceeds Limit',
    })
    const result = builder.build()
    expect(result).toBe('NSW-BUY-A VERY LONG COMPANY -REVIEW-12345')
  })

  it('should use intent to determine stepCode if naming method is unknown', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      intent: 'sell',
    }).withMethod(MatterNamingMethod.Initial)
    const result = builder.build()
    expect(result).toBe('NSW-SELL-TEST COMPANY PTY LTD-REVIEW-12345')
  })

  it('should use intent to determine stepCode if naming method is unknown', () => {
    const builder = MatterNameBuilder.fromData({
      ...baseParams,
      intent: 'buy',
    }).withMethod(MatterNamingMethod.Initial)
    const result = builder.build()
    expect(result).toBe('NSW-BUY-TEST COMPANY PTY LTD-REVIEW-12345')
  })
})

describe('MatterNameBuilder.fromMeta', () => {
  it('should build matter name for a company with role initials', () => {
    const meta: ManifestMeta[] = [
      { key: 'isCompany', value: 'true' },
      { key: 'companyName', value: 'Example Corp' },
      { key: 'state', value: 'NSW' },
      { key: 'intent', value: 'buy' },
      { key: 'matterId', value: '101' },
      { key: 'roleInitials', value: 'EC' },
      { key: 'testMode', value: 'false' },
    ]

    const name = MatterNameBuilder.fromMeta(meta)
      .withMethod(MatterNamingMethod.PreSettlement)
      .build()

    expect(name).toBe('NSW-BUY-EXAMPLE CORP-EC-101')
  })

  it('should build test matter name for individual without roleInitials using intent fallback', () => {
    const meta: ManifestMeta[] = [
      { key: 'isCompany', value: 'false' },
      { key: 'lastName', value: 'Smith' },
      { key: 'state', value: 'VIC' },
      { key: 'intent', value: 'sell' },
      { key: 'matterId', value: '202' },
      { key: 'testMode', value: 'true' },
      { key: 'roleInitials', value: 'MJ' },
      { key: 'additionalInfo', value: 'Conveyance' },
    ]

    const name = MatterNameBuilder.fromMeta(meta)
      .withMethod(MatterNamingMethod.Initial)
      .build()

    expect(name).toBe('TEST-VIC-SELL-SMITH-MJ-202')
  })

  it('should throw if state, intent, or matterId are missing', () => {
    const meta: ManifestMeta[] = [
      { key: 'isCompany', value: 'false' },
      { key: 'lastName', value: 'Brown' },
      { key: 'testMode', value: 'false' },
    ]

    expect(() =>
      MatterNameBuilder.fromMeta(meta)
        .withMethod(MatterNamingMethod.ContractDrafting)
        .build(),
    ).toThrow('Missing required meta fields: state, intent, or matterId')
  })

  it('should throw if roleInitials missing for PreSettlement method', () => {
    const meta: ManifestMeta[] = [
      { key: 'isCompany', value: 'true' },
      { key: 'companyName', value: 'NoRole Pty Ltd' },
      { key: 'state', value: 'SA' },
      { key: 'intent', value: 'buy' },
      { key: 'matterId', value: '303' },
      { key: 'testMode', value: 'false' },
    ]

    expect(() =>
      MatterNameBuilder.fromMeta(meta)
        .withMethod(MatterNamingMethod.PreSettlement)
        .build(),
    ).toThrow('Missing roleInitials for Pre-Settlement')
  })
})
