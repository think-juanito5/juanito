export interface matterCollectionRecords {
  [key: string]: unknown
  dataCollectionId: number
  dataCollectionName: string
  dataFieldName?: string
  stringValue?: string | null
}

export const groupMatterCollectionRecords = (
  arr: matterCollectionRecords[],
): { [key: string]: { [key: string]: string | null | undefined } } => {
  return arr.reduce(
    (
      acc: { [key: string]: { [key: string]: string | null | undefined } },
      curr,
    ) => {
      const collectionName = curr.dataCollectionName
      if (!acc[collectionName]) {
        acc[collectionName] = {}
      }

      if (curr.dataFieldName) {
        acc[collectionName][curr.dataFieldName] = curr.stringValue
      }

      return acc
    },
    {},
  )
}

export type GroupCollections = {
  [key: string]: {
    [key: string]: string | null | undefined
  }
}

export const groupMatterCollectionRecordsInJsonFormat = (
  arr: matterCollectionRecords[],
): GroupCollections => {
  return arr.reduce((acc: GroupCollections, curr) => {
    const collectionName = curr.dataCollectionName
    if (!acc[collectionName]) {
      acc[collectionName] = {}
    }

    if (curr.dataFieldName) {
      acc[collectionName][curr.dataFieldName] = curr.stringValue
    }

    return acc
  }, {})
}

export const getElemValue = (
  groupedData: GroupCollections,
  groupAndField: string,
): string | null | undefined => {
  const [groupName, fieldName] = groupAndField.split('.')
  if (
    groupedData[groupName] &&
    groupedData[groupName][fieldName] !== undefined
  ) {
    return groupedData[groupName][fieldName]
  }
  return undefined
}

export interface MatterBase {
  ID: number
  MatterReference: string | null
  Status: string | null
  StatusTimestamp: string | null
  CreatedTimestamp: string | null
  ModifiedTimestamp: string | null
  MatterType: string | null
  AssignedTo: string | null
  CurrentStep: string | null
}

export interface KeyDates {
  SettlementDate: string | null
  BuildingPestInspectionDate: string | null
  ContractDate: string | null
  CoolingOffDate: string | null
  UnconditionalDate: string | null | undefined
  FinanceDueDate: string | null
  NotProcDate: string | null
  BookingDate: string | null
}

export interface WhatToBill {
  FixedFee: string | null
  OfferApplied: string | null
  DiscountOffered: string | null
  PrivColl: string | null
  AdditionalInformation: string | null
  SettlementPlatform?: string | null //old not Konekta
}

export interface DebitRecovery {
  ContractTerminated: boolean | null | undefined
  NewSmtDateQ: boolean | null | undefined
  Cancelled: string | null | undefined
  CancellationReason: string | null | undefined
  IsMatterCancelled: boolean | null | undefined
  DateTimeSmtDelay: string | null | undefined
  ContractTerminationReason: string | null | undefined
}

export interface TransactionDetails {
  PurchasePrice: string | null | undefined
  ConveyancingType: string | null | undefined
  IsMovingIn: string | null | undefined
}

export interface PropertyDetails {
  PropertyTenantsRemaining: boolean | null | undefined
  PropertyUse: string | null | undefined
}

export interface ContractDetails {
  MovingDate: string | null | undefined //(NSW Buyer - not Konekta)
}

export interface PttyDetails {
  Mortgage: string | null | undefined //(NSW Buyer - not Konekta)
}

export interface PropertyAddress {
  PropertyType: string | null | undefined
  Postcode: string | null | undefined
  State: string | null | undefined
  StreetName: string | null | undefined
  StreetNumber: string | null | undefined
  StreetType: string | null | undefined
  Suburb: string | null | undefined
  Unit: string | null | undefined
}

export type DataCollectionNameKey = {
  [key: string]: string | null | undefined
}

