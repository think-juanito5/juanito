import { type Static, type TSchema, Type as t } from '@sinclair/typebox'

const Nullable = <T extends TSchema>(schema: T) => t.Union([schema, t.Null()])

export const actionAttributesSchema = t.Object(
  {
    name: t.String(),
    reference: Nullable(t.String()),
    priority: t.Number(),
    status: t.String(),
    statusTimestamp: t.String(),
    isBillableOverride: Nullable(t.String()),
    createdTimestamp: t.String(),
    modifiedTimestamp: t.String(),
    isDeleted: t.String(),
    deletedBy: Nullable(t.String()),
    deletedTimestamp: Nullable(t.String()),
    isFavorite: Nullable(t.String()),
    overrideBillingStatus: Nullable(t.String()),
    lastAccessTimestamp: Nullable(t.String()),
    importExternalReference: Nullable(t.String()),
    amlReviewStatus: Nullable(t.String()),
  },
  { additionalProperties: true },
)
export type ActionAttributes = Static<typeof actionAttributesSchema>

export const dataCollectionRecordAttributesSchema = t.Object(
  {
    canDelete: t.String(),
    canWrite: t.String(),
  },
  { additionalProperties: true },
)
export type DataCollectionRecordAttributes = Static<
  typeof dataCollectionRecordAttributesSchema
>

export const actionParticipantAttributesSchema = t.Object(
  {
    participantNumber: t.Number(),
  },
  { additionalProperties: true },
)
export type ActionParticipantAttributes = Static<
  typeof actionParticipantAttributesSchema
>

export const FileNoteAttributes = t.Object(
  {
    enteredTimestamp: t.String(),
    text: t.String(),
    enteredBy: t.String(),
    source: t.String(),
    noteTimestamp: t.String(),
  },
  { additionalProperties: true },
)

export const TaskDataAttributes = t.Object(
  {
    name: t.String(),
    status: t.String(),
    priority: Nullable(t.String()),
    dueTimestamp: Nullable(t.String()),
    startedTimestamp: Nullable(t.String()),
    completedTimestamp: Nullable(t.String()),
    lastModifiedTimestamp: Nullable(t.String()),
    actualHours: Nullable(t.String()),
    billableHours: Nullable(t.String()),
    description: Nullable(t.String()),
    assignedBy: Nullable(t.String()),
    completeDuringStep: Nullable(t.Number()),
    completeBeforeStep: Nullable(t.Number()),
    mustStartBeforeTimestamp: Nullable(t.String()),
    expectedDurationValue: Nullable(t.String()),
    expectedDurationUnits: Nullable(t.String()),
    isBillingHold: Nullable(t.String()),
    isPartBilled: Nullable(t.String()),
    confirmedNonBillable: Nullable(t.String()),
    confirmedNonBillableTimestamp: Nullable(t.String()),
    hasTriggerDate: Nullable(t.String()),
    triggerField: Nullable(t.String()),
    triggerOffset: Nullable(t.Number()),
    triggerWeekdaysOnly: Nullable(t.String()),
  },
  { additionalProperties: true },
)
export type TaskAttributes = Static<typeof TaskDataAttributes>

