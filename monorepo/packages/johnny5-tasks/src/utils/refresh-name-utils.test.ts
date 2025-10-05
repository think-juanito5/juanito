import { describe, expect, it } from 'bun:test'
import { type MatterNameParams, getMatterName } from './refresh-name-utils'
describe('refresh-name-utils', () => {
  describe('getMatterName', () => {
    it('should generate a matter name with DRAFT as role #case1', async () => {
      const params: MatterNameParams = {
        matterId: 123,
        stepName: { current: 'Matter Preparation' },
        state: 'NSW',
        intent: 'buy',
        assignedTo: { firstName: 'John', lastName: 'Doe' },
        client: { isCompany: false, firstName: 'Jane', lastName: 'Smith' },
        additionalInfo: 'Drafting',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-BUY-SMITH-DRAFT-123')
    })
    it('should generate a matter name with company name based on AdditionalInfo #case2', async () => {
      const params: MatterNameParams = {
        matterId: 123,
        stepName: { current: 'Contract Review' },
        state: 'NSW',
        intent: 'buy',
        assignedTo: { firstName: 'John', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Review',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-BUY-ACME CORP-REVIEW-123')
    })

    it('should generate a matter name with company name based on StepName #case3', async () => {
      const params: MatterNameParams = {
        matterId: 123,
        stepName: { current: 'Matter Preparation' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Drafting',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-DRAFT-123')
    })

    it('should generate a matter name with company name based on Conveyance AdditionalInfo #case4', async () => {
      const params: MatterNameParams = {
        matterId: 123,
        stepName: { current: 'Matter Preparation' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Alex', lastName: 'Doe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Conveyance',
      }
      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-AD-123')
    })

    it('should generate a matter name with company name based on Review AdditionalInfo #case5', async () => {
      const params: MatterNameParams = {
        matterId: 123,
        stepName: { current: 'Matter Preparation' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'John', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Review',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-REVIEW-123')
    })

    it('should generate a matter name with company name based on AdditionalInfo #case6', async () => {
      const params: MatterNameParams = {
        matterId: 123,
        stepName: { current: 'Contract Drafting' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'John', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Conveyance',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-JJ-123')
    })

    it('should generate a matter name with company name based on AdditionalInfo #case7', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: { current: 'Pre-Settlement Resi (S)' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mark', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Drafting',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-MJ-12345')
    })

    it('should generate a matter name with company name based on AdditionalInfo #case8', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: { current: 'Contract Drafting' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Drafting',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-DRAFT-12345')
    })

    it('should generate a matter name with company name based on Cancellation #case9', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: { current: 'Cancellation', previous: 'Contract Drafting' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Conveyance',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-DRAFT-12345')
    })

    it('should generate a matter name with company name based on Cancellation #case10', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: { current: 'Cancellation', previous: 'Contract Review' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Conveyance',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-REVIEW-12345')
    })

    it('should generate a matter name with company name based on Cancellation #case11', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: {
          current: 'Cancellation',
          previous: 'Pre-Settlement Resi (P)',
        },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Conveyance',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-MJ-12345')
    })

    it('should generate a matter name with company name based on Cancellation #case12', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: {
          current: 'Cancellation',
          previous: 'Pre-Settlement Resi (P)',
        },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Conveyance',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-MJ-12345')
    })

    it('should generate a matter name with company name based on Cancellation #case13', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: { current: 'Cancellation', previous: 'Settled' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Drafting',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-MJ-12345')
    })

    it('should generate a matter name with company name based on SDS Cancellation #case14', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: {
          current: 'Cancellation',
          previous: 'Seller Disclosure Statement',
        },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Seller disclosure statement',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-SDS-12345')
    })

    it('should generate a matter name with company name based on SDS #case15 Pre-Settlement step', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: { current: 'Pre-Settlement Resi (P)' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Seller disclosure statement',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-MJ-12345')
    })

    it('should generate a matter name with company name based on SDS #case15 Contract Drafting step', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: {
          current: 'Contract Drafting',
          previous: 'Seller Disclosure Statement',
        },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Seller disclosure statement',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-DRAFT-12345')
    })

    it('should generate a matter name with company name based on SDS #case16 Contract Drafting step', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: {
          previous: 'Contract Drafting',
          current: 'Seller Disclosure Statement',
        },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Seller disclosure statement',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-SDS-12345')
    })

    it('should generate a matter name with company name based on SDS #case17 Seller Disclosure Statement step', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: { current: 'Seller Disclosure Statement' },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Seller disclosure statement',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-SDS-12345')
    })

    it('should generate a matter name with company name based on SDS #case18 Pre-Settlement step', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: {
          current: 'Pre-Settlement Resi (P)',
          previous: 'Seller Disclosure Statement',
        },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Seller disclosure statement',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-MJ-12345')
    })

    it('should generate a matter name with company name based on SDS Cancellation #case19-a', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: {
          current: 'Cancellation',
          previous: 'Contract Drafting',
        },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Seller disclosure statement',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-DRAFT-12345')
    })

    it('should generate a matter name with company name based on SDS Cancellation #case19-b', async () => {
      const params: MatterNameParams = {
        matterId: 12345,
        stepName: {
          current: 'Cancellation',
          previous: 'Pre-Settlement Resi (P)',
        },
        state: 'NSW',
        intent: 'sell',
        assignedTo: { firstName: 'Mike', lastName: 'Joe' },
        client: { isCompany: true, companyName: 'Acme Corp' },
        additionalInfo: 'Seller disclosure statement',
      }

      const result = await getMatterName(params)
      expect(result).toBe('TEST-NSW-SELL-ACME CORP-MJ-12345')
    })
  })
})
