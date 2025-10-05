import { describe, expect, it } from 'bun:test'
import type { BtrSdsClientWebhook } from '@dbc-tech/johnny5/typebox'
import { getSdsLeadDetails } from './leads-util'

describe('getSdsLeadDetails', () => {
  it('should return Agent Warm Lead when agent_id and conveyancer_area are present', () => {
    const lead: Partial<BtrSdsClientWebhook> = {
      agent_id: '123',
      conveyancer_area: 'Q01',
    }
    const result = getSdsLeadDetails(lead as BtrSdsClientWebhook)
    expect(result).toEqual({
      leadSource: 'Agent Page',
      leadType: 'Agent Warm Lead',
      openingBasis: 'Area Code',
    })
  })

  it('should return Agent Cold Lead when agent_id is present but conveyancer_area is missing', () => {
    const lead: Partial<BtrSdsClientWebhook> = {
      agent_id: '123',
      conveyancer_area: undefined,
    }
    const result = getSdsLeadDetails(lead as BtrSdsClientWebhook)
    expect(result).toEqual({
      leadSource: 'Agent Page',
      leadType: 'Agent Cold Lead',
      openingBasis: 'Area Code',
    })
  })

  it('should return Client Warm Lead from Franchisee Page when only conveyancer_area is present', () => {
    const lead: Partial<BtrSdsClientWebhook> = {
      agent_id: undefined,
      conveyancer_area: 'Q01',
    }
    const result = getSdsLeadDetails(lead as BtrSdsClientWebhook)
    expect(result).toEqual({
      leadSource: 'Franchisee Page',
      leadType: 'Client Warm Lead',
      openingBasis: 'Area Code',
    })
  })

  it('should return Client Cold Lead from BTR Page when neither agent_id nor conveyancer_area are present', () => {
    const lead: Partial<BtrSdsClientWebhook> = {
      agent_id: undefined,
      conveyancer_area: undefined,
    }
    const result = getSdsLeadDetails(lead as BtrSdsClientWebhook)
    expect(result).toEqual({
      leadSource: 'BTR Page',
      leadType: 'Client Cold Lead',
      openingBasis: 'Property Address Postcode',
    })
  })

  // extra edge cases

  it('should treat empty agent_id as Client Cold Lead', () => {
    const lead: Partial<BtrSdsClientWebhook> = {
      agent_id: '',
      conveyancer_area: undefined,
    }
    const result = getSdsLeadDetails(lead as BtrSdsClientWebhook)
    expect(result).toEqual({
      leadSource: 'BTR Page',
      leadType: 'Client Cold Lead',
      openingBasis: 'Property Address Postcode',
    })
  })

  it('should treat empty conveyancer_area as Agent Cold Lead', () => {
    const lead: Partial<BtrSdsClientWebhook> = {
      agent_id: '123',
      conveyancer_area: '',
    }
    const result = getSdsLeadDetails(lead as BtrSdsClientWebhook)
    expect(result).toEqual({
      leadSource: 'Agent Page',
      leadType: 'Agent Cold Lead',
      openingBasis: 'Area Code',
    })
  })

  it('should return Agent Cold Lead when agent_id is present and conveyancer_area is null', () => {
    const lead: Partial<BtrSdsClientWebhook> = {
      agent_id: '123',
      conveyancer_area: null as unknown as string,
    }
    const result = getSdsLeadDetails(lead as BtrSdsClientWebhook)
    expect(result).toEqual({
      leadSource: 'Agent Page',
      leadType: 'Agent Cold Lead',
      openingBasis: 'Area Code',
    })
  })

  it('should return Agent Warm Lead even if values have surrounding whitespace', () => {
    const lead: Partial<BtrSdsClientWebhook> = {
      agent_id: ' 123 ',
      conveyancer_area: ' Q31 ',
    }
    const result = getSdsLeadDetails(lead as BtrSdsClientWebhook)
    expect(result).toEqual({
      leadSource: 'Agent Page',
      leadType: 'Agent Warm Lead',
      openingBasis: 'Area Code',
    })
  })
})