export const ParticipantUpdatedAttributes = t.Object(
  {
    fax: Nullable(t.String()),
    sms: Nullable(t.String()),
    email: Nullable(t.String()),
    gender: Nullable(t.String()),
    suffix: Nullable(t.String()),
    amlNote: Nullable(t.String()),
    amlRisk: Nullable(t.String()),
    website: Nullable(t.String()),
    lastName: Nullable(t.String()),
    amlStatus: Nullable(t.String()),
    firstName: Nullable(t.String()),
    isCompany: t.String(),
    taxNumber: Nullable(t.String()),
    isDeceased: Nullable(t.String()),
    middleName: Nullable(t.String()),
    occupation: Nullable(t.String()),
    phone1Area: Nullable(t.Number()),
    phone2Area: Nullable(t.Number()),
    phone3Area: Nullable(t.Number()),
    phone4Area: Nullable(t.Number()),
    salutation: Nullable(t.String()),
    amlProgress: Nullable(t.Number()),
    companyName: Nullable(t.String()),
    displayName: Nullable(t.String()),
    mailingCity: Nullable(t.String()),
    phone1Label: Nullable(t.String()),
    phone1Notes: Nullable(t.String()),
    phone2Label: Nullable(t.String()),
    phone2Notes: Nullable(t.String()),
    phone3Label: Nullable(t.String()),
    phone3Notes: Nullable(t.String()),
    phone4Label: Nullable(t.String()),
    phone4Notes: Nullable(t.String()),
    phone1Number: Nullable(t.String()),
    phone2Number: Nullable(t.String()),
    phone3Number: Nullable(t.String()),
    phone4Number: Nullable(t.String()),
    physicalCity: Nullable(t.String()),
    mailingCounty: Nullable(t.String()),
    maritalStatus: Nullable(t.String()),
    phone1Country: Nullable(t.Number()),
    phone2Country: Nullable(t.Number()),
    phone3Country: Nullable(t.Number()),
    phone4Country: Nullable(t.Number()),
    preferredName: Nullable(t.String()),
    birthTimestamp: Nullable(t.String()),
    deathTimestamp: Nullable(t.String()),
    genderTypeName: Nullable(t.String()),
    physicalCounty: Nullable(t.String()),
    mailingPostCode: Nullable(t.String()),
    countryIdOfBirth: Nullable(t.String()),
    createdTimestamp: t.String(),
    physicalPostCode: Nullable(t.String()),
    dateOfBirthStatus: Nullable(t.String()),
    modifiedTimestamp: t.String(),
    citizenOfCountryId: Nullable(t.String()),
    mailingAddressLine1: Nullable(t.String()),
    mailingAddressLine2: Nullable(t.String()),
    mailingStateProvince: Nullable(t.String()),
    physicalAddressLine1: Nullable(t.String()),
    physicalAddressLine2: Nullable(t.String()),
    physicalStateProvince: Nullable(t.String()),
    importExternalReference: Nullable(t.String()),
  },
  { additionalProperties: true },
)

export const ActionDocumentAttributes = t.Object(
  {
    name: t.String(),
    createdTimestamp: t.String(),
    modifiedTimestamp: t.String(),
    documentTimestamp: Nullable(t.String()),
    status: t.String(),
    keywords: Nullable(t.String()),
    summary: Nullable(t.String()),
    checkedOutTimestamp: Nullable(t.String()),
    fileType: Nullable(t.String()),
    checkedOutTo: Nullable(t.String()),
    checkedOutEtaTimestamp: Nullable(t.String()),
    fileSize: Nullable(t.Number()),
    extension: Nullable(t.String()),
    sharepointUrl: Nullable(t.String()),
    fileName: Nullable(t.String()),
    isDeleted: Nullable(t.String()),
    file: Nullable(t.String()),
  },
  { additionalProperties: true },
)

export const TimeEntriesAttributes = t.Object(
  {
    timestampDate: Nullable(t.String()),
    description: Nullable(t.String()),
    actualHours: Nullable(t.String()),
    billableHours: Nullable(t.String()),
    createdTimestamp: Nullable(t.String()),
    startTime: Nullable(t.String()),
    timerStatus: Nullable(t.String()),
    timerStartedClientTimestamp: Nullable(t.String()),
    timerDurationSeconds: Nullable(t.Number()),
    billingBehavior: Nullable(t.String()),
    rateUnitPrice: Nullable(t.String()),
    rateSource: Nullable(t.String()),
    rateTimestamp: Nullable(t.String()),
    billableAmountType: Nullable(t.String()),
    billableAmount: Nullable(t.String()),
    isBillable: Nullable(t.String()),
    importExternalReference: Nullable(t.String()),
    billReference: Nullable(t.String()),
  },
  { additionalProperties: true },
)

