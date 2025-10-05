export const brandId = {
  CCA: 1,
}

export const dataSourceTypeId = {
  MatterUpdate: process.env.APP_ENV === 'prod' ? 247 : 29,
}

export const DatalakeStatus = {
  processing: 'P',
  processingFailed: 'F',
  processingSuccess: 'S',
  dataInputCreated: 'N',
  notProcessed: 'D',
  publishingSuccess: 'C',
  publishingFailed: 'K',
  publishing: 'I',
} as const

export type DataInputStatus =
  (typeof DatalakeStatus)[keyof typeof DatalakeStatus]

export const datalakeLeadStatus = {
  new: 1,
  alreadyExists: 2,
  correction: 3,
}