export interface MatterTask {
  ID: number
  TaskName: string | null
  Status: string | null
  CreatedTimestamp: string | null
  ActionID: number
  LastModifiedTimestamp: string | null
  Priority: string | null
  AssignedBy: string | null
  Description: string | null
  DueDate: string | null
  StartedTimestamp: string | null
  CompletedTimestamp: string | null
}
const fixDate = (xdate: string | null | undefined): string | null => {
  if (!xdate) {
    return null
  }
  const [retDate] = xdate.split('|')
  const t = new Date(retDate)
  const isValidDate = t instanceof Date && !isNaN(t.getTime())
  return isValidDate ? retDate : null
}

export const mapToKeyDates = (rawData: DataCollectionNameKey): KeyDates => {
  return {
    SettlementDate: fixDate(rawData?.smtdateonly),
    BuildingPestInspectionDate: fixDate(rawData?.bpdate),
    ContractDate: fixDate(rawData?.kdate),
    CoolingOffDate: fixDate(rawData?.cooloffdate),
    UnconditionalDate: fixDate(rawData?.uncondate),
    FinanceDueDate: fixDate(rawData?.findate),
    NotProcDate: fixDate(rawData?.notprocdate),
    BookingDate: fixDate(rawData?.kreviewbookdate),
  }
}

export const mapToWhatToBill = (
  rawData: DataCollectionNameKey,
): WhatToBill => ({
  FixedFee: rawData?.FixedFee ?? null,
  OfferApplied: rawData?.OfferApplied ?? null,
  DiscountOffered: rawData?.DiscountOffered ?? null,
  PrivColl: rawData?.PrivColl ?? null,
  AdditionalInformation: rawData?.AdditionalInfo ?? null,
  SettlementPlatform: rawData?.SettlementPlatform ?? null,
})

export const mapToPropertyAddress = (
  rawData: DataCollectionNameKey,
): PropertyAddress => ({
  PropertyType: rawData?.PropertyType ?? null,
  Postcode: rawData?.Postcode ?? null,
  State: rawData?.State ?? null,
  StreetName: rawData?.StreetName ?? null,
  StreetNumber: rawData?.StreetNumber ?? null,
  StreetType: rawData?.StreetType ?? null,
  Suburb: rawData?.Suburb ?? null,
  Unit: rawData?.Unit ?? null,
})

export const mapToTransactionDetails = (
  rawData: DataCollectionNameKey,
): TransactionDetails => {
  const xdata =
    rawData?.investment_property ?? rawData?.PrimaryResidence ?? null

  return {
    PurchasePrice: rawData?.purprice ?? null,
    ConveyancingType: rawData?.ConveyType ?? null,
    IsMovingIn:
      xdata?.toLowerCase() == 'yes' ||
      xdata?.toLowerCase() == 'with vacant possession - purchaser moving in'
        ? 'yes'
        : xdata?.toLowerCase() == 'no'
          ? 'no'
          : null,
  }
}

export const mapToDebitRecovery = (
  rawData: DataCollectionNameKey,
): DebitRecovery => ({
  ContractTerminated:
    rawData?.ContractTerminated?.toLowerCase() == 'yes' ? true : false,
  NewSmtDateQ:
    rawData?.NewSmtDateQ?.toLowerCase() == 'yes'
      ? true
      : rawData?.NewSmtDateQ?.toLowerCase() == 'no'
        ? false
        : null,
  Cancelled: rawData?.DateCancelled ?? null,
  CancellationReason: rawData?.CancellationReason ?? null,
  IsMatterCancelled:
    rawData?.MatterCancelled?.toLowerCase() == 'yes' ? true : false,
  DateTimeSmtDelay: rawData?.DateTimeSmtDelay ?? null,
  ContractTerminationReason: rawData?.ContractTerminationReason ?? null,
})

export const mapToPropertyDetails = (
  rawData: DataCollectionNameKey,
): PropertyDetails => ({
  PropertyTenantsRemaining:
    rawData?.tenantprop?.toLowerCase() == 'on' ? true : false,
  PropertyUse: rawData?.UseOfProp ?? null,
})

export const mapToContractDetails = (
  rawData: DataCollectionNameKey,
): ContractDetails => ({
  MovingDate: rawData?.MoveinDate ?? null,
})

export const mapToPttyDetails = (
  rawData: DataCollectionNameKey,
): PttyDetails => ({
  Mortgage: rawData?.MortgageStatus ?? null,
})
