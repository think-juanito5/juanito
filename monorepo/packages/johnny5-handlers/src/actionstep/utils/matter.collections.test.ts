import { describe, expect, test } from 'bun:test'
import { mapToKeyDates, mapToTransactionDetails } from './matter.collections'

describe('mapToTransactionDetails', () => {
  test('empty input, response should be null', () => {
    const convdet = {}
    const response = mapToTransactionDetails(convdet)

    expect(response).toEqual({
      PurchasePrice: null,
      ConveyancingType: null,
      IsMovingIn: null,
    })
  })

  test('IsMovingIn should be yes and response should be yes', () => {
    const convdet = {
      purprice: '1000',
      ConveyType: 'ConveyType',
      investment_property: 'yes',
    }

    const response = mapToTransactionDetails(convdet)

    expect(response).toEqual({
      PurchasePrice: '1000',
      ConveyancingType: 'ConveyType',
      IsMovingIn: 'yes',
    })
  })

  test('IsMovingIn is null from response and should be null', () => {
    const convdet = {
      purprice: null,
      ConveyType: 'ConveyType',
      investment_property: null,
      PrimaryResidence: null,
    }

    const response = mapToTransactionDetails(convdet)

    expect(response).toEqual({
      PurchasePrice: null,
      ConveyancingType: 'ConveyType',
      IsMovingIn: null,
    })
  })

  test('PrimaryResidence will be used and response should be yes', () => {
    const convdet = {
      purprice: '1000',
      ConveyType: null,
      investment_property: null,
      PrimaryResidence: 'yes',
    }

    const response = mapToTransactionDetails(convdet)
    expect(response.IsMovingIn).toEqual('yes')
  })

  test('IsMovingIn in response should be no', () => {
    const convdet = {
      purprice: '100',
      ConveyType: 'ConveyType',
      investment_property: 'no',
      PrimaryResidence: null,
    }

    const response = mapToTransactionDetails(convdet)
    expect(response.IsMovingIn).toEqual('no')
  })

  test('IsMovingIn in response should be true', () => {
    const convdet = {
      purprice: '100',
      ConveyType: 'ConveyType',
      investment_property: 'With Vacant Possession - Purchaser Moving In',
      PrimaryResidence: null,
    }

    const response = mapToTransactionDetails(convdet)
    expect(response.IsMovingIn).toEqual('yes')
  })
})

describe('mapToKeyDates', () => {
  test('empty keydates input, response should be all null', () => {
    const keydates = null
    const response = mapToKeyDates(keydates || {})

    expect(response).toEqual({
      SettlementDate: null,
      BuildingPestInspectionDate: null,
      ContractDate: null,
      CoolingOffDate: null,
      UnconditionalDate: null,
      FinanceDueDate: null,
      NotProcDate: null,
      BookingDate: null,
    })
  })

  test('empty keydates input, response should be all null', () => {
    const keydates = {}
    const response = mapToKeyDates(keydates)

    expect(response).toEqual({
      SettlementDate: null,
      BuildingPestInspectionDate: null,
      ContractDate: null,
      CoolingOffDate: null,
      UnconditionalDate: null,
      FinanceDueDate: null,
      NotProcDate: null,
      BookingDate: null,
    })
  })

  test('valid notprocdate input, response should be equal', () => {
    const keydates = {
      notprocdate: '2024-01-08',
    }
    const response = mapToKeyDates(keydates)

    expect(response).toEqual({
      SettlementDate: null,
      BuildingPestInspectionDate: null,
      ContractDate: null,
      CoolingOffDate: null,
      UnconditionalDate: null,
      FinanceDueDate: null,
      NotProcDate: '2024-01-08',
      BookingDate: null,
    })
  })

  test('valid keydates input, response should be equal', () => {
    const keydates = {
      smtdateonly: '2024-01-01',
      notprocdate: '2024-01-02',
      bpdate: '2024-01-03',
      kdate: '2024-01-04',
      cooloffdate: '2024-01-05',
      uncondate: '2024-01-06',
      findate: '2024-01-07',
      kreviewbookdate: '2024-01-08',
    }
    const response = mapToKeyDates(keydates)

    expect(response).toEqual({
      SettlementDate: '2024-01-01',
      BuildingPestInspectionDate: '2024-01-03',
      ContractDate: '2024-01-04',
      CoolingOffDate: '2024-01-05',
      UnconditionalDate: '2024-01-06',
      FinanceDueDate: '2024-01-07',
      NotProcDate: '2024-01-02',
      BookingDate: '2024-01-08',
    })
  })

  test('valid keydates input with |description, response should parse `|description` and date should be equal', () => {
    const keydates = {
      smtdateonly: '2024-01-01||description=',
      notprocdate: '2024-01-02|description=',
      bpdate: '2024-01-03|description=',
      kdate: '2024-01-04|description=',
      cooloffdate: '2024-01-05|description=',
      uncondate: '2024-01-06|description=',
      findate: '2024-01-07|description=',
      kreviewbookdate: '2024-01-08|description=',
    }
    const response = mapToKeyDates(keydates)

    expect(response).toEqual({
      SettlementDate: '2024-01-01',
      BuildingPestInspectionDate: '2024-01-03',
      ContractDate: '2024-01-04',
      CoolingOffDate: '2024-01-05',
      UnconditionalDate: '2024-01-06',
      FinanceDueDate: '2024-01-07',
      NotProcDate: '2024-01-02',
      BookingDate: '2024-01-08',
    })
  })

  test('valid notprocdate input, response should be equal', () => {
    const keydates = {
      notprocdate: '2024-01-08',
    }
    const response = mapToKeyDates(keydates)

    expect(response).toEqual({
      SettlementDate: null,
      BuildingPestInspectionDate: null,
      ContractDate: null,
      CoolingOffDate: null,
      UnconditionalDate: null,
      FinanceDueDate: null,
      NotProcDate: '2024-01-08',
      BookingDate: null,
    })
  })

  test('valid notprocdate input with invalid description, response should parse description and date should be equal', () => {
    const keydates = {
      notprocdate: '2024-01-08|description=',
      bpdate: null,
    }
    const response = mapToKeyDates(keydates)

    expect(response).toEqual({
      SettlementDate: null,
      BuildingPestInspectionDate: null,
      ContractDate: null,
      CoolingOffDate: null,
      UnconditionalDate: null,
      FinanceDueDate: null,
      NotProcDate: '2024-01-08',
      BookingDate: null,
    })
  })

  test('undefined string input for keydates, response should be null', () => {
    const keydates = {
      smtdateonly: 'undefined',
      notprocdate: 'undefine',
      bpdate: 'undefined',
      kdate: 'undefined',
      cooloffdate: 'undefined',
      uncondate: 'undefined',
      findate: 'undefined',
      kreviewbookdate: 'undefined',
    }
    const response = mapToKeyDates(keydates)

    expect(response).toEqual({
      SettlementDate: null,
      BuildingPestInspectionDate: null,
      ContractDate: null,
      CoolingOffDate: null,
      UnconditionalDate: null,
      FinanceDueDate: null,
      NotProcDate: null,
      BookingDate: null,
    })
  })
})