export const DisbursementAttributes = t.Object(
  {
    date: Nullable(t.String()),
    description: Nullable(t.String()),
    quantity: Nullable(t.String()),
    unitPrice: Nullable(t.String()),
    unitPriceIncludesTax: Nullable(t.String()),
    utbmsExpenseCode: Nullable(t.String()),
    importExternalReference: Nullable(t.String()),
    enteredTimestamp: Nullable(t.String()),
  },
  { additionalProperties: true },
)

export const dataCollectionRecordValueAttributes = t.Object(
  {},
  { additionalProperties: true },
)

const MetaResthook = t.Object({
  id: t.String(),
  target: t.String(),
  trigger_count: t.Number(),
  event_name: t.String(),
  resource_type: t.String(),
  resource_id: t.Union([t.String(), t.Number()]),
})

export const Meta = t.Object({
  paging: t.Optional(
    t.Record(
      t.String(),
      t.Object({
        pageCount: t.Number(),
        recordCount: t.Number(),
      }),
    ),
  ),
  debug: t.Optional(
    t.Object({
      requestTime: t.String(),
      mem: t.String(),
      server: t.String(),
      cb: t.String(),
      time: t.String(),
      appload: t.String(),
      app: t.String(),
      db: t.String(),
      dbc: t.String(),
      qc: t.String(),
      uqc: t.String(),
      fc: t.String(),
      rl: Nullable(t.String()),
      resthook: t.Optional(MetaResthook),
    }),
  ),
})

export const JsonApi = t.Object(
  {
    version: t.String(),
  },
  { additionalProperties: true },
)

export type RelationshipData = Static<typeof relationshipDataSchema>
export const relationshipDataSchema = t.Optional(
  Nullable(
    t.Object({
      data: t.Union([
        t.Object({
          type: t.String(),
          id: t.String(),
        }),
        t.Array(
          t.Object({
            type: t.String(),
            id: t.String(),
          }),
        ),
        t.Null(),
      ]),
    }),
  ),
)

export const relationshipsSchema = t.Object(
  {
    action: relationshipDataSchema,
    actionType: relationshipDataSchema,
    assignedTo: relationshipDataSchema,
    assignee: relationshipDataSchema,
    billSettings: relationshipDataSchema,
    checkedOutBy: relationshipDataSchema,
    confirmedNonBillableBy: relationshipDataSchema,
    createdBy: relationshipDataSchema,
    division: relationshipDataSchema,
    document: relationshipDataSchema,
    documentTemplate: relationshipDataSchema,
    folder: relationshipDataSchema,
    linkedDocumentTemplate: relationshipDataSchema,
    linkedDataCollection: relationshipDataSchema,
    participant: relationshipDataSchema,
    participantType: relationshipDataSchema,
    primaryParticipants: relationshipDataSchema,
    primary_participants: relationshipDataSchema,
    rate: relationshipDataSchema,
    relatedActions: relationshipDataSchema,
    step: relationshipDataSchema,
    tags: t.Optional(t.Union([t.Array(t.String()), relationshipDataSchema])),
    template: relationshipDataSchema,
    triggerDataCollection: relationshipDataSchema,
  },
  { additionalProperties: true },
)
export type Relationships = Static<typeof relationshipsSchema>

export const XAttributesSchema = t.Union([
  actionAttributesSchema,
  dataCollectionRecordAttributesSchema,
  actionParticipantAttributesSchema,
  ParticipantUpdatedAttributes,
  TaskDataAttributes,
  FileNoteAttributes,
  ActionDocumentAttributes,
  TimeEntriesAttributes,
  DisbursementAttributes,
  dataCollectionRecordValueAttributes,
])
export type XAttributes = Static<typeof XAttributesSchema>

const XRelationships = Nullable(relationshipsSchema)

// CommonData schema
const CommonEventData = t.Object(
  {
    type: t.String(),
    id: t.String(),
    attributes: t.Optional(XAttributesSchema),
    relationships: t.Optional(XRelationships),
  },
  { additionalProperties: true },
)

// Actionstep Event Webhook
export type ActionstepWebhook = Static<typeof actionstepWebhookSchema>
export const actionstepWebhookSchema = t.Object({
  jsonapi: JsonApi,
  data: CommonEventData,
  meta: Meta,
})
