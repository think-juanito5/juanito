import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  numeric,
  bigint,
  jsonb,
  json,
  index,
  date,
  doublePrecision,
  text,
  real,
  smallint,
  time,
  bigserial,
  uuid,
  serial,
  unique,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const brand = pgTable('Brand', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  isDbc: boolean('IsDbc'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const addressHistory = pgTable('AddressHistory', {
  id: integer('ID'),
  fullAddress: varchar('FullAddress'),
  unitNo: varchar('UnitNo', { length: 10 }),
  streetNo: varchar('StreetNo', { length: 10 }),
  streetName: varchar('StreetName', { length: 150 }),
  streetType: varchar('StreetType', { length: 20 }),
  suburb: varchar('Suburb', { length: 100 }),
  city: varchar('City', { length: 150 }),
  stateId: integer('StateID'),
  localCouncil: varchar('LocalCouncil', { length: 255 }),
  postcode: varchar('Postcode', { length: 10 }),
  countryId: integer('CountryID'),
  latitude: numeric('Latitude'),
  longitude: numeric('Longitude'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const btrPropertyHelperApplication = pgTable(
  'BtrPropertyHelperApplication',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    firstName: varchar('FirstName', { length: 100 }),
    lastName: varchar('LastName', { length: 100 }),
    email: varchar('Email', { length: 255 }),
    mobile: varchar('Mobile', { length: 20 }),
    requestData: jsonb('RequestData'),
    responseCode: integer('ResponseCode'),
    responseData: jsonb('ResponseData'),
    movingHubReferenceCode: varchar('MovingHubReferenceCode', { length: 20 }),
    movingHubCustomerId: varchar('MovingHubCustomerID', { length: 20 }),
    applicationStatus: integer('ApplicationStatus'),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
    segment: varchar('Segment', { length: 100 }),
    matterId: varchar('MatterID', { length: 100 }),
    version: integer('Version'),
  },
)

export const businessHistory = pgTable('BusinessHistory', {
  id: integer('ID'),
  abn: varchar('ABN', { length: 11 }),
  acn: varchar('ACN', { length: 9 }),
  businessTypeId: integer('BusinessTypeID'),
  addressId: integer('AddressID'),
  name: varchar('Name', { length: 100 }),
  location: varchar('Location', { length: 100 }),
  phone: varchar('Phone', { length: 20 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const businessUserHistory = pgTable('BusinessUserHistory', {
  id: integer('ID'),
  userId: integer('UserID'),
  businessId: integer('BusinessID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const business = pgTable('Business', {
  id: integer('ID').primaryKey().notNull(),
  abn: varchar('ABN', { length: 11 }),
  acn: varchar('ACN', { length: 9 }),
  businessTypeId: integer('BusinessTypeID').references(() => businessType.id),
  addressId: integer('AddressID').references(() => address.id),
  name: varchar('Name', { length: 100 }),
  location: varchar('Location', { length: 100 }),
  phone: varchar('Phone', { length: 20 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const contractDraft = pgTable('ContractDraft', {
  id: integer('ID').primaryKey().notNull(),
  transactionServiceId: integer('TransactionServiceID').notNull(),
  contractData: json('ContractData'),
})

export const addressType = pgTable('AddressType', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const conveyancingPartyHistory = pgTable('ConveyancingPartyHistory', {
  id: integer('ID'),
  conveyancingServiceId: integer('ConveyancingServiceID'),
  userId: integer('UserID'),
  businessId: integer('BusinessID'),
  roleId: integer('RoleID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const conveyancingPayment = pgTable('ConveyancingPayment', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).notNull(),
  matterId: integer('MatterID'),
  matterReference: varchar('MatterReference', { length: 50 }),
  customerToken: varchar('CustomerToken', { length: 255 }),
  paymentMethodToken: varchar('PaymentMethodToken', { length: 255 }),
  amount: numeric('Amount'),
  email: varchar('Email', { length: 255 }),
  invoiceNumber: varchar('InvoiceNumber', { length: 255 }),
  paymentType: varchar('PaymentType', { length: 10 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  version: integer('Version'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  customerName: varchar('CustomerName', { length: 255 }),
})

export const address = pgTable('Address', {
  id: integer('ID').primaryKey().notNull(),
  fullAddress: varchar('FullAddress'),
  unitNo: varchar('UnitNo', { length: 100 }),
  streetNo: varchar('StreetNo', { length: 100 }),
  streetName: varchar('StreetName', { length: 150 }),
  streetType: varchar('StreetType', { length: 20 }),
  suburb: varchar('Suburb', { length: 100 }),
  city: varchar('City', { length: 150 }),
  stateId: integer('StateID').references(() => state.id),
  localCouncil: varchar('LocalCouncil', { length: 255 }),
  postcode: varchar('Postcode', { length: 10 }),
  countryId: integer('CountryID').references(() => country.id),
  latitude: numeric('Latitude'),
  longitude: numeric('Longitude'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const businessType = pgTable('BusinessType', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const businessUser = pgTable('BusinessUser', {
  id: integer('ID').primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  businessId: integer('BusinessID').references(() => business.id),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const conveyancingParty = pgTable(
  'ConveyancingParty',
  {
    id: integer('ID').primaryKey().notNull(),
    conveyancingServiceId: integer('ConveyancingServiceID').references(
      () => conveyancingService.id,
    ),
    userId: integer('UserID').references(() => userProfile.id),
    businessId: integer('BusinessID').references(() => business.id),
    roleId: integer('RoleID').references(() => role.id),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    dataId: bigint('DataID', { mode: 'number' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
    version: integer('Version'),
    actionStepId: integer('ActionStepID'),
    firstName: varchar('FirstName', { length: 100 }),
    lastName: varchar('LastName', { length: 150 }),
    displayName: varchar('DisplayName', { length: 255 }),
    mobile: varchar('Mobile', { length: 20 }),
    homePhone: varchar('HomePhone', { length: 20 }),
    workPhone: varchar('WorkPhone', { length: 20 }),
    isBusiness: boolean('IsBusiness'),
    clientConsent: boolean('ClientConsent'),
    email: varchar('Email', { length: 255 }),
    clientConsentMyConnect: boolean('ClientConsentMyConnect'),
  },
  (table) => {
    return {
      conveyancingpartyConveyancingserviceidIdx: index(
        'conveyancingparty_conveyancingserviceid_idx',
      ).on(table.conveyancingServiceId),
    }
  },
)

export const conveyancingPaymentHistory = pgTable(
  'ConveyancingPaymentHistory',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    matterId: integer('MatterID'),
    matterReference: varchar('MatterReference', { length: 50 }),
    customerToken: varchar('CustomerToken', { length: 255 }),
    paymentMethodToken: varchar('PaymentMethodToken', { length: 255 }),
    amount: numeric('Amount'),
    email: varchar('Email', { length: 255 }),
    invoiceNumber: varchar('InvoiceNumber', { length: 255 }),
    paymentType: varchar('PaymentType', { length: 10 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    dataId: bigint('DataID', { mode: 'number' }),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
    customerName: varchar('CustomerName', { length: 255 }),
  },
)

export const conveyancingServiceHistory = pgTable(
  'ConveyancingServiceHistory',
  {
    id: integer('ID'),
    transactionServiceId: integer('TransactionServiceID'),
    matterId: integer('MatterID'),
    assignedTo: varchar('AssignedTo', { length: 255 }),
    propertyId: integer('PropertyID'),
    isMovingIn: boolean('IsMovingIn'),
    mortgage: varchar('Mortgage', { length: 255 }),
    buildingPestInspectionDate: date('BuildingPestInspectionDate'),
    settlementDate: date('SettlementDate'),
    created: timestamp('Created', { mode: 'string' }),
    completed: timestamp('Completed', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    dataId: bigint('DataID', { mode: 'number' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
    matterReference: varchar('MatterReference', { length: 50 }),
    offerApplied: varchar('OfferApplied', { length: 50 }),
    offerDiscount: doublePrecision('OfferDiscount'),
    status: varchar('Status'),
    additionalInformation: text('AdditionalInformation'),
    contractDate: timestamp('ContractDate', { mode: 'string' }),
    currentStep: varchar('CurrentStep'),
    coolingOffDate: timestamp('CoolingOffDate', { mode: 'string' }),
    movingDate: timestamp('MovingDate', { mode: 'string' }),
    matterType: varchar('MatterType', { length: 100 }),
    purchasePrice: real('PurchasePrice'),
    settlementPlatform: varchar('SettlementPlatform', { length: 100 }),
    matterCreated: timestamp('MatterCreated', { mode: 'string' }),
    matterUpdated: timestamp('MatterUpdated', { mode: 'string' }),
    unconditionalDate: date('UnconditionalDate'),
    financeDueDate: date('FinanceDueDate'),
    matterTerminated: boolean('MatterTerminated'),
    contractTerminated: boolean('ContractTerminated'),
    newSettlementDateAvailable: boolean('NewSettlementDateAvailable'),
    dateTimeSmtDelay: timestamp('DateTimeSmtDelay', { mode: 'string' }),
    isSettlementOverdue: boolean('IsSettlementOverdue'),
    bookingDate: timestamp('BookingDate', { mode: 'string' }),
    privColl: boolean('PrivColl').default(false),
    propertyUse: varchar('PropertyUse', { length: 200 }),
    propertyTenantsRemaining: boolean('PropertyTenantsRemaining'),
    isMatterCancelled: boolean('IsMatterCancelled').default(false).notNull(),
    cancelled: date('Cancelled'),
    cancellationReason: text('CancellationReason'),
    terminated: date('Terminated'),
    terminationReason: text('TerminationReason'),
  },
)

export const conveyancingService = pgTable('ConveyancingService', {
  id: integer('ID').primaryKey().notNull(),
  transactionServiceId: integer('TransactionServiceID').references(
    () => transactionService.id,
  ),
  matterId: integer('MatterID'),
  assignedTo: varchar('AssignedTo', { length: 255 }),
  propertyId: integer('PropertyID'),
  isMovingIn: boolean('IsMovingIn'),
  mortgage: varchar('Mortgage', { length: 255 }),
  buildingPestInspectionDate: date('BuildingPestInspectionDate'),
  settlementDate: date('SettlementDate'),
  created: timestamp('Created', { mode: 'string' }),
  completed: timestamp('Completed', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
  matterReference: varchar('MatterReference', { length: 50 }),
  offerApplied: varchar('OfferApplied', { length: 50 }),
  offerDiscount: doublePrecision('OfferDiscount'),
  status: varchar('Status'),
  additionalInformation: text('AdditionalInformation'),
  contractDate: timestamp('ContractDate', { mode: 'string' }),
  currentStep: varchar('CurrentStep'),
  coolingOffDate: timestamp('CoolingOffDate', { mode: 'string' }),
  movingDate: date('MovingDate'),
  matterType: varchar('MatterType', { length: 100 }),
  purchasePrice: real('PurchasePrice'),
  settlementPlatform: varchar('SettlementPlatform', { length: 100 }),
  matterCreated: date('MatterCreated'),
  matterUpdated: timestamp('MatterUpdated', { mode: 'string' }),
  unconditionalDate: date('UnconditionalDate'),
  financeDueDate: date('FinanceDueDate'),
  contractTerminated: boolean('ContractTerminated'),
  matterTerminated: boolean('MatterTerminated'),
  newSettlementDateAvailable: boolean('NewSettlementDateAvailable'),
  dateTimeSmtDelay: timestamp('DateTimeSmtDelay', { mode: 'string' }),
  isSettlementOverdue: boolean('IsSettlementOverdue'),
  bookingDate: timestamp('BookingDate', { mode: 'string' }),
  privColl: boolean('PrivColl').default(false),
  propertyUse: varchar('PropertyUse', { length: 200 }),
  propertyTenantsRemaining: boolean('PropertyTenantsRemaining'),
  isMatterCancelled: boolean('IsMatterCancelled'),
  cancelled: date('Cancelled'),
  cancellationReason: text('CancellationReason'),
  terminated: date('Terminated'),
  terminationReason: text('TerminationReason'),
})

export const conveyancingTask2 = pgTable('ConveyancingTask2', {
  id: integer('ID').primaryKey().notNull(),
  actionStepTaskId: integer('ActionStepTaskID'),
  conveyancingServiceId: integer('ConveyancingServiceID'),
  assignedTo: varchar('AssignedTo'),
  completedOn: timestamp('CompletedOn', { mode: 'string' }),
  dueDate: timestamp('DueDate', { mode: 'string' }),
  name: varchar('Name', { length: 255 }),
  priority: varchar('Priority', { length: 50 }),
  status: varchar('Status', { length: 50 }),
  step: varchar('Step', { length: 255 }),
  dataId: integer('DataID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const dataPartnerCategory = pgTable('DataPartnerCategory', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  displayName: varchar('DisplayName', { length: 150 }),
  created: timestamp('Created', { mode: 'string' }).defaultNow(),
  updated: timestamp('Updated', { mode: 'string' }).defaultNow(),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const dataPartnerPostcode = pgTable('DataPartnerPostcode', {
  id: integer('ID').primaryKey().notNull(),
  dataPartnerStateId: integer('DataPartnerStateID').references(
    () => dataPartnerState.id,
  ),
  canService: boolean('CanService'),
  postcode: varchar('Postcode', { length: 10 }),
  created: timestamp('Created', { mode: 'string' }).defaultNow(),
  updated: timestamp('Updated', { mode: 'string' }).defaultNow(),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const dataPartner = pgTable('DataPartner', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  displayName: varchar('DisplayName', { length: 150 }),
  isDataSharingEnabled: boolean('IsDataSharingEnabled')
    .default(false)
    .notNull(),
  dataSharingStartDate: timestamp('DataSharingStartDate', { mode: 'string' }),
  dataSharingEndDate: timestamp('DataSharingEndDate', { mode: 'string' }),
  destinationUrl: varchar('DestinationURL', { length: 255 }),
  folderPath: varchar('FolderPath', { length: 255 }),
  apiKey: varchar('ApiKey', { length: 255 }),
  authToken: varchar('AuthToken', { length: 255 }),
  refreshToken: varchar('RefreshToken', { length: 255 }),
  username: varchar('Username', { length: 255 }),
  password: varchar('Password', { length: 255 }),
  lastRunDate: timestamp('LastRunDate', { mode: 'string' }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  dataPartnerCategoryId: integer('DataPartnerCategoryID').references(
    () => dataPartnerCategory.id,
  ),
  lastRunDataLmit: smallint('LastRunDataLmit'),
})

export const dataInput = pgTable('DataInput', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  sourceId: integer('SourceID').references(() => dataSource.id),
  data: jsonb('Data'),
  status: varchar('Status', { length: 1 }),
  sourceIpAddress: varchar('SourceIPAddress', { length: 40 }),
  isTest: boolean('IsTest'),
  created: timestamp('Created', { mode: 'string' }),
  startedProcessing: timestamp('StartedProcessing', { mode: 'string' }),
  completedProcessing: timestamp('CompletedProcessing', { mode: 'string' }),
  startedPublishing: timestamp('StartedPublishing', { mode: 'string' }),
  completedPublishing: timestamp('CompletedPublishing', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
})

export const dataSharingMyConnectLog = pgTable('DataSharingMyConnectLog', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  dataSharingCcaClientSegmentId: integer(
    'DataSharingCCAClientSegmentID',
  ).references(() => dataSharingCcaClientSegments.id),
  dataPartnerId: integer('DataPartnerID'),
  firstName: varchar('FirstName', { length: 100 }),
  lastName: varchar('LastName', { length: 150 }),
  mobile: varchar('Mobile', { length: 20 }),
  homePhone: varchar('HomePhone', { length: 20 }),
  workPhone: varchar('WorkPhone', { length: 20 }),
  email: varchar('Email', { length: 255 }),
  settlementDate: timestamp('SettlementDate', { mode: 'string' }),
  unitNo: varchar('UnitNo', { length: 100 }),
  streetNo: varchar('StreetNo', { length: 255 }),
  streetName: varchar('StreetName', { length: 255 }),
  streetType: varchar('StreetType', { length: 200 }),
  suburb: varchar('Suburb', { length: 255 }),
  postcode: varchar('Postcode', { length: 10 }),
  state: varchar('State', { length: 5 }),
  assignedTo: varchar('AssignedTo', { length: 255 }),
  segment: varchar('Segment', { length: 100 }),
  transferId: varchar('TransferID', { length: 20 }),
  transferType: varchar('TransferType', { length: 20 }),
  transferStatus: varchar('TransferStatus', { length: 20 }),
  transferReason: varchar('TransferReason', { length: 255 }),
  transferTime: timestamp('TransferTime', { mode: 'string' }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  matterId: integer('MatterID'),
})

export const dataSharingTintPaintLog = pgTable('DataSharingTintPaintLog', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  userProfileId: bigint('UserProfileID', { mode: 'number' }).references(
    () => userProfile.id,
  ),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  transactionServiceId: bigint('TransactionServiceID', {
    mode: 'number',
  }).references(() => transactionService.id),
  dataSharingCcaLeadSegmentId: integer('DataSharingCCALeadSegmentID')
    .references(() => dataSharingCcaClientSegments.id)
    .references(() => dataSharingCcaLeadSegments.id),
  dataSharingCcaClientSegmentId: integer('DataSharingCCAClientSegmentID'),
  matterId: integer('MatterID'),
  dataPartnerId: integer('DataPartnerID').references(() => dataPartner.id),
  firstName: varchar('FirstName', { length: 100 }),
  mobile: varchar('Mobile', { length: 20 }),
  homePhone: varchar('HomePhone', { length: 20 }),
  workPhone: varchar('WorkPhone', { length: 20 }),
  email: varchar('Email', { length: 255 }),
  timeToTransact: varchar('TimeToTransact', { length: 100 }),
  propertyType: varchar('PropertyType', { length: 100 }),
  settlementDate: timestamp('SettlementDate', { mode: 'string' }),
  unitNo: varchar('UnitNo', { length: 100 }),
  streetNo: varchar('StreetNo', { length: 255 }),
  streetName: varchar('StreetName', { length: 255 }),
  streetType: varchar('StreetType', { length: 200 }),
  suburb: varchar('Suburb', { length: 255 }),
  postcode: varchar('Postcode', { length: 10 }),
  state: varchar('State', { length: 5 }),
  assignedTo: varchar('AssignedTo', { length: 255 }),
  segment: varchar('Segment', { length: 100 }),
  segmentDate: timestamp('SegmentDate', { mode: 'string' }),
  transferId: varchar('TransferID', { length: 20 }),
  transferType: varchar('TransferType', { length: 20 }),
  transferStatus: varchar('TransferStatus', { length: 20 }),
  transferReason: varchar('TransferReason', { length: 255 }),
  transferTime: timestamp('TransferTime', { mode: 'string' }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const documentType = pgTable('DocumentType', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const dataSharingCcaLeadSegments = pgTable(
  'DataSharingCCALeadSegments',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
    leadId: integer('LeadID').references(() => leads.id),
    transactionServiceId: integer('TransactionServiceID').references(
      () => transactionService.id,
    ),
    userId: integer('UserID').references(() => userProfile.id),
    segment: varchar('Segment', { length: 100 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    dataId: bigint('DataID', { mode: 'number' }),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
  },
)

export const dataSourceHistory = pgTable('DataSourceHistory', {
  id: integer('ID'),
  sourceName: varchar('SourceName', { length: 100 }),
  subSource: varchar('SubSource', { length: 100 }),
  sourceCategory: varchar('SourceCategory', { length: 100 }),
  isDbc: boolean('IsDBC'),
  access: jsonb('Access'),
  dataPriority: jsonb('DataPriority'),
  dataClassification: varchar('DataClassification', { length: 1 }),
  isEnabled: boolean('IsEnabled'),
  isProcessingEnabled: boolean('IsProcessingEnabled'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const developerLog = pgTable('DeveloperLog', {
  id: integer('ID').primaryKey().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  attributes: jsonb('Attributes'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const fclPropertyHelperApplication = pgTable(
  'FclPropertyHelperApplication',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    firstName: varchar('FirstName', { length: 100 }),
    lastName: varchar('LastName', { length: 100 }),
    email: varchar('Email', { length: 255 }),
    mobile: varchar('Mobile', { length: 20 }),
    requestData: jsonb('RequestData'),
    responseCode: integer('ResponseCode'),
    responseData: jsonb('ResponseData'),
    movingHubReferenceCode: varchar('MovingHubReferenceCode', { length: 20 }),
    movingHubCustomerId: varchar('MovingHubCustomerID', { length: 20 }),
    applicationStatus: integer('ApplicationStatus'),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
    segment: varchar('Segment', { length: 100 }),
    matterId: varchar('MatterID', { length: 100 }),
    version: integer('Version'),
  },
)

export const dataSharingCcaClientSegments = pgTable(
  'DataSharingCCAClientSegments',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
    conveyancingPartyId: integer('ConveyancingPartyID').references(
      () => conveyancingParty.id,
    ),
    userId: integer('UserID').references(() => userProfile.id),
    segment: varchar('Segment', { length: 100 }),
    created: timestamp('Created', { mode: 'string' }).defaultNow(),
    updated: timestamp('Updated', { mode: 'string' }).defaultNow(),
    deleted: timestamp('Deleted', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    dataId: bigint('DataID', { mode: 'number' }),
    conveyancingServiceId: integer('ConveyancingServiceID').references(
      () => conveyancingService.id,
    ),
  },
)

export const dataSource = pgTable('DataSource', {
  id: integer('ID').primaryKey().notNull(),
  sourceName: varchar('SourceName', { length: 100 }),
  subSource: varchar('SubSource', { length: 100 }),
  sourceCategory: varchar('SourceCategory', { length: 100 }),
  isDbc: boolean('IsDBC'),
  access: jsonb('Access'),
  dataPriority: jsonb('DataPriority'),
  dataClassification: varchar('DataClassification', { length: 1 }),
  isEnabled: boolean('IsEnabled'),
  isProcessingEnabled: boolean('IsProcessingEnabled'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
  doAutodial: boolean('DoAutodial').default(false).notNull(),
})

export const formitizeJobType = pgTable('FormitizeJobType', {
  id: integer('ID').primaryKey().notNull(),
  serviceTypeId: integer('ServiceTypeID').references(() => serviceType.id),
  stateId: integer('StateID').references(() => state.id),
  jobType: varchar('JobType', { length: 255 }),
  forms: jsonb('Forms'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const gender = pgTable('Gender', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const formitizeLog = pgTable('FormitizeLog', {
  id: integer('ID').notNull(),
  inspectionServiceId: integer('InspectionServiceID').references(
    () => inspectionService.id,
  ),
  transactionServiceId: integer('TransactionServiceID').references(
    () => transactionService.id,
  ),
  requestType: varchar('RequestType', { length: 100 }),
  requestStatus: varchar('RequestStatus', { length: 100 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  attributes: jsonb('Attributes'),
  response: jsonb('Response'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const gotoAuth = pgTable('GotoAuth', {
  id: integer('ID').primaryKey().notNull(),
  token: text('Token'),
  expire: integer('Expire'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const gotoDisposition = pgTable('GotoDisposition', {
  id: integer('ID').primaryKey().notNull(),
  causeCode: integer('CauseCode'),
  cause: varchar('Cause', { length: 200 }),
  definition: text('Definition'),
  created: timestamp('Created', { mode: 'string' }),
})

export const gotoImportLog = pgTable('GotoImportLog', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  organisationId: varchar('OrganisationID', { length: 20 }),
  queryStartTime: timestamp('QueryStartTime', { mode: 'string' }),
  queryEndTime: timestamp('QueryEndTime', { mode: 'string' }),
  runTime: timestamp('RunTime', { mode: 'string' }),
  type: varchar('Type', { length: 20 }),
  created: timestamp('Created', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const leadStatus = pgTable('LeadStatus', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const inspectionServiceHistory = pgTable('InspectionServiceHistory', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).notNull(),
  transactionServiceId: integer('TransactionServiceID'),
  propertyId: integer('PropertyID'),
  serviceTypeId: integer('ServiceTypeID'),
  crmStaffName: varchar('CrmStaffName', { length: 255 }),
  assignedTo: varchar('AssignedTo', { length: 255 }),
  consent: varchar('Consent', { length: 100 }),
  confirmed: boolean('Confirmed'),
  inspectionDate: date('InspectionDate'),
  inspectionTime: time('InspectionTime'),
  jobNumber: varchar('JobNumber', { length: 255 }),
  carParking: boolean('CarParking'),
  agentName: varchar('AgentName', { length: 255 }),
  agentPhone: varchar('AgentPhone', { length: 100 }),
  reportSent: varchar('ReportSent', { length: 20 }),
  taxDepreciationFu: boolean('TaxDepreciationFU'),
  buildingStageInspection: varchar('BuildingStageInspection', { length: 255 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  reportPurchase: numeric('ReportPurchase'),
  clientInstructions: text('ClientInstructions'),
  paymentStatus: varchar('PaymentStatus', { length: 20 }),
  dateOfAcceptance: date('DateOfAcceptance'),
  methTest: boolean('MethTest'),
  isCommercialAddress: boolean('IsCommercialAddress'),
})

export const leadCampaignTrigger = pgTable('LeadCampaignTrigger', {
  id: integer('ID').primaryKey().notNull(),
  brandId: integer('BrandID'),
  trigger: varchar('Trigger', { length: 30 }),
  campaign: varchar('Campaign', { length: 200 }),
  isEnabled: boolean('IsEnabled'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const leadSourceCategory = pgTable('LeadSourceCategory', {
  id: integer('ID').primaryKey().notNull(),
  brandId: integer('BrandID'),
  category: varchar('Category', { length: 200 }),
  source: varchar('Source', { length: 200 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const inspectionService = pgTable('InspectionService', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  transactionServiceId: integer('TransactionServiceID').references(
    () => transactionService.id,
  ),
  propertyId: integer('PropertyID'),
  serviceTypeId: integer('ServiceTypeID'),
  crmStaffName: varchar('CrmStaffName', { length: 255 }),
  assignedTo: varchar('AssignedTo', { length: 255 }),
  consent: varchar('Consent', { length: 100 }),
  confirmed: boolean('Confirmed'),
  inspectionDate: date('InspectionDate'),
  inspectionTime: time('InspectionTime'),
  jobNumber: varchar('JobNumber', { length: 255 }),
  carParking: boolean('CarParking'),
  agentName: varchar('AgentName', { length: 255 }),
  agentPhone: varchar('AgentPhone', { length: 100 }),
  reportSent: varchar('ReportSent', { length: 20 }),
  taxDepreciationFu: boolean('TaxDepreciationFU'),
  buildingStageInspection: varchar('BuildingStageInspection', { length: 255 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  version: integer('Version'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  reportPurchase: numeric('ReportPurchase'),
  clientInstructions: text('ClientInstructions'),
  paymentStatus: varchar('PaymentStatus', { length: 20 }),
  dateOfAcceptance: date('DateOfAcceptance'),
  methTest: boolean('MethTest'),
  isCommercialAddress: boolean('IsCommercialAddress'),
})

export const marketingUserSegments = pgTable('MarketingUserSegments', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  conveyancingPartyId: integer('ConveyancingPartyID').references(
    () => conveyancingParty.id,
  ),
  conveyancingServiceId: integer('ConveyancingServiceID').references(
    () => conveyancingService.id,
  ),
  userId: integer('UserID').references(() => userProfile.id),
  segment: varchar('Segment', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }).defaultNow(),
  updated: timestamp('Updated', { mode: 'string' }).defaultNow(),
  deleted: timestamp('Deleted', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
})

export const listingHistory = pgTable('ListingHistory', {
  id: integer('ID'),
  propertyId: integer('PropertyID'),
  agentId: integer('AgentID'),
  appearanceDate: timestamp('AppearanceDate', { mode: 'string' }),
  publicationDate: timestamp('PublicationDate', { mode: 'string' }),
  description: text('Description '),
  listingType: varchar('ListingType'),
  priceDescription: varchar('PriceDescription', { length: 150 }),
  priceFrom: numeric('PriceFrom'),
  priceTo: numeric('PriceTo'),
  listingCategory: varchar('ListingCategory', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const maritalStatus = pgTable('MaritalStatus', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const milestoneHistory = pgTable(
  'MilestoneHistory',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    transactionServiceId: integer('TransactionServiceID'),
    propertyId: integer('PropertyID'),
    conveyancingServiceId: integer('ConveyancingServiceID'),
    conveyancingTaskId: integer('ConveyancingTaskID'),
    milestoneTypeId: integer('MilestoneTypeID').notNull(),
    buildingServiceId: integer('BuildingServiceID'),
    isMilestoneComplete: boolean('IsMilestoneComplete'),
    keyDate: timestamp('KeyDate', { mode: 'string' }),
    otoListingId: integer('OtoListingID'),
    otoBuyerId: integer('OtoBuyerID'),
    otoOfferId: integer('OtoOfferID'),
    otoNotificationRequestTime: timestamp('OtoNotificationRequestTime', {
      mode: 'string',
    }),
    milestoneCreated: timestamp('MilestoneCreated', { mode: 'string' }),
    milestoneUpdated: timestamp('MilestoneUpdated', { mode: 'string' }),
    otoNotificationRequestId: varchar('OtoNotificationRequestID', {
      length: 20,
    }),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    delete: timestamp('Delete', { mode: 'string' }),
    dataId: integer('DataID').notNull(),
    pastKeyDate: timestamp('PastKeyDate', { mode: 'string' }),
    isOverdue: boolean('IsOverdue'),
    rbiDate: timestamp('RbiDate', { mode: 'string' }),
  },
  (table) => {
    return {
      milestonehistoryConveyancingserviceidIdx: index(
        'milestonehistory_conveyancingserviceid_index',
      ).on(table.conveyancingServiceId),
      milestonehistoryConveyancingtaskidIdx: index(
        'milestonehistory_conveyancingtaskid_index',
      ).on(table.conveyancingTaskId),
      milestonehistoryMilestonetypeidIdx: index(
        'milestonehistory_milestonetypeid_index',
      ).on(table.milestoneTypeId),
      milestonehistoryPropertyidIdx: index(
        'milestonehistory_propertyid_index',
      ).on(table.propertyId),
      milestonehistoryTransactionserviceidIdx: index(
        'milestonehistory_transactionserviceid_index',
      ).on(table.transactionServiceId),
    }
  },
)

export const milestone = pgTable(
  'Milestone',
  {
    id: bigserial('ID', { mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    transactionServiceId: bigint('TransactionServiceID', {
      mode: 'number',
    }).references(() => transactionService.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    propertyId: bigint('PropertyID', { mode: 'number' }).references(
      () => property.id,
    ),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conveyancingServiceId: bigint('ConveyancingServiceID', {
      mode: 'number',
    }).references(() => conveyancingService.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conveyancingTaskId: bigint('ConveyancingTaskID', {
      mode: 'number',
    }).references(() => conveyancingTask.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    milestoneTypeId: bigint('MilestoneTypeID', { mode: 'number' })
      .notNull()
      .references(() => milestoneType.id),
    buildingServiceId: integer('BuildingServiceID'),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    delete: timestamp('Delete', { mode: 'string' }),
    dataId: integer('DataID'),
    isMilestoneComplete: boolean('IsMilestoneComplete'),
    keyDate: timestamp('KeyDate', { mode: 'string' }),
    milestoneCreated: timestamp('MilestoneCreated', { mode: 'string' }),
    milestoneUpdated: timestamp('MilestoneUpdated', { mode: 'string' }),
    pastKeyDate: timestamp('PastKeyDate', { mode: 'string' }),
    isOverdue: boolean('IsOverdue'),
    rbiDate: timestamp('RbiDate', { mode: 'string' }),
  },
  (table) => {
    return {
      milestoneConveyancingserviceidIdx: index(
        'milestone_conveyancingserviceid_index',
      ).on(table.conveyancingServiceId),
      milestoneConveyancingtaskidIdx: index(
        'milestone_conveyancingtaskid_index',
      ).on(table.conveyancingTaskId),
      milestoneMilestonetypeidIdx: index('milestone_milestonetypeid_index').on(
        table.milestoneTypeId,
      ),
      milestonePropertyidIdx: index('milestone_propertyid_index').on(
        table.propertyId,
      ),
      milestoneTransactionserviceidIdx: index(
        'milestone_transactionserviceid_index',
      ).on(table.transactionServiceId),
    }
  },
)

export const listing = pgTable('Listing', {
  id: integer('ID').primaryKey().notNull(),
  propertyId: integer('PropertyID').references(() => property.id),
  agentId: integer('AgentID').references(() => userProfile.id),
  appearanceDate: timestamp('AppearanceDate', { mode: 'string' }),
  publicationDate: timestamp('PublicationDate', { mode: 'string' }),
  description: text('Description '),
  listingType: varchar('ListingType'),
  priceDescription: varchar('PriceDescription', { length: 150 }),
  priceFrom: numeric('PriceFrom'),
  priceTo: numeric('PriceTo'),
  listingCategory: varchar('ListingCategory', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const milestone2 = pgTable(
  'Milestone2',
  {
    id: bigserial('ID', { mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    transactionServiceId: bigint('TransactionServiceID', {
      mode: 'number',
    }).references(() => transactionService.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    propertyId: bigint('PropertyID', { mode: 'number' }).references(
      () => property.id,
    ),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conveyancingServiceId: bigint('ConveyancingServiceID', { mode: 'number' })
      .notNull()
      .references(() => conveyancingService.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conveyancingTaskId: bigint('ConveyancingTaskID', {
      mode: 'number',
    }).references(() => conveyancingTask.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    milestoneTypeId: bigint('MilestoneTypeID', { mode: 'number' })
      .notNull()
      .references(() => milestoneType.id),
    buildingServiceId: integer('BuildingServiceID'),
    isMilestoneComplete: boolean('IsMilestoneComplete'),
    keyDate: timestamp('KeyDate', { mode: 'string' }),
    otoListingId: integer('OtoListingID'),
    otoBuyerId: integer('OtoBuyerID'),
    otoOfferId: integer('OtoOfferID'),
    otoNotificationRequestTime: timestamp('OtoNotificationRequestTime', {
      mode: 'string',
    }),
    milestoneCreated: timestamp('MilestoneCreated', { mode: 'string' }),
    milestoneUpdated: timestamp('MilestoneUpdated', { mode: 'string' }),
    otoNotificationRequestId: varchar('OtoNotificationRequestID', {
      length: 20,
    }),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
    dataId: integer('DataID').notNull(),
    version: integer('Version').notNull(),
  },
  (table) => {
    return {
      milestone2ConveyancingserviceidIdx: index(
        'milestone2_conveyancingserviceid_index',
      ).on(table.conveyancingServiceId),
      milestone2ConveyancingtaskidIdx: index(
        'milestone2_conveyancingtaskid_index',
      ).on(table.conveyancingTaskId),
      milestone2MilestonetypeidIdx: index(
        'milestone2_milestonetypeid_index',
      ).on(table.milestoneTypeId),
      milestone2PropertyidIdx: index('milestone2_propertyid_index').on(
        table.propertyId,
      ),
      milestone2TransactionserviceidIdx: index(
        'milestone2_transactionserviceid_index',
      ).on(table.transactionServiceId),
    }
  },
)

export const milestoneType = pgTable('MilestoneType', {
  id: bigserial('ID', { mode: 'bigint' }).primaryKey().notNull(),
  code: varchar('Code', { length: 10 }).notNull(),
  name: varchar('Name', { length: 255 }).notNull(),
  type: varchar('Type', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  dateField: varchar('DateField'),
  taskName: varchar('TaskName'),
  source: varchar('Source'),
  serviceBusDelayTime: varchar('ServiceBusDelayTime'),
  matterSteps: varchar('MatterSteps'),
})

export const movingHubList = pgTable('MovingHubList', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  mhid: integer('MHID'),
  fieldName: varchar('FieldName', { length: 255 }),
  description: varchar('Description', { length: 255 }),
  isEnabled: boolean('IsEnabled'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const offerCode = pgTable('OfferCode', {
  id: integer('ID').primaryKey().notNull(),
  offerCode: varchar('OfferCode', { length: 150 }),
  offerDescription: varchar('OfferDescription', { length: 255 }),
  brandId: integer('BrandID').references(() => brand.id),
  pipedriveOfferId: integer('PipedriveOfferID'),
  isEnabled: boolean('IsEnabled'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const nicAuth = pgTable('NicAuth', {
  id: integer('ID').primaryKey().notNull(),
  token: text('Token'),
  expire: timestamp('Expire', { mode: 'string' }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const nicList = pgTable('NicList', {
  id: integer('ID').primaryKey().notNull(),
  brandId: integer('BrandID'),
  stateId: integer('StateID'),
  listId: integer('ListID').notNull(),
  skillId: integer('SkillID').notNull(),
  listName: varchar('ListName', { length: 100 }),
  skillName: varchar('SkillName', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  nurtureListId: integer('NurtureListID'),
  nurtureSkillId: integer('NurtureSkillID'),
  nurtureMinDelay: integer('NurtureMinDelay'),
  redialListId: integer('RedialListID'),
  redialSkillId: integer('RedialSkillID'),
  redialMinDelay: integer('RedialMinDelay'),
  source: varchar('Source', { length: 100 }),
  isDefault: boolean('isDefault'),
  transactionTypeId: integer('TransactionTypeID'),
  transactiontypeid: integer('transactiontypeid'),
})

export const outboundSchedule = pgTable('OutboundSchedule', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }),
  name: varchar('Name', { length: 100 }),
  dataSet: varchar('DataSet', { length: 100 }),
  server: varchar('Server', { length: 200 }),
  path: varchar('Path', { length: 200 }),
  userName: varchar('UserName', { length: 100 }),
  password: varchar('Password', { length: 100 }),
  publicKey: text('PublicKey'),
  frequency: integer('Frequency'),
  schedule: varchar('Schedule', { length: 20 }),
  isEnabled: boolean('IsEnabled'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
})

export const propertyHelperApplication = pgTable('PropertyHelperApplication', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  transactionServiceId: integer('TransactionServiceID'),
  conveyancingServiceId: integer('ConveyancingServiceID'),
  movingHubReferenceCode: varchar('MovingHubReferenceCode', { length: 20 }),
  movingHubCustomerId: varchar('MovingHubCustomerId', { length: 20 }),
  applicationStatus: integer('ApplicationStatus'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  segment: varchar('Segment', { length: 100 }),
})

export const pipeDriveLog = pgTable('PipeDriveLog', {
  id: integer('ID').primaryKey().notNull(),
  transactionServiceId: integer('TransactionServiceID').references(
    () => transactionService.id,
  ),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  attributes: jsonb('Attributes'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const pipedriveUserList = pgTable('PipedriveUserList', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  brandId: integer('BrandID'),
  pdUserName: varchar('PDUserName', { length: 255 }),
  pdUserId: varchar('PDUserID', { length: 255 }),
  pdUserToken: varchar('PDUserToken', { length: 255 }),
  isEnabled: boolean('IsEnabled'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const postcode = pgTable('Postcode', {
  id: integer('ID').primaryKey().notNull(),
  postcode: varchar('Postcode', { length: 150 }),
  suburb: varchar('Suburb', { length: 150 }),
  state: varchar('State', { length: 3 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
})

export const movingHubLog = pgTable('MovingHubLog', {
  id: integer('ID').primaryKey().notNull(),
  conveyancingServiceId: integer('ConveyancingServiceID').references(
    () => conveyancingService.id,
  ),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  attributes: jsonb('Attributes'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  requestData: jsonb('RequestData'),
})

export const propertyDocumentHistory = pgTable('PropertyDocumentHistory', {
  id: integer('ID'),
  propertyId: integer('PropertyID'),
  documentTypeId: integer('DocumentTypeID'),
  documentUrl: varchar('DocumentURL', { length: 255 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const pipedriveDdLists = pgTable('PipedriveDDLists', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  fieldName: varchar('FieldName', { length: 255 }),
  code: varchar('Code', { length: 255 }),
  description: varchar('Description', { length: 255 }),
  brandId: integer('BrandID').references(() => brand.id),
  pipedriveId: integer('PipedriveID'),
  isEnabled: boolean('IsEnabled'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const propertyDocument = pgTable('PropertyDocument', {
  id: integer('ID').primaryKey().notNull(),
  propertyId: integer('PropertyID').references(() => property.id),
  documentTypeId: integer('DocumentTypeID').references(() => documentType.id),
  documentUrl: varchar('DocumentURL', { length: 255 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const nurtureStream = pgTable('NurtureStream', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 4 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const otoLinking = pgTable(
  'OtoLinking',
  {
    id: bigserial('ID', { mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('UserID', { mode: 'number' }).references(
      () => userProfile.id,
    ),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    ccaLeadId: bigint('CcaLeadID', { mode: 'number' }).references(
      () => leads.id,
    ),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    ccaTransactionServiceId: bigint('CcaTransactionServiceID', {
      mode: 'number',
    }).references(() => transactionService.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    ccaConveyancingServiceId: bigint('CcaConveyancingServiceID', {
      mode: 'number',
    }).references(() => conveyancingService.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    rbiLeadId: bigint('RbiLeadID', { mode: 'number' }).references(
      () => leads.id,
    ),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    rbiTransactionServiceId: bigint('RbiTransactionServiceID', {
      mode: 'number',
    }).references(() => transactionService.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    rbiInspectionServiceId: bigint('RbiInspectionServiceID', {
      mode: 'number',
    }).references(() => inspectionService.id),
    otoBuyerIdHash: varchar('OtoBuyerIdHash', { length: 20 }),
    otoOfferIdHash: varchar('OtoOfferIdHash', { length: 20 }),
    otoListingIdHash: varchar('OtoListingIdHash', { length: 20 }),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
    dataId: integer('DataID'),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    ccaUserId: bigint('CcaUserID', { mode: 'number' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    rbiUserId: bigint('RbiUserID', { mode: 'number' }),
  },
  (table) => {
    return {
      otolinkingCcaconveyancingserviceidIdx: index(
        'otolinking_ccaconveyancingserviceid_index',
      ).on(table.ccaConveyancingServiceId),
      otolinkingCcaleadidIdx: index('otolinking_ccaleadid_index').on(
        table.ccaLeadId,
      ),
      otolinkingCcatransactionserviceidIdx: index(
        'otolinking_ccatransactionserviceid_index',
      ).on(table.ccaTransactionServiceId),
      otolinkingRbiinspectionserviceidIdx: index(
        'otolinking_rbiinspectionserviceid_index',
      ).on(table.rbiInspectionServiceId),
      otolinkingRbileadidIdx: index('otolinking_rbileadid_index').on(
        table.rbiLeadId,
      ),
      otolinkingRbitransactionserviceidIdx: index(
        'otolinking_rbitransactionserviceid_index',
      ).on(table.rbiTransactionServiceId),
      otolinkingUseridIdx: index('otolinking_userid_index').on(table.userId),
    }
  },
)

export const propertyHistory = pgTable('PropertyHistory', {
  id: integer('ID'),
  addressId: integer('AddressID'),
  propertyType: integer('PropertyType'),
  legalDescription: varchar('LegalDescription', { length: 255 }),
  primaryLandUse: varchar('PrimaryLandUse', { length: 100 }),
  secondaryLandUse: varchar('SecondaryLandUse', { length: 100 }),
  propertyName: varchar('PropertyName', { length: 150 }),
  occupantType: varchar('OccupantType', { length: 100 }),
  landArea: integer('LandArea'),
  equivBldgArea: integer('EquivBldgArea'),
  floorArea: integer('FloorArea'),
  bedrooms: integer('Bedrooms'),
  bathrooms: integer('Bathrooms'),
  carSpaces: integer('CarSpaces'),
  carPort: integer('CarPort'),
  garages: integer('Garages'),
  yearBuilt: integer('YearBuilt'),
  // TODO: failed to parse database type 'bit(1)'
  swimmingPool: boolean('SwimmingPool'),
  storageLot: integer('StorageLot'),
  toilets: integer('Toilets'),
  specialFeatures: text('SpecialFeatures'),
  yearBldgRefurb: integer('YearBldgRefurb'),
  zoning: varchar('Zoning', { length: 100 }),
  propTitleRef: varchar('PropTitleRef', { length: 255 }),
  propTitlePrefix: varchar('PropTitlePrefix', { length: 100 }),
  propTitleVolumeNo: integer('PropTitleVolumeNo'),
  propTitleFolioNo: integer('PropTitleFolioNo'),
  propTitleSuffix: varchar('PropTitleSuffix', { length: 100 }),
  saleStatus: varchar('SaleStatus', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const propertyOwnerHistory = pgTable('PropertyOwnerHistory', {
  id: integer('ID'),
  propertyId: integer('PropertyID'),
  ownerId: integer('OwnerID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const racvMembership = pgTable('RACVMembership', {
  id: integer('ID').primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  leadId: integer('LeadID').references(() => leads.id),
  membershipNo: varchar('MembershipNo', { length: 10 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  acceptTerms: boolean('AcceptTerms').default(false),
})

export const propertyTransactionHistory = pgTable(
  'PropertyTransactionHistory',
  {
    id: integer('ID'),
    userId: integer('UserID'),
    propertyId: integer('PropertyID'),
    transactionTypeId: integer('TransactionTypeID'),
    propertyTypeId: integer('PropertyTypeID'),
    transactionStageId: integer('TransactionStageID'),
    contactPhone: varchar('ContactPhone', { length: 20 }),
    contactEmail: varchar('ContactEmail', { length: 255 }),
    contactTime: varchar('ContactTime', { length: 100 }),
    stateId: integer('StateID'),
    movingDate: date('MovingDate'),
    isMovingIn: boolean('IsMovingIn'),
    contractDate: date('ContractDate'),
    coolingOffDate: date('CoolingOffDate'),
    purchasePrice: doublePrecision('PurchasePrice'),
    deposit: doublePrecision('Deposit'),
    settlementDate: date('SettlementDate'),
    notes: text('Notes'),
    isCompleted: boolean('IsCompleted'),
    created: timestamp('Created', { mode: 'string' }),
    updated: timestamp('Updated', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    dataId: bigint('DataID', { mode: 'number' }),
    deleted: timestamp('Deleted', { mode: 'string' }),
  },
)

export const salesforceContactLog = pgTable('SalesforceContactLog', {
  id: integer('ID').primaryKey().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  version: integer('Version'),
  sfExternalKey: uuid('SfExternalKey'),
  attributes: jsonb('Attributes'),
  from: varchar('From', { length: 255 }),
  to: varchar('To', { length: 255 }),
  field: varchar('Field', { length: 255 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const showcaseLead = pgTable('ShowcaseLead', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  brandId: integer('BrandID').references(() => brand.id),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  offer: varchar('Offer', { length: 200 }),
  referralPage: varchar('ReferralPage', { length: 2000 }),
  acceptDbcTerms: boolean('AcceptDbcTerms'),
  acceptPartnerTerms: boolean('AcceptPartnerTerms'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  transactionTypeId: integer('TransactionTypeID'),
  propertyTypeId: integer('PropertyTypeID'),
  stateId: integer('StateID'),
  timeToTransactId: integer('TimeToTransactID'),
  processed: boolean('Processed').default(false),
})

export const serviceStage = pgTable('ServiceStage', {
  id: integer('ID').primaryKey().notNull(),
  serviceTypeId: integer('ServiceTypeID'),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const serviceablePostcode = pgTable('ServiceablePostcode', {
  id: integer('ID').primaryKey().notNull(),
  postcode: integer('Postcode').notNull(),
  suburb: varchar('Suburb', { length: 150 }).notNull(),
  state: varchar('State', { length: 3 }).notNull(),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  region: varchar('Region', { length: 150 }).notNull(),
})

export const serviceType = pgTable('ServiceType', {
  id: integer('ID').primaryKey().notNull(),
  brandId: integer('BrandID'),
  code: varchar('Code', { length: 15 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  rbiPipedriveId: integer('RbiPipedriveID'),
  netsuiteId: integer('NetsuiteID'),
  netsuiteDescription: varchar('NetsuiteDescription', { length: 150 }),
})

export const role = pgTable('Role', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const propertyType = pgTable('PropertyType', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const propertyOwner = pgTable('PropertyOwner', {
  id: integer('ID').primaryKey().notNull(),
  propertyId: integer('PropertyID').references(() => property.id),
  ownerId: integer('OwnerID').references(() => userProfile.id),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const propertyTransaction = pgTable('PropertyTransaction', {
  id: integer('ID').primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  propertyId: integer('PropertyID').references(() => property.id),
  transactionTypeId: integer('TransactionTypeID').references(
    () => transactionType.id,
  ),
  propertyTypeId: integer('PropertyTypeID').references(() => propertyType.id),
  transactionStageId: integer('TransactionStageID').references(
    () => transactionStage.id,
  ),
  contactPhone: varchar('ContactPhone', { length: 20 }),
  contactEmail: varchar('ContactEmail', { length: 255 }),
  contactTime: varchar('ContactTime', { length: 100 }),
  stateId: integer('StateID').references(() => state.id),
  movingDate: date('MovingDate'),
  isMovingIn: boolean('IsMovingIn'),
  contractDate: date('ContractDate'),
  coolingOffDate: date('CoolingOffDate'),
  purchasePrice: doublePrecision('PurchasePrice'),
  deposit: doublePrecision('Deposit'),
  settlementDate: date('SettlementDate'),
  notes: text('Notes'),
  isCompleted: boolean('IsCompleted'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const salesforceEmailLog = pgTable('SalesforceEmailLog', {
  id: integer('ID').primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  requestId: varchar('RequestID', { length: 50 }),
  attributes: jsonb('Attributes'),
  from: varchar('From', { length: 255 }),
  to: varchar('To', { length: 255 }),
  requested: timestamp('Requested', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  journeyName: varchar('JourneyName', { length: 255 }),
  emailName: varchar('EmailName', { length: 255 }),
  sendTime: timestamp('SendTime', { mode: 'string' }),
  brandId: integer('BrandID'),
})

export const segment = pgTable('Segment', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const tempList = pgTable('TempList', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).notNull(),
  matterId: integer('MatterID'),
  status: boolean('Status').default(false),
  customerName: varchar('﻿CustomerName', { length: 1024 }),
})

export const statusReason = pgTable('StatusReason', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const transactionServiceHistory = pgTable('TransactionServiceHistory', {
  id: integer('ID'),
  transactionId: integer('TransactionID'),
  serviceTypeId: integer('ServiceTypeID'),
  nurtureStreamId: integer('NurtureStreamID'),
  statusId: integer('StatusID'),
  timeToTransactId: integer('TimeToTransactID'),
  crmConfirmed: boolean('CrmConfirmed'),
  crmDealId: integer('CrmDealID'),
  crmStaffId: integer('CrmStaffID'),
  crmStaffName: varchar('CrmStaffName', { length: 100 }),
  crmCreated: timestamp('CrmCreated', { mode: 'string' }),
  crmEmailBcc: varchar('CrmEmailBCC', { length: 255 }),
  crmDoMarketing: boolean('CrmDoMarketing'),
  movingDate: timestamp('MovingDate', { mode: 'string' }),
  isMovingIn: boolean('IsMovingIn'),
  lostTime: timestamp('LostTime', { mode: 'string' }),
  lostReason: varchar('LostReason', { length: 100 }),
  referror: varchar('Referror', { length: 255 }),
  notes: text('Notes'),
  created: timestamp('Created', { mode: 'string' }),
  closed: timestamp('Closed', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  crmDealStatus: varchar('CrmDealStatus', { length: 20 }),
  crmStaffTransact: varchar('CrmStaffTransact', { length: 100 }),
  matterReference: varchar('MatterReference', { length: 50 }),
  wonTime: timestamp('WonTime', { mode: 'string' }),
  offerApplied: varchar('OfferApplied', { length: 50 }),
  offerDiscount: numeric('OfferDiscount'),
  offerCurrency: varchar('OfferCurrency', { length: 10 }),
  postcode: varchar('Postcode', { length: 20 }),
  autodialTime: timestamp('AutodialTime', { mode: 'string' }),
  autodialStatus: varchar('AutodialStatus', { length: 10 }),
  price: numeric('Price'),
  authorisedBy: varchar('AuthorisedBy', { length: 100 }),
  offerApprovedBy: varchar('OfferApprovedBy', { length: 100 }),
  crmBookingDate: timestamp('CrmBookingDate', { mode: 'string' }),
  propertyId: integer('PropertyID'),
  paymentType: varchar('PaymentType', { length: 10 }),
  matterId: integer('MatterID'),
  autodialAction: varchar('AutodialAction', { length: 50 }),
  autodialSkillId: varchar('AutodialSkillID', { length: 50 }),
  autodialListId: varchar('AutodialListID', { length: 50 }),
  stageId: integer('StageID'),
  crmLeadSource: varchar('CrmLeadSource', { length: 200 }),
  crmLeadSourceCategory: varchar('CrmLeadSourceCategory', { length: 200 }),
  isInvestor: boolean('IsInvestor'),
  otoProduct: varchar('OtoProduct', { length: 20 }),
  preferredContactTime: varchar('PreferredContactTime', { length: 100 }),
  agentName: varchar('AgentName', { length: 200 }),
  athenaConsent: boolean('AthenaConsent'),
  ownership: varchar('Ownership', { length: 100 }),
  athenaLostReason: varchar('AthenaLostReason', { length: 255 }),
  propertyLocation: varchar('PropertyLocation', { length: 200 }),
  propertySize: varchar('PropertySize', { length: 5 }),
  externalPropertyId: varchar('ExternalPropertyID', { length: 100 }),
  firstProperty: boolean('FirstProperty'),
  propertySold: timestamp('PropertySold', { mode: 'string' }),
  buyerSaleStatus: varchar('BuyerSaleStatus', { length: 10 }),
  externalContractUrl: varchar('ExternalContractUrl', { length: 300 }),
  propertyRptReq: varchar('PropertyRptReq', { length: 3 }),
  campaignTrigger: varchar('CampaignTrigger', { length: 30 }),
})

export const transactionStage = pgTable('TransactionStage', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  pipedriveStageId: integer('PipedriveStageID'),
})

export const userAddressHistory = pgTable('UserAddressHistory', {
  id: integer('ID'),
  addressId: integer('AddressID'),
  personId: integer('PersonID'),
  addressTypeId: integer('AddressTypeID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const userBrowserMapping = pgTable('UserBrowserMapping', {
  id: integer('ID').primaryKey().notNull(),
  cid: varchar('CID', { length: 100 }),
  userId: integer('UserID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const transactionService = pgTable('TransactionService', {
  id: integer('ID').primaryKey().notNull(),
  transactionId: integer('TransactionID').references(
    () => propertyTransaction.id,
  ),
  serviceTypeId: integer('ServiceTypeID').references(() => serviceType.id),
  nurtureStreamId: integer('NurtureStreamID').references(
    () => nurtureStream.id,
  ),
  statusId: integer('StatusID').references(() => transactionStatus.id),
  timeToTransactId: integer('TimeToTransactID').references(
    () => transactionTime.id,
  ),
  crmConfirmed: boolean('CrmConfirmed'),
  crmDealId: integer('CrmDealID'),
  crmStaffId: integer('CrmStaffID'),
  crmStaffName: varchar('CrmStaffName', { length: 100 }),
  crmCreated: timestamp('CrmCreated', { mode: 'string' }),
  crmEmailBcc: varchar('CrmEmailBCC', { length: 255 }),
  crmDoMarketing: boolean('CrmDoMarketing'),
  movingDate: timestamp('MovingDate', { mode: 'string' }),
  isMovingIn: boolean('IsMovingIn'),
  lostTime: timestamp('LostTime', { mode: 'string' }),
  lostReason: varchar('LostReason', { length: 100 }),
  referror: varchar('Referror', { length: 255 }),
  notes: text('Notes'),
  created: timestamp('Created', { mode: 'string' }),
  closed: timestamp('Closed', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
  crmDealStatus: varchar('CrmDealStatus', { length: 20 }),
  crmStaffTransact: varchar('CrmStaffTransact', { length: 100 }),
  matterReference: varchar('MatterReference', { length: 50 }),
  wonTime: timestamp('WonTime', { mode: 'string' }),
  offerApplied: varchar('OfferApplied', { length: 50 }),
  offerDiscount: numeric('OfferDiscount'),
  offerCurrency: varchar('OfferCurrency', { length: 10 }),
  postcode: varchar('Postcode', { length: 20 }),
  autodialTime: timestamp('AutodialTime', { mode: 'string' }),
  autodialStatus: varchar('AutodialStatus', { length: 10 }),
  price: numeric('Price'),
  authorisedBy: varchar('AuthorisedBy', { length: 100 }),
  offerApprovedBy: varchar('OfferApprovedBy', { length: 100 }),
  crmBookingDate: timestamp('CrmBookingDate', { mode: 'string' }),
  propertyId: integer('PropertyID'),
  paymentType: varchar('PaymentType', { length: 10 }),
  matterId: integer('MatterID'),
  autodialSkillId: integer('AutodialSkillID'),
  autodialListId: integer('AutodialListID'),
  autodialAction: varchar('AutodialAction', { length: 20 }),
  stageId: integer('StageID'),
  crmLeadSource: varchar('CrmLeadSource', { length: 200 }),
  crmLeadSourceCategory: varchar('CrmLeadSourceCategory', { length: 200 }),
  isInvestor: boolean('IsInvestor'),
  otoProduct: varchar('OtoProduct', { length: 20 }),
  preferredContactTime: varchar('PreferredContactTime', { length: 100 }),
  agentName: varchar('AgentName', { length: 200 }),
  athenaConsent: boolean('AthenaConsent'),
  ownership: varchar('Ownership', { length: 100 }),
  athenaLostReason: varchar('AthenaLostReason', { length: 255 }),
  propertyLocation: varchar('PropertyLocation', { length: 200 }),
  propertySize: varchar('PropertySize', { length: 5 }),
  externalPropertyId: varchar('ExternalPropertyID', { length: 100 }),
  firstProperty: boolean('FirstProperty'),
  propertySold: timestamp('PropertySold', { mode: 'string' }),
  buyerSaleStatus: varchar('BuyerSaleStatus', { length: 10 }).default(
    'Unknown',
  ),
  externalContractUrl: varchar('ExternalContractUrl', { length: 300 }),
  propertyRptReq: varchar('PropertyRptReq', { length: 3 }),
  campaignTrigger: varchar('CampaignTrigger', { length: 30 }),
})

export const userProfileHistory = pgTable('UserProfileHistory', {
  id: integer('ID'),
  hashId: varchar('HashID', { length: 255 }),
  fullName: varchar('FullName', { length: 255 }),
  title: varchar('Title', { length: 10 }),
  firstName: varchar('FirstName', { length: 100 }),
  middleName: varchar('MiddleName', { length: 100 }),
  lastName: varchar('LastName', { length: 150 }),
  preferredName: varchar('PreferredName', { length: 100 }),
  dateOfBirth: date('DateOfBirth'),
  countryOfBirthId: integer('CountryOfBirthID'),
  maritalStatusId: integer('MaritalStatusID'),
  genderId: integer('GenderID'),
  citizenCountryId: integer('CitizenCountryID'),
  isPermanentResident: boolean('IsPermanentResident'),
  isDeceased: boolean('IsDeceased'),
  email: varchar('Email', { length: 255 }),
  secondaryEmail: varchar('SecondaryEmail', { length: 255 }),
  phone: varchar('Phone', { length: 20 }),
  homePhone: varchar('HomePhone', { length: 20 }),
  workPhone: varchar('WorkPhone', { length: 20 }),
  mobile: varchar('Mobile', { length: 20 }),
  secondaryMobile: varchar('SecondaryMobile', { length: 20 }),
  occupation: varchar('Occupation', { length: 255 }),
  preferredMethod: varchar('PreferredMethod', { length: 100 }),
  contactTime: varchar('ContactTime', { length: 50 }),
  deviceId: varchar('DeviceID', { length: 50 }),
  hasSpamComplaint: boolean('HasSpamComplaint'),
  disableDataSharing: boolean('DisableDataSharing'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  state: varchar('State', { length: 100 }),
})

export const userSegmentHistory = pgTable('UserSegmentHistory', {
  id: integer('ID'),
  userId: integer('UserID'),
  segmentId: integer('SegmentID'),
  propertyTransactionId: integer('PropertyTransactionID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const userProfile = pgTable('UserProfile', {
  id: integer('ID').primaryKey().notNull(),
  hashId: varchar('HashID', { length: 255 }),
  fullName: varchar('FullName', { length: 255 }),
  title: varchar('Title', { length: 10 }),
  firstName: varchar('FirstName', { length: 100 }),
  middleName: varchar('MiddleName', { length: 100 }),
  lastName: varchar('LastName', { length: 150 }),
  preferredName: varchar('PreferredName', { length: 100 }),
  dateOfBirth: date('DateOfBirth'),
  countryOfBirthId: integer('CountryOfBirthID'),
  maritalStatusId: integer('MaritalStatusID'),
  genderId: integer('GenderID'),
  citizenCountryId: integer('CitizenCountryID'),
  isPermanentResident: boolean('IsPermanentResident'),
  isDeceased: boolean('IsDeceased'),
  email: varchar('Email', { length: 255 }),
  secondaryEmail: varchar('SecondaryEmail', { length: 255 }),
  phone: varchar('Phone', { length: 20 }),
  homePhone: varchar('HomePhone', { length: 20 }),
  workPhone: varchar('WorkPhone', { length: 20 }),
  mobile: varchar('Mobile', { length: 20 }),
  secondaryMobile: varchar('SecondaryMobile', { length: 20 }),
  occupation: varchar('Occupation', { length: 255 }),
  preferredMethod: varchar('PreferredMethod', { length: 100 }),
  contactTime: varchar('ContactTime', { length: 50 }),
  deviceId: varchar('DeviceID', { length: 50 }),
  hasSpamComplaint: boolean('HasSpamComplaint'),
  disableDataSharing: boolean('DisableDataSharing'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
  state: varchar('State', { length: 100 }),
})

export const transactionType = pgTable('TransactionType', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  leadSegment: varchar('LeadSegment', { length: 100 }),
})

export const transactionTime = pgTable('TransactionTime', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  sfmcEventDefinitionKey: varchar('SFMCEventDefinitionKey', { length: 255 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  sfmcEventDefinitionKeyRbi: varchar('SFMCEventDefinitionKeyRBI', {
    length: 255,
  }),
  isAutodial: boolean('IsAutodial').default(true),
})

export const transactionStatus = pgTable('TransactionStatus', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  ccaPdStageId: integer('CcaPDStageID'),
  rbiPdStageId: integer('RbiPDStageID'),
})

export const userAddress = pgTable('UserAddress', {
  id: integer('ID').primaryKey().notNull(),
  addressId: integer('AddressID').references(() => address.id),
  personId: integer('PersonID').references(() => userProfile.id),
  addressTypeId: integer('AddressTypeID').references(() => addressType.id),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const userIdentity = pgTable('UserIdentity', {
  id: integer('ID').primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  crmPersonId: integer('CrmPersonID'),
  asContactId: integer('AsContactID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  rbiPersonId: integer('RbiPersonID'),
  formitizeClientId: varchar('FormitizeClientID', { length: 10 }),
  formitizeContactId: integer('FormitizeContactID'),
})

export const userSegment = pgTable('UserSegment', {
  id: integer('ID').primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  segmentId: integer('SegmentID').references(() => segment.id),
  propertyTransactionId: integer('PropertyTransactionID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const unsubscribeReason = pgTable('UnsubscribeReason', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const userSubscriptionHistory = pgTable('UserSubscriptionHistory', {
  id: integer('ID'),
  userId: integer('UserID'),
  brandId: integer('BrandID'),
  isCustomer: boolean('IsCustomer'),
  optIn: boolean('OptIn'),
  preferEmail: boolean('PreferEmail'),
  preferSms: boolean('PreferSMS'),
  preferPhone: boolean('PreferPhone'),
  emailSubscribed: timestamp('EmailSubscribed', { mode: 'string' }),
  emailUnsubscribed: timestamp('EmailUnsubscribed', { mode: 'string' }),
  smsSubscribed: timestamp('SmsSubscribed', { mode: 'string' }),
  smsUnsubscribed: timestamp('SmsUnsubscribed', { mode: 'string' }),
  phoneSubscribed: timestamp('PhoneSubscribed', { mode: 'string' }),
  phoneUnsubscribed: timestamp('PhoneUnsubscribed', { mode: 'string' }),
  sellingComms: boolean('SellingComms'),
  buyingComms: boolean('BuyingComms'),
  transferringComms: boolean('TransferringComms'),
  hasSpamComplaint: boolean('HasSpamComplaint'),
  unsubscribeReasonId: integer('UnsubscribeReasonID'),
  reason: text('Reason'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  settlementDate: date('SettlementDate'),
  hasActiveOrder: boolean('HasActiveOrder'),
  lastOrder: date('LastOrder'),
  lastInteraction: timestamp('LastInteraction', { mode: 'string' }),
  isBuyer: boolean('IsBuyer').default(false),
  isAgent: boolean('IsAgent').default(false),
  isAdmin: boolean('IsAdmin').default(false),
  brandPreferences: text('BrandPreferences'),
  lastAudience: varchar('LastAudience', { length: 100 }),
})

export const dbcCcaLeads = pgTable('dbc.ccaLeads', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }),
  cid: varchar('CID', { length: 100 }),
  userId: integer('UserID'),
  firstName: varchar('FirstName', { length: 100 }),
  lastName: varchar('LastName', { length: 100 }),
  email: varchar('Email', { length: 255 }),
  phone: varchar('Phone', { length: 20 }),
  transactionTypeId: integer('TransactionTypeID'),
  propertyTypeId: integer('PropertyTypeID'),
  stateId: integer('StateID'),
  timeToTransactId: integer('TimeToTransactID'),
  acceptTerms: boolean('AcceptTerms'),
  utmId: varchar('utmID', { length: 20 }),
  utmSource: varchar('utmSource', { length: 100 }),
  utmMedium: varchar('utmMedium', { length: 100 }),
  utmCampaign: varchar('utmCampaign', { length: 100 }),
  channel: varchar('Channel', { length: 100 }),
  utmContent: varchar('utmContent', { length: 400 }),
  referralPage: text('ReferralPage'),
  sendEmail: boolean('SendEmail'),
  salesforceEmailLogId: integer('SalesforceEmailLogID'),
  statusId: integer('StatusID'),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  duplicateLeadId: bigint('DuplicateLeadID', { mode: 'number' }),
  statusReasonId: integer('StatusReasonID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  email1Only: boolean('Email1Only'),
  transactionServiceId: integer('TransactionServiceID'),
  publishToTeams: boolean('PublishToTeams'),
  offerCode: varchar('OfferCode', { length: 50 }),
  notes: text('Notes'),
  brandId: integer('BrandID'),
  fullName: varchar('FullName', { length: 200 }),
  propertyLocation: varchar('PropertyLocation', { length: 200 }),
})

export const dbcCcaMatterTasks = pgTable('dbc.ccaMatterTasks', {
  taskId: integer('Task - ID'),
  taskActionStepId: integer('Task - Action Step ID'),
  matterId: integer('Matter ID'),
  taskAssignedTo: varchar('Task - Assigned To'),
  taskCompletedOn: timestamp('Task - Completed On', { mode: 'string' }),
  taskDueDate: timestamp('Task - Due Date', { mode: 'string' }),
  taskName: varchar('Task - Name', { length: 255 }),
  taskPriority: varchar('Task - Priority', { length: 50 }),
  taskStatus: varchar('Task - Status', { length: 50 }),
  taskStep: varchar('Task - Step', { length: 255 }),
  taskDataId: integer('Task - Data ID'),
  taskCreated: timestamp('Task - Created', { mode: 'string' }),
  taskUpdated: timestamp('Task - Updated', { mode: 'string' }),
  taskDeleted: timestamp('Task - Deleted', { mode: 'string' }),
})

export const dbcCcaMatters = pgTable('dbc.ccaMatters', {
  transactionId: integer('Transaction ID'),
  dealMatterReference: varchar('Deal Matter Reference', { length: 50 }),
  transactionServiceId: integer('TransactionServiceID'),
  matterMatterReference: varchar('Matter - Matter Reference', { length: 50 }),
  matterMatterType: varchar('Matter - Matter Type', { length: 100 }),
  matterPropertyType: varchar('Matter - Property Type', { length: 100 }),
  matterDateCreated: timestamp('Matter - Date Created', { mode: 'string' }),
  matterContractDate: timestamp('Matter - Contract Date', { mode: 'string' }),
  matterBpiDate: date('Matter - BPI Date'),
  matterCoolingOffDate: timestamp('Matter - Cooling Off Date', {
    mode: 'string',
  }),
  matterSettlementDate: date('Matter - Settlement Date'),
  matterStatus: varchar('Matter - Status'),
  matterCurrentStep: varchar('Matter - Current Step'),
  matterAssignedTo: varchar('Matter - Assigned To', { length: 255 }),
  matterAdditionalInformation: text('Matter - Additional Information'),
  matterOfferApplied: varchar('Matter - Offer Applied', { length: 50 }),
  matterOfferDiscount: doublePrecision('Matter - Offer Discount'),
  matterPurchasePrice: real('Matter - Purchase Price'),
  matterIsMovingIn: boolean('Matter - Is Moving In'),
})

export const dbcCcaOutboundPartnershipLeads = pgTable(
  'dbc.ccaOutboundPartnershipLeads',
  {
    dateSent: date('Date Sent'),
    firstName: varchar('First Name', { length: 100 }),
    lastName: varchar('Last Name', { length: 150 }),
    email: varchar('Email', { length: 255 }),
    audience: varchar('Audience', { length: 100 }),
    propertyType: varchar('Property Type', { length: 100 }),
    conveyancingStage: varchar('Conveyancing Stage'),
    propertyJourney: text('Property Journey'),
    settlementDate: timestamp('Settlement Date', { mode: 'string' }),
    utmMedium: varchar('utm_medium', { length: 100 }),
    utmSource: varchar('utm_source', { length: 100 }),
    referralUrl: text('Referral URL'),
    partner: varchar('Partner', { length: 150 }),
    partnerCategory: varchar('Partner Category', { length: 150 }),
    state: varchar('State', { length: 5 }),
    matterId: integer('MatterID'),
  },
)

export const dbcCcaSalesLeads = pgTable('dbc.ccaSalesLeads', {
  transactionId: integer('Transaction ID'),
  dealId: integer('Deal - ID'),
  dealCreated: timestamp('Deal - Created', { mode: 'string' }),
  dealPostcode: varchar('Deal - Postcode', { length: 20 }),
  dealStatus: varchar('Deal - Status', { length: 20 }),
  dealMatterReference: varchar('Deal - Matter Reference', { length: 50 }),
  dealOfferApplied: varchar('Deal - Offer Applied', { length: 50 }),
  dealOfferDiscount: numeric('Deal - Offer Discount'),
  dealOfferCurrency: varchar('Deal - Offer Currency', { length: 10 }),
  dealLostReason: varchar('Deal - Lost Reason', { length: 100 }),
  dealWonTime: timestamp('Deal - Won Time', { mode: 'string' }),
  dealLostTime: timestamp('Deal - Lost Time', { mode: 'string' }),
  leadReferralPage: text('Lead - Referral Page'),
  dealClosed: timestamp('Deal - Closed', { mode: 'string' }),
  dealClientServices: varchar('Deal - Client Services', { length: 100 }),
  dealClientServicesContact: varchar('Deal - Client Services Contact', {
    length: 100,
  }),
  dealProductType: varchar('Deal - Product Type', { length: 100 }),
  dealState: varchar('Deal - State', { length: 3 }),
  dealStage: varchar('Deal - Stage', { length: 100 }),
  dealPropertyType: varchar('Deal - Property Type', { length: 100 }),
  dealTimeToTransact: varchar('Deal - Time To Transact', { length: 100 }),
  dealLeadSource: varchar('Deal – Lead Source', { length: 200 }),
  dealLeadSourceCategory: varchar('Deal – Lead Source Category', {
    length: 200,
  }),
  leadSource: varchar('Lead - Source', { length: 100 }),
  leadSubSource: varchar('Lead - Sub Source', { length: 100 }),
  leadCampaign: varchar('Lead - Campaign', { length: 100 }),
  leadChannel: varchar('Lead - Channel', { length: 100 }),
  leadExperimentId: varchar('Lead - Experiment ID', { length: 255 }),
  leadExperimentVariation: varchar('Lead - Experiment Variation', {
    length: 255,
  }),
  leadGclid: varchar('Lead - GCLID', { length: 255 }),
  userFullName: text('User - Full Name'),
  userPhone: varchar('User - Phone', { length: 20 }),
  userEmail: varchar('User - Email', { length: 255 }),
  userMarketingCommunication: boolean('User - Marketing Communication'),
  userCid: varchar('User - CID', { length: 100 }),
})

export const dbcCcaSalesLeadsCopy = pgTable('dbc.ccaSalesLeadsCopy', {
  leadCreated: timestamp('Lead - Created', { mode: 'string' }),
  transactionId: integer('Transaction ID'),
  dealId: integer('Deal - ID'),
  dealCreated: timestamp('Deal - Created', { mode: 'string' }),
  dealPostcode: varchar('Deal - Postcode', { length: 20 }),
  dealStatus: varchar('Deal - Status', { length: 20 }),
  dealMatterReference: varchar('Deal - Matter Reference', { length: 50 }),
  dealOfferApplied: varchar('Deal - Offer Applied', { length: 50 }),
  dealOfferDiscount: numeric('Deal - Offer Discount'),
  dealOfferCurrency: varchar('Deal - Offer Currency', { length: 10 }),
  dealLostReason: varchar('Deal - Lost Reason', { length: 100 }),
  dealWonTime: timestamp('Deal - Won Time', { mode: 'string' }),
  dealLostTime: timestamp('Deal - Lost Time', { mode: 'string' }),
  leadReferralPage: text('Lead - Referral Page'),
  dealClosed: timestamp('Deal - Closed', { mode: 'string' }),
  dealClientServices: varchar('Deal - Client Services', { length: 100 }),
  dealClientServicesContact: varchar('Deal - Client Services Contact', {
    length: 100,
  }),
  dealProductType: varchar('Deal - Product Type', { length: 100 }),
  dealState: varchar('Deal - State', { length: 3 }),
  dealStage: varchar('Deal - Stage', { length: 100 }),
  dealPropertyType: varchar('Deal - Property Type', { length: 100 }),
  dealTimeToTransact: varchar('Deal - Time To Transact', { length: 100 }),
  leadSource: varchar('Lead - Source', { length: 100 }),
  leadSubSource: varchar('Lead - Sub Source', { length: 100 }),
  leadCampaign: varchar('Lead - Campaign', { length: 100 }),
  leadChannel: varchar('Lead - Channel', { length: 100 }),
  userFullName: text('User - Full Name'),
  userPhone: varchar('User - Phone', { length: 20 }),
  userEmail: varchar('User - Email', { length: 255 }),
  userMarketingCommunication: boolean('User - Marketing Communication'),
})

export const dbcCcaSalesPipeDrive = pgTable('dbc.ccaSalesPipeDrive', {
  leadDate: text('Lead Date'),
  dealDate: text('Deal Date'),
  state: varchar('State', { length: 3 }),
  product: varchar('Product', { length: 100 }),
  utmSource: varchar('utm_source', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  channel: varchar('Channel', { length: 100 }),
  timeToTransact: varchar('TimeToTransact', { length: 100 }),
  propertyType: varchar('PropertyType', { length: 100 }),
  lostReason: varchar('Lost Reason', { length: 100 }),
  status: varchar('Status', { length: 20 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  pdDeals: bigint('PD Deals', { mode: 'number' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  leadsQualified: bigint('Leads Qualified', { mode: 'number' }),
})

export const dbcRLeads = pgTable('dbc.rLeads', {
  date: text('Date'),
  state: varchar('State', { length: 3 }),
  product: varchar('Product', { length: 100 }),
  utmsource: varchar('UTM\nSource', { length: 100 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  leadsTotal: bigint('Leads(Total)', { mode: 'number' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  leadsQualified: bigint('Leads(Qualified)', { mode: 'number' }),
})

export const dbcRbiLeads = pgTable('dbc.rbiLeads', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }),
  cid: varchar('CID', { length: 100 }),
  userId: integer('UserID'),
  firstName: varchar('FirstName', { length: 100 }),
  lastName: varchar('LastName', { length: 100 }),
  email: varchar('Email', { length: 255 }),
  phone: varchar('Phone', { length: 20 }),
  transactionTypeId: integer('TransactionTypeID'),
  propertyTypeId: integer('PropertyTypeID'),
  stateId: integer('StateID'),
  timeToTransactId: integer('TimeToTransactID'),
  acceptTerms: boolean('AcceptTerms'),
  utmId: varchar('utmID', { length: 20 }),
  utmSource: varchar('utmSource', { length: 100 }),
  utmMedium: varchar('utmMedium', { length: 100 }),
  utmCampaign: varchar('utmCampaign', { length: 100 }),
  channel: varchar('Channel', { length: 100 }),
  utmContent: varchar('utmContent', { length: 400 }),
  referralPage: text('ReferralPage'),
  sendEmail: boolean('SendEmail'),
  salesforceEmailLogId: integer('SalesforceEmailLogID'),
  statusId: integer('StatusID'),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  duplicateLeadId: bigint('DuplicateLeadID', { mode: 'number' }),
  statusReasonId: integer('StatusReasonID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  email1Only: boolean('Email1Only'),
  transactionServiceId: integer('TransactionServiceID'),
  publishToTeams: boolean('PublishToTeams'),
  offerCode: varchar('OfferCode', { length: 50 }),
  notes: text('Notes'),
  brandId: integer('BrandID'),
  fullName: varchar('FullName', { length: 200 }),
  propertyLocation: varchar('PropertyLocation', { length: 200 }),
})

export const dbcRbiTracker = pgTable('dbc.rbiTracker', {
  address: varchar('Address'),
  authBy: varchar('Auth By', { length: 100 }),
  bookingDate: timestamp('Booking Date', { mode: 'string' }),
  clientName: varchar('Client Name', { length: 255 }),
  concierge: varchar('Concierge', { length: 100 }),
  confirmed: text('Confirmed'),
  dateOfInspection: date('Date of Inspection'),
  email: varchar('Email', { length: 255 }),
  inspectionTime: time('Inspection Time'),
  inspector: varchar('Inspector', { length: 255 }),
  job: varchar('Job #', { length: 255 }),
  leadDate: timestamp('Lead Date', { mode: 'string' }),
  leadSource: varchar('Lead Source', { length: 100 }),
  leadStage: varchar('Lead Stage', { length: 100 }),
  noBath: integer('No. Bath'),
  noBdr: integer('No. Bdr'),
  payment: varchar('Payment', { length: 10 }),
  phone: varchar('Phone', { length: 20 }),
  postcode: varchar('Postcode', { length: 10 }),
  productCode: varchar('Product Code', { length: 100 }),
  quotedPrice: numeric('Quoted Price'),
  state: varchar('State', { length: 3 }),
})

export const failedJobs = pgTable('failed_jobs', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
  connection: text('connection').notNull(),
  queue: text('queue').notNull(),
  payload: text('payload').notNull(),
  exception: text('exception').notNull(),
  failedAt: timestamp('failed_at', { mode: 'string' }).defaultNow().notNull(),
})

export const jobs = pgTable(
  'jobs',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    queue: varchar('queue', { length: 255 }).notNull(),
    payload: text('payload').notNull(),
    attempts: smallint('attempts').notNull(),
    reservedAt: integer('reserved_at'),
    availableAt: integer('available_at').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => {
    return {
      queueIdx: index().on(table.queue),
    }
  },
)

export const userSubscription = pgTable('UserSubscription', {
  id: integer('ID').primaryKey().notNull(),
  userId: integer('UserID').references(() => userProfile.id),
  brandId: integer('BrandID').references(() => brand.id),
  isCustomer: boolean('IsCustomer'),
  optIn: boolean('OptIn'),
  preferEmail: boolean('PreferEmail'),
  preferSms: boolean('PreferSMS'),
  preferPhone: boolean('PreferPhone'),
  emailSubscribed: timestamp('EmailSubscribed', { mode: 'string' }),
  emailUnsubscribed: timestamp('EmailUnsubscribed', { mode: 'string' }),
  smsSubscribed: timestamp('SmsSubscribed', { mode: 'string' }),
  smsUnsubscribed: timestamp('SmsUnsubscribed', { mode: 'string' }),
  phoneSubscribed: timestamp('PhoneSubscribed', { mode: 'string' }),
  phoneUnsubscribed: timestamp('PhoneUnsubscribed', { mode: 'string' }),
  sellingComms: boolean('SellingComms'),
  buyingComms: boolean('BuyingComms'),
  transferringComms: boolean('TransferringComms'),
  unsubscribeReasonId: integer('UnsubscribeReasonID').references(
    () => unsubscribeReason.id,
  ),
  reason: text('Reason'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
  hasActiveOrder: boolean('HasActiveOrder'),
  lastOrder: date('LastOrder'),
  lastInteraction: timestamp('LastInteraction', { mode: 'string' }),
  isBuyer: boolean('IsBuyer').default(false),
  isAgent: boolean('IsAgent').default(false),
  isAdmin: boolean('IsAdmin').default(false),
  settlementDate: date('SettlementDate'),
  brandPreferences: text('BrandPreferences'),
  lastAudience: varchar('LastAudience', { length: 100 }),
})

export const outCcaRacv = pgTable('out.ccaRACV', {
  id: integer('ID'),
  dealId: integer('Deal - ID'),
  dealMatterReference: varchar('Deal - Matter Reference', { length: 50 }),
  matterId: integer('Matter ID'),
  dealDealCreated: timestamp('Deal - Deal created', { mode: 'string' }),
  dealWonTime: timestamp('Deal - Won time', { mode: 'string' }),
  dealLostTime: timestamp('Deal - Lost time', { mode: 'string' }),
  dealBst: varchar('Deal - BST', { length: 100 }),
  dealDetails: varchar('Deal Details', { length: 100 }),
  racvMemberNumber: varchar('RACV member number', { length: 10 }),
  firstName: varchar('First Name', { length: 100 }),
  lastName: varchar('Last Name', { length: 150 }),
  contactNumber: varchar('Contact Number', { length: 20 }),
  personEmail: varchar('Person Email', { length: 255 }),
  dealReferralPage: text('Deal - Referral Page'),
  privacyConsent: boolean('Privacy Consent'),
  outboundCallConsent: boolean('Outbound call consent'),
  addressLine1: varchar('Address Line 1', { length: 100 }),
  addressLine2: text('Address Line 2'),
  suburb: varchar('Suburb', { length: 100 }),
  code: varchar('Code', { length: 3 }),
  postcode: varchar('Postcode', { length: 10 }),
  settlementMonth: date('Settlement Month'),
  dealWebFormTimeToTransact: varchar('Deal - Web Form - Time To Transact', {
    length: 100,
  }),
  dateCreated: timestamp('Date created', { mode: 'string' }),
  lastUpdated: timestamp('Last updated', { mode: 'string' }),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  price: integer('price').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
})

export const typeormMetadata = pgTable('typeorm_metadata', {
  type: varchar('type').notNull(),
  database: varchar('database'),
  schema: varchar('schema'),
  table: varchar('table'),
  name: varchar('name'),
  value: text('value'),
})

export const users = pgTable(
  'users',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
  },
  (table) => {
    return {
      usersEmailUnique: unique('users_email_unique').on(table.email),
    }
  },
)

export const country = pgTable('Country', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const state = pgTable('State', {
  id: integer('ID').primaryKey().notNull(),
  code: varchar('Code', { length: 3 }),
  name: varchar('Name', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  pdStateId: integer('PDStateID'),
  supported: boolean('Supported').default(false).notNull(),
  pdRbiStateId: integer('PDRbiStateID'),
})

export const contactUs = pgTable('ContactUs', {
  id: integer('ID').primaryKey().notNull(),
  brandId: integer('BrandID').references(() => brand.id),
  cid: varchar('CID', { length: 100 }),
  userId: integer('UserID').references(() => userProfile.id),
  enquiryType: varchar('EnquiryType', { length: 150 }),
  firstName: varchar('FirstName', { length: 100 }),
  lastName: varchar('LastName', { length: 100 }),
  email: varchar('Email', { length: 255 }),
  phone: varchar('Phone', { length: 20 }),
  message: text('Message'),
  entryId: integer('EntryID'),
  entryTime: timestamp('EntryTime', { mode: 'string' }),
  utmId: varchar('utmID', { length: 20 }),
  utmSource: varchar('utmSource', { length: 100 }),
  utmMedium: varchar('utmMedium', { length: 100 }),
  utmCampaign: varchar('utmCampaign', { length: 100 }),
  utmContent: varchar('utmContent', { length: 400 }),
  referralPage: varchar('ReferralPage', { length: 2000 }),
  userAgent: text('UserAgent'),
  userIp: varchar('UserIP', { length: 200 }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  created: timestamp('Created', { mode: 'string' }),
})

export const dataPartnerState = pgTable('DataPartnerState', {
  id: integer('ID').primaryKey().notNull(),
  dataPartnerId: integer('DataPartnerID').references(() => dataPartner.id),
  stateId: integer('StateID').references(() => state.id),
  created: timestamp('Created', { mode: 'string' }).defaultNow(),
  updated: timestamp('Updated', { mode: 'string' }).defaultNow(),
  deleted: timestamp('Deleted', { mode: 'string' }),
})

export const dataSharingAthenaLog = pgTable('DataSharingAthenaLog', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataSharingCcaLeadSegmentId: bigint('DataSharingCCALeadSegmentID', {
    mode: 'number',
  }).references(() => dataSharingCcaLeadSegments.id),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataPartnerId: bigint('DataPartnerID', { mode: 'number' }).references(
    () => dataPartner.id,
  ),
  date: date('Date'),
  name: varchar('Name', { length: 100 }),
  mobile: varchar('Mobile', { length: 20 }),
  homePhone: varchar('HomePhone', { length: 20 }),
  workPhone: varchar('WorkPhone', { length: 20 }),
  email: varchar('Email', { length: 255 }),
  unitNo: varchar('UnitNo', { length: 100 }),
  streetName: varchar('StreetName', { length: 255 }),
  streetType: varchar('StreetType', { length: 200 }),
  suburb: varchar('Suburb', { length: 255 }),
  postcode: varchar('Postcode', { length: 10 }),
  state: varchar('State', { length: 100 }),
  segment: varchar('Segment', { length: 255 }),
  athenaConsent: varchar('AthenaConsent', { length: 1 }),
  twentyPercent: varchar('twentyPercent', { length: 1 }),
  ownership: varchar('Ownership', { length: 100 }),
  transferType: varchar('TransferType', { length: 5 }),
  transferStatus: varchar('TransferStatus', { length: 20 }),
  transferReason: varchar('TransferReason', { length: 255 }),
  transferTime: timestamp('TransferTime', { mode: 'string' }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
})

export const leads = pgTable('Leads', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('ID', { mode: 'number' }).primaryKey().notNull(),
  cid: varchar('CID', { length: 100 }),
  userId: integer('UserID').references(() => userProfile.id),
  firstName: varchar('FirstName', { length: 100 }),
  lastName: varchar('LastName', { length: 100 }),
  email: varchar('Email', { length: 255 }),
  phone: varchar('Phone', { length: 20 }),
  transactionTypeId: integer('TransactionTypeID').references(
    () => transactionType.id,
  ),
  propertyTypeId: integer('PropertyTypeID').references(() => propertyType.id),
  stateId: integer('StateID').references(() => state.id),
  timeToTransactId: integer('TimeToTransactID').references(
    () => transactionTime.id,
  ),
  acceptTerms: boolean('AcceptTerms'),
  utmId: varchar('utmID', { length: 20 }),
  utmSource: varchar('utmSource', { length: 100 }),
  utmMedium: varchar('utmMedium', { length: 100 }),
  utmCampaign: varchar('utmCampaign', { length: 100 }),
  channel: varchar('Channel', { length: 100 }),
  utmContent: varchar('utmContent', { length: 400 }),
  referralPage: text('ReferralPage'),
  sendEmail: boolean('SendEmail'),
  salesforceEmailLogId: integer('SalesforceEmailLogID'),
  statusId: integer('StatusID').references(() => leadStatus.id),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  duplicateLeadId: bigint('DuplicateLeadID', { mode: 'number' }),
  statusReasonId: integer('StatusReasonID').references(() => statusReason.id),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  email1Only: boolean('Email1Only').default(false),
  transactionServiceId: integer('TransactionServiceID'),
  publishToTeams: boolean('PublishToTeams').default(false),
  offerCode: varchar('OfferCode', { length: 50 }),
  notes: text('Notes'),
  brandId: integer('BrandID').references(() => brand.id),
  fullName: varchar('FullName', { length: 200 }),
  propertyLocation: varchar('PropertyLocation', { length: 200 }),
  experimentId: varchar('ExperimentID', { length: 255 }),
  experimentVariation: varchar('ExperimentVariation', { length: 255 }),
  gclid: varchar('gclid', { length: 255 }),
  otoBuyerIdHash: varchar('otoBuyerIdHash', { length: 255 }),
  otoOfferIdHash: varchar('otoOfferIdHash', { length: 255 }),
  otoListingIdHash: varchar('otoListingIdHash', { length: 255 }),
  otoProduct: varchar('OtoProduct', { length: 20 }),
  preferredContactTime: varchar('PreferredContactTime', { length: 100 }),
  agentName: varchar('AgentName', { length: 200 }),
  postcode: varchar('Postcode', { length: 20 }),
  propertySize: varchar('PropertySize', { length: 5 }),
  referralId: varchar('ReferralID', { length: 400 }),
  referralPartnerEmail: varchar('ReferralPartnerEmail', { length: 255 }),
  conveyancingFirm: varchar('ConveyancingFirm', { length: 150 }),
  conveyancingName: varchar('ConveyancingName', { length: 150 }),
  referralFranchiseeEmail: varchar('ReferralFranchiseeEmail', { length: 255 }),
  leadSourceCat: varchar('LeadSourceCat', { length: 200 }),
})

export const property = pgTable('Property', {
  id: integer('ID').primaryKey().notNull(),
  addressId: integer('AddressID').references(() => address.id),
  propertyTypeId: integer('PropertyTypeID').references(() => propertyType.id),
  legalDescription: varchar('LegalDescription', { length: 255 }),
  primaryLandUse: varchar('PrimaryLandUse', { length: 100 }),
  secondaryLandUse: varchar('SecondaryLandUse', { length: 100 }),
  propertyName: varchar('PropertyName', { length: 150 }),
  occupantType: varchar('OccupantType', { length: 100 }),
  landArea: integer('LandArea'),
  equivBldgArea: integer('EquivBldgArea'),
  floorArea: integer('FloorArea'),
  bedrooms: integer('Bedrooms'),
  bathrooms: integer('Bathrooms'),
  carSpaces: integer('CarSpaces'),
  carPort: integer('CarPort'),
  garages: integer('Garages'),
  yearBuilt: integer('YearBuilt'),
  // TODO: failed to parse database type 'bit(1)'
  swimmingPool: boolean('SwimmingPool'),
  storageLot: integer('StorageLot'),
  toilets: integer('Toilets'),
  specialFeatures: text('SpecialFeatures'),
  yearBldgRefurb: integer('YearBldgRefurb'),
  zoning: varchar('Zoning', { length: 100 }),
  propTitleRef: varchar('PropTitleRef', { length: 255 }),
  propTitlePrefix: varchar('PropTitlePrefix', { length: 100 }),
  propTitleVolumeNo: integer('PropTitleVolumeNo'),
  propTitleFolioNo: integer('PropTitleFolioNo'),
  propTitleSuffix: varchar('PropTitleSuffix', { length: 100 }),
  saleStatus: varchar('SaleStatus', { length: 100 }),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  dataId: bigint('DataID', { mode: 'number' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  version: integer('Version'),
})

export const conveyancingTask = pgTable('ConveyancingTask', {
  id: integer('ID').primaryKey().notNull(),
  actionStepTaskId: integer('ActionStepTaskID'),
  conveyancingServiceId: integer('ConveyancingServiceID'),
  assignedTo: varchar('AssignedTo'),
  completedOn: timestamp('CompletedOn', { mode: 'string' }),
  dueDate: timestamp('DueDate', { mode: 'string' }),
  name: varchar('Name', { length: 255 }),
  priority: varchar('Priority', { length: 50 }),
  status: varchar('Status', { length: 50 }),
  step: varchar('Step', { length: 255 }),
  dataId: integer('DataID'),
  created: timestamp('Created', { mode: 'string' }),
  updated: timestamp('Updated', { mode: 'string' }),
  deleted: timestamp('Deleted', { mode: 'string' }),
  actionStepTaskCreated: timestamp('ActionStepTaskCreated', { mode: 'string' }),
  actionStepTaskUpdated: timestamp('ActionStepTaskUpdated', { mode: 'string' }),
})

export const gotoCallerActivitySummary = pgTable(
  'GotoCallerActivitySummary',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    phoneNumber: varchar('PhoneNumber', { length: 20 }).notNull(),
    importId: integer('ImportID').notNull(),
    phoneName: varchar('PhoneName', { length: 200 }),
    inboundVolume: integer('InboundVolume'),
    inboundDuration: integer('InboundDuration'),
    outboundVolume: integer('OutboundVolume'),
    outboundDuration: integer('OutboundDuration'),
    averageDuration: integer('AverageDuration'),
    volume: integer('Volume'),
    totalDuration: integer('TotalDuration'),
    created: timestamp('Created', { mode: 'string' }),
  },
  (table) => {
    return {
      gotoCallerActivitySummaryPkey: primaryKey({
        columns: [table.id, table.phoneNumber, table.importId],
        name: 'GotoCallerActivitySummary_pkey',
      }),
    }
  },
)

export const gotoUserActivitySummary = pgTable(
  'GotoUserActivitySummary',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    userId: uuid('UserId').notNull(),
    importId: integer('ImportID').notNull(),
    userName: varchar('UserName', { length: 20 }),
    inboundVolume: integer('InboundVolume'),
    inboundDuration: integer('InboundDuration'),
    outboundVolume: integer('OutboundVolume'),
    outboundDuration: integer('OutboundDuration'),
    averageDuration: integer('AverageDuration'),
    volume: integer('Volume'),
    totalDuration: integer('TotalDuration'),
    created: timestamp('Created', { mode: 'string' }),
  },
  (table) => {
    return {
      gotoUserActivitySummaryPkey: primaryKey({
        columns: [table.id, table.userId, table.importId],
        name: 'GotoUserActivitySummary_pkey',
      }),
    }
  },
)

export const gotoPhoneActivitySummary = pgTable(
  'GotoPhoneActivitySummary',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    phoneId: uuid('PhoneID').notNull(),
    importId: integer('ImportID').notNull(),
    phoneNumber: varchar('PhoneNumber', { length: 20 }),
    phoneName: varchar('PhoneName', { length: 200 }),
    inboundVolume: integer('InboundVolume'),
    inboundDuration: integer('InboundDuration'),
    outboundVolume: integer('OutboundVolume'),
    outboundDuration: integer('OutboundDuration'),
    averageDuration: integer('AverageDuration'),
    volume: integer('Volume'),
    totalDuration: integer('TotalDuration'),
    created: timestamp('Created', { mode: 'string' }),
  },
  (table) => {
    return {
      gotoPhoneActivitySummaryPkey: primaryKey({
        columns: [table.id, table.phoneId, table.importId],
        name: 'GotoPhoneActivitySummary_pkey',
      }),
    }
  },
)

export const gotoCallerActivityDetail = pgTable(
  'GotoCallerActivityDetail',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    phoneNumber: varchar('PhoneNumber', { length: 20 }).notNull(),
    organisationId: varchar('OrganisationID', { length: 20 }),
    startTime: timestamp('StartTime', { mode: 'string' }).notNull(),
    importId: integer('ImportID').notNull(),
    answerTime: timestamp('AnswerTime', { mode: 'string' }),
    endTime: timestamp('EndTime', { mode: 'string' }),
    direction: varchar('Direction', { length: 20 }),
    disposition: integer('Disposition'),
    duration: integer('Duration'),
    callerName: varchar('CallerName', { length: 50 }),
    callerNumber: varchar('CallerNumber', { length: 50 }),
    calleeName: varchar('CalleeName', { length: 50 }),
    calleeNumber: varchar('CalleeNumber', { length: 50 }),
    created: timestamp('Created', { mode: 'string' }),
  },
  (table) => {
    return {
      gotoCallerActivityDetailPkey: primaryKey({
        columns: [table.id, table.phoneNumber, table.startTime, table.importId],
        name: 'GotoCallerActivityDetail_pkey',
      }),
    }
  },
)

export const gotoPhoneActivityDetail = pgTable(
  'GotoPhoneActivityDetail',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    phoneId: uuid('PhoneID').notNull(),
    organisationId: varchar('OrganisationID', { length: 20 }),
    startTime: timestamp('StartTime', { mode: 'string' }).notNull(),
    importId: integer('ImportID').notNull(),
    answerTime: timestamp('AnswerTime', { mode: 'string' }),
    endTime: timestamp('EndTime', { mode: 'string' }),
    direction: varchar('Direction', { length: 20 }),
    disposition: integer('Disposition'),
    duration: integer('Duration'),
    callerName: varchar('CallerName', { length: 50 }),
    callerNumber: varchar('CallerNumber', { length: 50 }),
    calleeName: varchar('CalleeName', { length: 50 }),
    calleeNumber: varchar('CalleeNumber', { length: 50 }),
    created: timestamp('Created', { mode: 'string' }),
  },
  (table) => {
    return {
      gotoPhoneActivityDetailPkey: primaryKey({
        columns: [table.id, table.phoneId, table.startTime, table.importId],
        name: 'GotoPhoneActivityDetail_pkey',
      }),
    }
  },
)

export const gotoUserActivityDetail = pgTable(
  'GotoUserActivityDetail',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    userId: uuid('UserID').notNull(),
    organisationId: varchar('OrganisationID', { length: 20 }),
    startTime: timestamp('StartTime', { mode: 'string' }).notNull(),
    importId: integer('ImportID').notNull(),
    answerTime: timestamp('AnswerTime', { mode: 'string' }),
    endTime: timestamp('EndTime', { mode: 'string' }),
    direction: varchar('Direction', { length: 20 }),
    disposition: integer('Disposition'),
    duration: integer('Duration'),
    callerName: varchar('CallerName', { length: 50 }),
    callerNumber: varchar('CallerNumber', { length: 50 }),
    calleeName: varchar('CalleeName', { length: 50 }),
    calleeNumber: varchar('CalleeNumber', { length: 50 }),
    created: timestamp('Created', { mode: 'string' }),
  },
  (table) => {
    return {
      gotoUserActivityDetailPkey: primaryKey({
        columns: [table.id, table.userId, table.startTime, table.importId],
        name: 'GotoUserActivityDetail_pkey',
      }),
    }
  },
)

export const salesforceAudiences = pgTable(
  'SalesforceAudiences',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint('ID', { mode: 'number' }).notNull(),
    entryDate: timestamp('EntryDate', { mode: 'string' }).notNull(),
    uuid: varchar('UUID', { length: 40 }),
    longUuid: varchar('LongUUID', { length: 50 }),
    category: varchar('Category', { length: 100 }),
    subCategory: varchar('SubCategory', { length: 100 }),
    name: varchar('Name', { length: 120 }),
    description: text('Description'),
    type: varchar('Type', { length: 50 }),
    devices: integer('Devices'),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    pageViews: bigint('PageViews', { mode: 'number' }),
    isActive: boolean('IsActive'),
    lastComputed: timestamp('LastComputed', { mode: 'string' }),
    refreshFrequency: varchar('RefreshFrequency', { length: 10 }),
    contains3P: boolean('Contains3P'),
    isPersistent: boolean('IsPersistent'),
    activatedPartners: varchar('ActivatedPartners', { length: 50 }),
    distributionName: varchar('DistributionName', { length: 240 }),
    distributionIndex: numeric('DistributionIndex'),
    distributionUniques: integer('DistributionUniques'),
    created: timestamp('Created', { mode: 'string' }),
  },
  (table) => {
    return {
      salesforceAudiencesPkey: primaryKey({
        columns: [table.id, table.entryDate],
        name: 'SalesforceAudiences_pkey',
      }),
      salesforceAudiencesEntryDateKey: unique(
        'SalesforceAudiences_EntryDate_key',
      ).on(table.entryDate),
    }
  },
)
