import {
  groupMatterCollectionRecordsInJsonFormat,
  mapToContractDetails,
  mapToDebitRecovery,
  mapToKeyDates,
  mapToPropertyAddress,
  mapToPropertyDetails,
  mapToPttyDetails,
  mapToTransactionDetails,
  mapToWhatToBill,
  type matterCollectionRecords,
} from './matter.collections'

export const processDatalakeActionstepJob = (
  matterCollections: matterCollectionRecords[],
) => {
  const res = groupMatterCollectionRecordsInJsonFormat(matterCollections)
  const keydates = mapToKeyDates(res?.['keydates'])
  const whatToBill = mapToWhatToBill(res?.['engage'])
  const propertyAddress = mapToPropertyAddress(res?.['PttyAddress'])
  const transactionDetails = mapToTransactionDetails(res?.['convdet'])
  const debtRecovery = mapToDebitRecovery(res?.['DebtRecovery'])
  const propertyDetails = mapToPropertyDetails(res?.['property'])
  const contractDetails = mapToContractDetails(res?.['contract'])
  const pttyDetails = mapToPttyDetails(res?.['PttyDetails'])

  return {
    keydates,
    whatToBill,
    propertyAddress,
    transactionDetails,
    debtRecovery,
    propertyDetails,
    contractDetails,
    pttyDetails,
  }
}
