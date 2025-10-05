import {
  bigint,
  boolean,
  char,
  date,
  doublePrecision,
  foreignKey,
  index,
  integer,
  interval,
  numeric,
  pgSchema,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'

export const silverSchema = pgSchema('silver')

export const factStaleMatters = silverSchema.table('fact_stale_matters', {
  actionId: integer('action_id').primaryKey().notNull(),
  dateMatterCreated: date('date_matter_created').notNull(),
  isTestMatter: boolean('is_test_matter').notNull(),
  stepName: text('step_name'),
  leadJourney: text('lead_journey'),
  typeformQuestionsAnswered: integer('typeform_questions_answered').notNull(),
  unbilledDisbursements: doublePrecision('unbilled_disbursements').notNull(),
  outstandingInvoices: doublePrecision('amount_outstanding').notNull(),
})

export const factGrossLeads = silverSchema.table('fact_gross_leads', {
  id: integer('id')
    .primaryKey()
    .notNull()
    .references(() => dimGrossLeads.id),
  dateCreated: date('date_created').references(() => dimDates.date),
  brandKey: integer('brand_key').references(() => dimBrands.brandId),
  stateKey: integer('state_key').references(() => dimStates.stateId),
  actionKey: integer('action_key').references(() => dimMatters.actionId),
  leadType: text('lead_type'),
  productKey: text('product_key').references(() => dimProducts.productId),
  discountKey: text('discount_key').references(() => dimDiscounts.discountId),
  amountOfDiscount: numeric('amount_of_discount', { precision: 10, scale: 2 }),
  associateKey: text('associate_key').references(
    () => dimEmployees.associateId,
  ),
  timeCreated: timestamp('time_created', { mode: 'string' }),
  invalid: boolean('invalid').notNull(),
  mql: boolean('mql').notNull(),
  sql: boolean('sql').notNull(),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factMatters = silverSchema.table(
  'fact_matters',
  {
    actionId: integer('action_id')
      .primaryKey()
      .notNull()
      .references(() => dimMatters.actionId),
    brandKey: integer('brand_key').references(() => dimBrands.brandId),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    stateKey: integer('state_key').references(() => dimStates.stateId),
    propertyKey: integer('property_key'),
    productKey: text('product_key').references(() => dimProducts.productId),
    leadKey: integer('lead_key').references(() => dimGrossLeads.id),
    discountKey: text('discount_key').references(() => dimDiscounts.discountId),
    dateMatterCreated: date('date_matter_created')
      .notNull()
      .references(() => dimDates.date),
    dateOfContractDraft: date('date_of_contract_draft'),
    dateOfContractReview: date('date_of_contract_review'),
    dateOfSettlement: date('date_of_settlement'),
    dateOfCancellation: date('date_of_cancellation'),
    dateOfTermination: date('date_of_termination'),
    isOto: boolean('is_oto').notNull(),
    isTestMatter: boolean('is_test_matter').notNull(),
    isMigratedMatter: boolean('is_migrated_matter').notNull(),
    isRestrictedMatter: boolean('is_restricted_matter').notNull(),
    hasDraft: boolean('has_draft').notNull(),
    hasReview: boolean('has_review').notNull(),
    hasSettled: boolean('has_settled').notNull(),
    hasCancelled: boolean('has_cancelled').notNull(),
    hasTerminated: boolean('has_terminated').notNull(),
    isRepeat: boolean('is_repeat').notNull(),
    lastActivityTimestamp: timestamp('last_activity_timestamp', {
      withTimezone: true,
      mode: 'string',
    }),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    dateFirstClosed: date('date_first_closed'),
    legalismsAgreedTo: integer('legalisms_agreed_to'),
    sale: integer('sale').notNull(),
    dateOfSale: date('date_of_sale').references(() => dimDates.date),
  },
  (table) => {
    return {
      factMattersBrandKeyPropertyKeyFkey: foreignKey({
        columns: [table.brandKey, table.propertyKey],
        foreignColumns: [dimProperties.brandId, dimProperties.propertyId],
        name: 'fact_matters_brand_key_property_key_fkey',
      }),
    }
  },
)

export const dimEmployees = silverSchema.table(
  'dim_employees',
  {
    associateId: text('associate_id').primaryKey().notNull(),
    title: text('title'),
    name: text('name'),
    status: text('status'),
    position: text('position'),
    team: text('team'),
    department: text('department'),
    manager: text('manager'),
    immediateLeader: text('immediate_leader'),
    workingArrangement: text('working_arrangement'),
    employmentStatus: text('employment_status'),
    startDate: date('start_date'),
    effectiveEndDate: date('effective_end_date'),
    lastWorkingDay: date('last_working_day'),
    changeDate: date('change_date'),
    country: text('country'),
    stateKey: smallint('state_key').references(() => dimStates.stateId),
    entity: text('entity'),
    legalName: text('legal_name'),
    firstNameWork: text('first_name_work'),
    lastNameWork: text('last_name_work'),
    firstNameLegal: text('first_name_legal'),
    lastNameLegal: text('last_name_legal'),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    created: timestamp('created', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      dimEmployeesTitleUnique: unique('dim_employees_title_unique').on(
        table.title,
      ),
    }
  },
)

export const joinEmployees = silverSchema.table(
  'join_employees',
  {
    associateId: text('associate_id').primaryKey().notNull(),
    email: text('email'),
    actionstepId: integer('actionstep_id'),
    dataverseId: text('dataverse_id'),
    pipedriveId: integer('pipedrive_id'),
    azureAdId: text('azure_ad_id'),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    created: timestamp('created', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      joinEmployeesTitleUnique: unique('join_employees_associateId_unique').on(
        table.associateId,
      ),
    }
  },
)

export const dimDates = silverSchema.table(
  'dim_dates',
  {
    dateId: integer('date_id').notNull(),
    date: date('date').primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    epoch: bigint('epoch', { mode: 'number' }).notNull(),
    daySuffix: varchar('day_suffix', { length: 4 }).notNull(),
    dayName: varchar('day_name', { length: 9 }).notNull(),
    dayOfWeek: integer('day_of_week').notNull(),
    dayOfMonth: integer('day_of_month').notNull(),
    dayOfQuarter: integer('day_of_quarter').notNull(),
    dayOfYear: integer('day_of_year').notNull(),
    weekOfMonth: integer('week_of_month').notNull(),
    weekOfYear: integer('week_of_year').notNull(),
    weekOfYearIso: char('week_of_year_iso', { length: 10 }).notNull(),
    monthActual: integer('month_actual').notNull(),
    monthName: varchar('month_name', { length: 9 }).notNull(),
    monthNameAbbreviated: char('month_name_abbreviated', {
      length: 3,
    }).notNull(),
    quarterActual: integer('quarter_actual').notNull(),
    quarterName: varchar('quarter_name', { length: 9 }).notNull(),
    yearActual: integer('year_actual').notNull(),
    firstDayOfWeek: date('first_day_of_week').notNull(),
    lastDayOfWeek: date('last_day_of_week').notNull(),
    firstDayOfMonth: date('first_day_of_month').notNull(),
    lastDayOfMonth: date('last_day_of_month').notNull(),
    firstDayOfQuarter: date('first_day_of_quarter').notNull(),
    lastDayOfQuarter: date('last_day_of_quarter').notNull(),
    firstDayOfYear: date('first_day_of_year').notNull(),
    lastDayOfYear: date('last_day_of_year').notNull(),
    mmyyyy: char('mmyyyy', { length: 6 }).notNull(),
    mmddyyyy: char('mmddyyyy', { length: 10 }).notNull(),
    weekendIndr: boolean('weekend_indr').notNull(),
  },
  (table) => {
    return {
      dimDatesDateIdKey: unique('dim_dates_date_id_key').on(table.dateId),
    }
  },
)

export const factWriteOffsCca = silverSchema.table('fact_write_offs_cca', {
  salePurchaseId: integer('sale_purchase_id').primaryKey().notNull(),
  salePurchaseDate: date('sale_purchase_date')
    .notNull()
    .references(() => dimDates.date),
  actionKey: integer('action_key')
    .notNull()
    .references(() => dimMatters.actionId),
  associateKey: text('associate_key').references(
    () => dimEmployees.associateId,
  ),
  fees: numeric('fees', { precision: 10, scale: 2 }),
  disbursements: numeric('disbursements', { precision: 10, scale: 2 }),
  amountBilled: numeric('amount_billed', { precision: 10, scale: 2 }),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factSalesRbi = silverSchema.table(
  'fact_sales_rbi',
  {
    jobId: integer('job_id').primaryKey().notNull(),
    dealKey: integer('deal_key'),
    brandKey: integer('brand_key')
      .notNull()
      .references(() => dimBrands.brandId),
    stateKey: integer('state_key').references(() => dimStates.stateId),
    productKey: text('product_key').references(() => dimProducts.productId),
    propertyKey: integer('property_key'),
    discountKey: text('discount_key').references(() => dimDiscounts.discountId),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    leadKey: integer('lead_key').references(() => dimGrossLeads.id),
    dateOfSale: date('date_of_sale').references(() => dimDates.date),
    dateOfInspection: date('date_of_inspection'),
    dateOfCancellation: date('date_of_cancellation'),
    hasCancelled: boolean('has_cancelled'),
    hasWebformAgreement: boolean('has_webform_agreement'),
    timeOfInspection: time('time_of_inspection'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    sale: integer('sale').notNull(),
  },
  (table) => {
    return {
      factSalesRbiBrandKeyPropertyKeyFkey: foreignKey({
        columns: [table.brandKey, table.propertyKey],
        foreignColumns: [dimProperties.brandId, dimProperties.propertyId],
        name: 'fact_sales_rbi_brand_key_property_key_fkey',
      }),
    }
  },
)

export const dimMatters = silverSchema.table('dim_matters', {
  actionId: integer('action_id').primaryKey().notNull(),
  actionName: text('action_name'),
  stepName: text('step_name'),
  actionTypeName: text('action_type_name'),
  actionStatus: text('action_status'),
  reasonForCancellation: text('reason_for_cancellation'),
  reasonForTermination: text('reason_for_termination'),
  reasonForWriteOff: text('reason_for_write_off'),
  cancellationWork: text('cancellation_work'),
  actionUrl: text('action_url'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  pexaWorkspaceUrl: text('pexa_workspace_url'),
  banner: text('banner'),
})

export const dimDiscounts = silverSchema.table('dim_discounts', {
  discountId: text('discount_id').primaryKey().notNull(),
  discountType: text('discount_type').notNull(),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  deleted: timestamp('deleted', { withTimezone: true, mode: 'string' }),
  brandKey: integer('brand_key').references(() => dimBrands.brandId),
})

export const dimStates = silverSchema.table('dim_states', {
  stateId: smallint('state_id').primaryKey().notNull(),
  state: text('state'),
  stateName: text('state_name'),
  timezone: text('timezone'),
  windowsTimezone: text('windows_timezone'),
})

export const dimGrossLeads = silverSchema.table('dim_gross_leads', {
  id: integer('id').primaryKey().notNull(),
  transactionStatus: text('transaction_status'),
  dealStatus: text('deal_status'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  channel: text('channel'),
  lostReason: text('lost_reason'),
  timeToTransact: text('time_to_transact'),
  referralPage: text('referral_page'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  dealKey: integer('deal_key'),
  lead_journey: text('lead_journey'),
})

export const factAllocationToFirstCall = silverSchema.table(
  'fact_allocation_to_first_call',
  {
    actionId: integer('action_id')
      .primaryKey()
      .notNull()
      .references(() => dimMatters.actionId),
    associateKey: text('associate_key'),
    brandKey: integer('brand_key'),
    productKey: text('product_key').references(() => dimProducts.productId),
    stateKey: integer('state_key').references(() => dimStates.stateId),
    conveyType: text('convey_type'),
    draftingAlloc: timestamp('drafting_alloc', {
      withTimezone: true,
      mode: 'string',
    }),
    draftingFc: timestamp('drafting_fc', {
      withTimezone: true,
      mode: 'string',
    }),
    conveyanceAlloc: timestamp('conveyance_alloc', {
      withTimezone: true,
      mode: 'string',
    }),
    conveyanceFc: timestamp('conveyance_fc', {
      withTimezone: true,
      mode: 'string',
    }),
    businessHoursAllocToFcDrafting: numeric(
      'business_hours_alloc_to_fc_drafting',
    ),
    businessHoursAllocToFcConveyance: numeric(
      'business_hours_alloc_to_fc_conveyance',
    ),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
)

export const factDraftingTurnaroundTime = silverSchema.table(
  'fact_drafting_turnaround_time',
  {
    actionId: integer('action_id')
      .primaryKey()
      .notNull()
      .references(() => dimMatters.actionId),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    stateKey: integer('state_key')
      .notNull()
      .references(() => dimStates.stateId),
    timeAllocated: timestamp('time_allocated', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    timeWebformCompleted: timestamp('time_webform_completed', {
      withTimezone: true,
      mode: 'string',
    }),
    timeContractSent: timestamp('time_contract_sent', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    businessDaysInProgress: integer('business_days_in_progress').notNull(),
    resubs: integer('resubs').notNull(),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
)

export const factEmailSms = silverSchema.table('fact_email_sms', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  emailId: bigint('email_id', { mode: 'number' }).primaryKey().notNull(),
  date: date('date').references(() => dimDates.date),
  actionKey: integer('action_key').references(() => dimMatters.actionId),
  message: text('message'),
  templateName: text('template_name'),
  templateType: text('template_type'),
  associateKey: text('associate_key').references(
    () => dimEmployees.associateId,
  ),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const dimActionstepIdMapping = silverSchema.table(
  'dim_actionstep_id_mapping',
  {
    participantId: integer('participant_id').primaryKey().notNull(),
    associateId: text('associate_id').references(
      () => dimEmployees.associateId,
    ),
    email: text('email'),
    displayName: text('display_name'),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' }),
  },
  (table) => {
    return {
      associateIdIdx: index('associate_id_idx').on(table.associateId),
    }
  },
)

export const dimBrands = silverSchema.table(
  'dim_brands',
  {
    brandId: integer('brand_id').primaryKey().notNull(),
    brand: text('brand').notNull(),
    brandName: text('brand_name').notNull(),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    deleted: timestamp('deleted', { withTimezone: true, mode: 'string' }),
  },
  (table) => {
    return {
      dimBrandsBrandKey: unique('dim_brands_brand_key').on(table.brand),
      dimBrandsBrandNameKey: unique('dim_brands_brand_name_key').on(
        table.brandName,
      ),
    }
  },
)

export const factBasecheck = silverSchema.table('fact_basecheck', {
  actionId: integer('action_id')
    .primaryKey()
    .notNull()
    .references(() => dimMatters.actionId),
  fileStatusTaskCompletedTime: timestamp('file_status_task_completed_time', {
    mode: 'string',
  }),
  bc1CompletedTime: timestamp('bc1_completed_time', { mode: 'string' }),
  bc2CompletedTime: timestamp('bc2_completed_time', { mode: 'string' }),
  baseCheck1Resubs: integer('base_check_1_resubs'),
  baseCheck2Resubs: integer('base_check_2_resubs'),
  totalResubs: integer('total_resubs'),
  businessDaysToComplete: integer('business_days_to_complete_bc1'),
  businessDaysBc1CompletedBeforeSettlement: integer(
    'business_days_bc1_completed_before_settlement',
  ),
  businessDaysBc2CompletedBeforeSettlement: integer(
    'business_days_bc2_completed_before_settlement',
  ),
  businessDaysReadyBeforeSettlement: integer(
    'business_days_ready_before_settlement',
  ),
  baseCheck1Status: text('base_check_1_status'),
  baseCheck2Status: text('base_check_2_status'),
  fileStatusTaskCompletionTiming: text('file_status_task_completion_timing'),
  fileStatusTaskTag: text('file_status_task_tag'),
  created: timestamp('created', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  modified: timestamp('modified', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
})

export const factBasecheckResubs = silverSchema.table(
  'fact_basecheck_resubs',
  {
    actionId: integer('action_id')
      .notNull()
      .references(() => dimMatters.actionId),
    resubInstanceId: integer('resub_instance_id').notNull(),
    timeCreated: timestamp('time_created', { mode: 'string' }).notNull(),
    timeCompleted: timestamp('time_completed', { mode: 'string' }),
    baseCheck1Resubs: integer('base_check_1_resub'),
    baseCheck2Resubs: integer('base_check_2_resub'),
    totalResubs: integer('total_resubs'),
    failedItems: integer('failed_items'),
    commentary: text('commentary'),
    created: timestamp('created', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      factBasecheckResubsPkey: primaryKey({
        columns: [table.actionId, table.resubInstanceId],
        name: 'fact_basecheck_resubs_pkey',
      }),
    }
  },
)

export const factBasecheckResubItems = silverSchema.table(
  'fact_basecheck_resub_items',
  {
    actionId: integer('action_id')
      .notNull()
      .references(() => dimMatters.actionId),
    resubInstanceId: integer('resub_instance_id').notNull(),
    failedItemId: integer('failed_item_id').notNull(),
    date: date('date')
      .notNull()
      .references(() => dimDates.date),
    failedItem: text('failed_item').notNull(),
    created: timestamp('created', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      factBasecheckResubItemsPkey: primaryKey({
        columns: [table.actionId, table.resubInstanceId, table.failedItemId],
        name: 'fact_basecheck_resub_items_pkey',
      }),
    }
  },
)

export const factLeadFees = silverSchema.table('fact_lead_fees', {
  dealId: integer('deal_id').primaryKey().notNull(),
  leadKey: integer('lead_key').references(() => dimGrossLeads.id),
  fixedFee: numeric('Fixed Fee', { precision: 10, scale: 2 }),
  searchesFee: numeric('Searches Fee', { precision: 10, scale: 2 }),
  reviewFee: numeric('Review Fee', { precision: 10, scale: 2 }),
  draftingFee: numeric('Drafting Fee', { precision: 10, scale: 2 }),
  discountOffered: numeric('Discount Offered', { precision: 10, scale: 2 }),
  created: timestamp('created', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  modified: timestamp('modified', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
})

export const factCrmPaidStatus = silverSchema.table('fact_crm_paid_status', {
  dealId: integer('deal_id').primaryKey().notNull(),
  updatedToPaidStatus: timestamp('updated_to_paid_status', { mode: 'string' }),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factLongNurture = silverSchema.table('fact_long_nurture', {
  dealId: integer('deal_id').primaryKey().notNull(),
  dateCreated: date('date_created').references(() => dimDates.date),
  brandKey: integer('brand_key').references(() => dimBrands.brandId),
  stateKey: integer('state_key').references(() => dimStates.stateId),
  actionKey: integer('action_key').references(() => dimMatters.actionId),
  leadType: text('lead_type'),
  productKey: text('product_key'),
  associateKey: text('associate_key').references(
    () => dimEmployees.associateId,
  ),
  dateOfSale: date('date_of_sale').references(() => dimDates.date),
  sale: integer('sale'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factMatterProducts = silverSchema.table('fact_matter_products', {
  actionId: integer('action_id')
    .primaryKey()
    .notNull()
    .references(() => dimMatters.actionId),
  firstAssociateKey: text('first_associate_key').references(
    () => dimEmployees.associateId,
  ),
  hasReview: boolean('has_review').notNull(),
  hasBeenInPresettlementStep: boolean(
    'has_been_in_presettlement_step',
  ).notNull(),
  hasPriorReview: boolean('has_prior_review').notNull(),
  hasFutureMatters: boolean('has_future_matters').notNull(),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factMatterTimeline = silverSchema.table('fact_matter_timeline', {
  actionId: integer('action_id')
    .primaryKey()
    .notNull()
    .references(() => dimMatters.actionId),
  associateKey: text('associate_key').references(
    () => dimEmployees.associateId,
  ),
  productKey: text('product_key').references(() => dimProducts.productId),
  dateMatterCreated: date('date_matter_created')
    .notNull()
    .references(() => dimDates.date),
  dateMatterAllocated: date('date_matter_allocated'),
  dateIntoPreSettleStep: date('date_into_pre_settle_step'),
  dateOfFirstCall: date('date_of_first_call'),
  dateOfFirstLetter: date('date_of_first_letter'),
  dateSearchesOrdered: date('date_searches_ordered'),
  dateOfDischarge: date('date_of_discharge'),
  dateOfDraftSettlementStatement: date('date_of_draft_settlement_statement'),
  dateOfBaseCheck: date('date_of_base_check'),
  dateEnd: date('date_end'),
  endCondition: text('end_condition'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factMcReady = silverSchema.table(
  'fact_mc_ready',
  {
    dataInputId: integer('data_input_id').primaryKey().notNull(),
    dealKey: integer('deal_key').notNull(),
    brandKey: integer('brand_key').references(() => dimBrands.brandId),
    actionKey: integer('action_key').references(() => dimMatters.actionId),
    leadTimestamp: timestamp('lead_timestamp', { mode: 'string' }),
    mcTimestamp: timestamp('mc_timestamp', { mode: 'string' }),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      dealKeyIdx: index('deal_key_idx').on(table.dealKey),
    }
  },
)

export const factPhonesNice = silverSchema.table('fact_phones_nice', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  contactId: bigint('contact_id', { mode: 'number' }).primaryKey().notNull(),
  associateKey: text('associate_key').references(
    () => dimEmployees.associateId,
  ),
  isCall: boolean('is_call'),
  secondsInQueue: integer('seconds_in_queue'),
  secondsToAnswer: integer('seconds_to_answer'),
  secondsTalking: integer('seconds_talking'),
  secondsToAbandon: integer('seconds_to_abandon'),
  secondsInPostQueue: integer('seconds_in_post_queue'),
  secondsAcw: integer('seconds_acw'),
  timeStart: timestamp('time_start', { withTimezone: true, mode: 'string' }),
  timeAnswer: timestamp('time_answer', { withTimezone: true, mode: 'string' }),
  timeEnd: timestamp('time_end', { withTimezone: true, mode: 'string' }),
  agentName: text('agent_name'),
  skillName: text('skill_name'),
  disposition: text('disposition'),
  direction: text('direction'),
  otherPartyName: text('other_party_name'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  secondsHold: integer('seconds_hold'),
})

export const factQaHeader = silverSchema.table('fact_qa_header', {
  id: text('id').primaryKey().notNull(),
  stateKey: integer('state_key').references(() => dimStates.stateId),
  associateKeyOwner: text('associate_key_owner').references(
    () => dimEmployees.associateId,
  ),
  associateKeyCreator: text('associate_key_creator').references(
    () => dimEmployees.associateId,
  ),
  actionKey: integer('action_key').references(() => dimMatters.actionId),
  dateCreated: date('date_created')
    .notNull()
    .references(() => dimDates.date),
  dateOfSettlement: date('date_of_settlement'),
  isMatterEscalated: boolean('is_matter_escalated').notNull(),
  isMatterReallocatedToParalegal: boolean(
    'is_matter_reallocated_to_paralegal',
  ).notNull(),
  isContravention: boolean('is_contravention').notNull(),
  qaEvaluation: text('qa_evaluation').notNull(),
  transactionType: text('transaction_type'),
  source: text('source').notNull(),
  result: text('result'),
  score: numeric('score', { precision: 10, scale: 4 }),
  commentaryProvidedByReviewer: text('commentary_provided_by_reviewer'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factRbiCancellations = silverSchema.table(
  'fact_rbi_cancellations',
  {
    dataInputId: integer('data_input_id').primaryKey().notNull(),
    dealKey: integer('deal_key'),
    dateOfCancellation: date('date_of_cancellation'),
    dateBookingMade: date('date_booking_made'),
    jobNumber: integer('job_number').notNull(),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factRbiCancellationsJobNumberKey: unique(
        'fact_rbi_cancellations_job_number_key',
      ).on(table.jobNumber),
    }
  },
)

export const factDraftingProgress = silverSchema.table(
  'fact_drafting_progress',
  {
    actionId: integer('action_id')
      .primaryKey()
      .notNull()
      .references(() => dimMatters.actionId),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    stateKey: integer('state_key')
      .notNull()
      .references(() => dimStates.stateId),
    dateMatterCreated: date('date_matter_created')
      .notNull()
      .references(() => dimDates.date),
    fileNote: text('file_note'),
    timeSince: timestamp('time_since', { withTimezone: true, mode: 'string' }),
    fileStatus: text('file_status'),
    trafficLight: text('traffic_light'),
    daysToTurnaround: integer('days_to_turnaround'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    agreements: text('agreements'),
  },
)

export const factDraftingTasks = silverSchema.table('fact_drafting_tasks', {
  actionId: integer('action_id')
    .primaryKey()
    .notNull()
    .references(() => dimMatters.actionId),
  stateKey: integer('state_key').references(() => dimStates.stateId),
  dateMatterCreated: date('date_matter_created').notNull(),
  isOnHold: boolean('is_on_hold').notNull(),
  fileCompleted: boolean('file_completed').notNull(),
  isWithSales: boolean('is_with_sales'),
  webformCompleteStatus: text('webform_complete_status'),
  firstCallStatus: text('first_call_status'),
  searchesStatus: text('searches_status'),
  invoiceStatus: text('invoice_status'),
  documentsStatus: text('documents_status'),
  certificationStatus: text('certification_status'),
  negotiationsStatus: text('negotiations_status'),
  webformCompleteColour: text('webform_complete_colour'),
  firstCallColour: text('first_call_colour'),
  searchesColour: text('searches_colour'),
  invoiceColour: text('invoice_colour'),
  documentsColour: text('documents_colour'),
  certificationColour: text('certification_colour'),
  negotiationsColour: text('negotiations_colour'),
  fileNote: text('file_note'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factOneDollarDraftingUptake = silverSchema.table(
  'fact_one_dollar_drafting_uptake',
  {
    actionId: integer('action_id')
      .primaryKey()
      .notNull()
      .references(() => dimMatters.actionId),
    dateWebformCompleted: date('date_webform_completed').references(
      () => dimDates.date,
    ),
    oneDollarOfferUptake: boolean('one_dollar_offer_uptake'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
)

export const factPdInvalidLeads = silverSchema.table('fact_pd_invalid_leads', {
  dealId: integer('deal_id').primaryKey().notNull(),
  lostReason: text('lost_reason'),
  timeChanged: timestamp('time_changed', {
    withTimezone: true,
    mode: 'string',
  }),
  associateKey: text('associate_key'),
  productKey: text('product_key'),
  stateKey: integer('state_key'),
  utmCampaign: text('utm_campaign'),
  fullName: text('full_name'),
  phone: text('phone'),
  phoneHome: text('phone_home'),
  phoneWork: text('phone_work'),
  phoneMobile: text('phone_mobile'),
  contactAttempts: integer('contact_attempts'),
  agentTime: interval('agent_time'),
  notes: text('notes'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factSettlementSignOff = silverSchema.table(
  'fact_settlement_sign_off',
  {
    actionId: integer('action_id')
      .primaryKey()
      .notNull()
      .references(() => dimMatters.actionId),
    brandKey: integer('brand_key').references(() => dimBrands.brandId),
    stateKey: integer('state_key').references(() => dimStates.stateId),
    productKey: text('product_key').references(() => dimProducts.productId),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    associateKeyLawyer: text('associate_key_lawyer').references(
      () => dimEmployees.associateId,
    ),
    dateOfSettlement: date('date_of_settlement').references(
      () => dimDates.date,
    ),
    timeReadyForSignOff: timestamp('time_ready_for_sign_off', {
      withTimezone: true,
      mode: 'string',
    }),
    isRestrictedMatter: boolean('is_restricted_matter'),
    isStampDutyDone: boolean('is_stamp_duty_done'),
    isTrust: boolean('is_trust'),
    isReadyForSignOff: boolean('is_ready_for_sign_off'),
    baseCheck: text('base_check'),
    signoff: text('signoff'),
    statusOfMatter: text('status_of_matter'),
    progression: text('progression'),
    notesLawyer: text('notes_lawyer'),
    notesParalegal: text('notes_paralegal'),
    dualAuth: text('dual_auth'),
    mannerStatus: text('manner_status'),
    docsSigned: text('docs_signed'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    baseCheck2: text('base_check_2'),
    soaChecked: text('soa_checked'),
  },
)

export const factSignoff = silverSchema.table('fact_signoff', {
  actionId: integer('action_id').primaryKey().notNull(),
  brandKey: integer('brand_key').references(() => dimBrands.brandId),
  stateKey: integer('state_key').references(() => dimStates.stateId),
  productKey: text('product_key').references(() => dimProducts.productId),
  associateKey: text('associate_key').references(
    () => dimEmployees.associateId,
  ),
  dateOfSettlement: date('date_of_settlement').references(() => dimDates.date),
  voiApproved: text('VOI Approved'),
  stampDuty: text('Stamp Duty'),
  qro: text('QRO'),
  baseCheck: text('Base Check'),
  soaPrepared: text('SOA Prepared'),
  soaChecked: text('SOA Checked'),
  documentsSigned: text('Documents Signed'),
  signOffStatus: text('Sign Off Status'),
  voiColour: text('voi_colour'),
  stampColour: text('stamp_colour'),
  qroColour: text('qro_colour'),
  baseColour: text('base_colour'),
  soaPreparedColour: text('soa_prepared_colour'),
  soaColour: text('soa_colour'),
  docsColour: text('docs_colour'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  hypercare: text('hypercare'),
})

export const factTasks = silverSchema.table('fact_tasks', {
  taskId: integer('task_id').primaryKey().notNull(),
  actionKey: integer('action_key').references(() => dimMatters.actionId),
  associateKey: text('associate_key').references(
    () => dimEmployees.associateId,
  ),
  stateKey: integer('state_key').references(() => dimStates.stateId),
  date: date('date').references(() => dimDates.date),
  taskName: text('task_name'),
  tagName: text('tag_name'),
  trafficLightType: text('traffic_light_type'),
  topTenTask: text('top_ten_task'),
  currentStatus: text('current_status'),
  completedByDueDate: text('completed_by_due_date'),
  dueDate: text('due_date'),
  createdTimeStamp: text('created_time_stamp'),
  completedTimeStamp: text('completed_time_stamp'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const factWriteOffMatters = silverSchema.table(
  'fact_write_off_matters',
  {
    actionId: integer('action_id').primaryKey().notNull(),
    reasonForWriteOff: text('reason_for_write_off'),
    amountOfWriteOff: numeric('amount_of_write_off', {
      precision: 10,
      scale: 2,
    }),
    dateWriteOffApproved: date('date_write_off_approved'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
)

export const factReferrals = silverSchema.table(
  'fact_referrals',
  {
    id: integer('id').primaryKey().notNull(),
    productKey: text('product_key').references(() => dimProducts.productId),
    stateKey: integer('state_key').references(() => dimStates.stateId),
    actionKey: integer('action_key').references(() => dimMatters.actionId),
    propertyKey: integer('property_key'),
    associateKeySales: text('associate_key_sales').references(
      () => dimEmployees.associateId,
    ),
    associateKeyReferer: text('associate_key_referer').references(
      () => dimEmployees.associateId,
    ),
    brandKey: integer('brand_key').references(() => dimBrands.brandId),
    jobNumber: integer('job_number'),
    utmSource: text('utm_source'),
    dealUrl: text('deal_url'),
    referer: text('referer'),
    referralRef: text('referral_ref'),
    crmDealStatus: text('crm_deal_status'),
    transactionStatus: text('transaction_status'),
    lostReason: text('lost_reason'),
    refererCompany: text('referer_company'),
    refererSuburb: text('referer_suburb'),
    refererName: text('referer_name'),
    cancellationReason: text('cancellation_reason'),
    dateLeadCreated: date('date_lead_created'),
    dateOfSale: date('date_of_sale'),
    dateServiceDelivered: date('date_service_delivered'),
    dateMostRecentCreditApplied: date('date_most_recent_credit_applied'),
    dateCancelled: date('date_cancelled'),
    dateMatterDoneAndPaid: date('date_matter_done_and_paid'),
    dateInspectionDoneAndPaid: date('date_inspection_done_and_paid'),
    dateCommissionable: date('date_commissionable'),
    lostTime: timestamp('lost_time', { mode: 'string' }),
    amountInvoicedGstInclusive: numeric('amount_invoiced_gst_inclusive', {
      precision: 10,
      scale: 2,
    }),
    amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }),
    amountCredited: numeric('amount_credited', { precision: 10, scale: 2 }),
    amountOfFixedFee: numeric('amount_of_fixed_fee', {
      precision: 10,
      scale: 2,
    }),
    isCancelled: boolean('is_cancelled'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factReferralsBrandKeyPropertyKeyFkey: foreignKey({
        columns: [table.brandKey, table.propertyKey],
        foreignColumns: [dimProperties.brandId, dimProperties.propertyId],
        name: 'fact_referrals_brand_key_property_key_fkey',
      }),
    }
  },
)

export const factRevenuePredictionsCca = silverSchema.table(
  'fact_revenue_predictions_cca',
  {
    actionId: integer('action_id')
      .primaryKey()
      .notNull()
      .references(() => dimMatters.actionId),
    fixedFee: numeric('fixed_fee', { precision: 10, scale: 2 }).notNull(),
    discountOffered: numeric('discount_offered', { precision: 10, scale: 2 }),
    hasCancelled: boolean('has_cancelled'),
    predictedRevenue: numeric('predicted_revenue', {
      precision: 10,
      scale: 2,
    }).notNull(),
    dateOfPredictedRevenue: date('date_of_predicted_revenue').references(
      () => dimDates.date,
    ),
    amountInvoicedNet: numeric('amount_invoiced_net', {
      precision: 10,
      scale: 2,
    }).notNull(),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
)

export const factNetInvoicingCca = silverSchema.table(
  'fact_net_invoicing_cca',
  {
    salePurchaseId: integer('sale_purchase_id').primaryKey().notNull(),
    salePurchaseDate: date('sale_purchase_date')
      .notNull()
      .references(() => dimDates.date),
    salePurchaseStatus: text('sale_purchase_status'),
    actionKey: integer('action_key')
      .notNull()
      .references(() => dimMatters.actionId),
    amountLine: numeric('amount_line', { precision: 10, scale: 2 }),
    amountBilled: numeric('amount_billed', { precision: 10, scale: 2 }),
    amountCredited: numeric('amount_credited', { precision: 10, scale: 2 }),
    amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }),
    amountInvoicedNet: numeric('amount_invoiced_net', {
      precision: 10,
      scale: 2,
    }),
    amountAssumedGst: numeric('amount_assumed_gst', {
      precision: 10,
      scale: 2,
    }),
    amountOutstanding: numeric('amount_outstanding', {
      precision: 10,
      scale: 2,
    }),
    hasDraft: boolean('has_draft'),
    hasReview: boolean('has_review'),
    hasSettlement: boolean('has_settlement'),
    hasCancellation: boolean('has_cancellation'),
    hasTermination: boolean('has_termination'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
)

export const factTaskOwnership = silverSchema.table(
  'fact_task_ownership',
  {
    taskId: integer('task_id').notNull(),
    timeChangedId: timestamp('time_changed_id', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    oldParticipant: integer('old_participant'),
    newParticipant: integer('new_participant'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factTaskOwnershipPkey: primaryKey({
        columns: [table.taskId, table.timeChangedId],
        name: 'fact_task_ownership_pkey',
      }),
    }
  },
)

export const factQaDetail = silverSchema.table(
  'fact_qa_detail',
  {
    qaHeaderId: text('qa_header_id')
      .notNull()
      .references(() => factQaHeader.id),
    questionId: text('question_id').notNull(),
    answer: text('answer').notNull(),
    category: text('category'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factQaDetailPkey: primaryKey({
        columns: [table.qaHeaderId, table.questionId],
        name: 'fact_qa_detail_pkey',
      }),
    }
  },
)

export const factBillings = silverSchema.table(
  'fact_billings',
  {
    monthEnded: date('month_ended')
      .notNull()
      .references(() => dimDates.date),
    associateKey: text('associate_key')
      .notNull()
      .references(() => dimEmployees.associateId),
    amountBilled: numeric('amount_billed', {
      precision: 10,
      scale: 2,
    }).notNull(),
    amountBilledCredit: numeric('amount_billed_credit', {
      precision: 10,
      scale: 2,
    }).notNull(),
    netBillings: numeric('net_billings', { precision: 10, scale: 2 }).notNull(),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factBillingsPkey: primaryKey({
        columns: [table.monthEnded, table.associateKey],
        name: 'fact_billings_pkey',
      }),
    }
  },
)

export const dimProperties = silverSchema.table(
  'dim_properties',
  {
    brandId: integer('brand_id').notNull(),
    propertyId: integer('property_id').notNull(),
    propertyType: text('property_type'),
    address: text('address'),
    state: text('state'),
    postcode: integer('postcode'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      dimPropertiesPkey: primaryKey({
        columns: [table.brandId, table.propertyId],
        name: 'dim_properties_pkey',
      }),
    }
  },
)

export const factBudget = silverSchema.table(
  'fact_budget',
  {
    brandId: integer('brand_id')
      .notNull()
      .references(() => dimBrands.brandId),
    dateId: date('date_id')
      .notNull()
      .references(() => dimDates.date),
    revenue: numeric('revenue', { precision: 10, scale: 2 }).notNull(),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    revenueExtrapolation: numeric('revenue_extrapolation', {
      precision: 10,
      scale: 2,
    }),
    leads: integer('leads'),
    sales: integer('sales'),
  },
  (table) => {
    return {
      factBudgetPkey: primaryKey({
        columns: [table.brandId, table.dateId],
        name: 'fact_budget_pkey',
      }),
    }
  },
)

export const factSms = silverSchema.table(
  'fact_sms',
  {
    timeSentId: timestamp('time_sent_id', { mode: 'string' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    toId: bigint('to_id', { mode: 'number' }).notNull(),
    para: text('para'),
    type: text('type'),
    template: text('template'),
    message: text('message'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factSmsPkey: primaryKey({
        columns: [table.timeSentId, table.toId],
        name: 'fact_sms_pkey',
      }),
    }
  },
)

export const factTypeformInsights = silverSchema.table(
  'fact_typeform_insights',
  {
    extracted: timestamp('extracted', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    formId: text('form_id').notNull(),
    fieldRefId: text('field_ref_id').notNull(),
    fieldViews: integer('field_views'),
    fieldDropoffs: integer('field_dropoffs'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    fieldLabel: text('field_label'),
  },
  (table) => {
    return {
      typeformInsightsPkey: primaryKey({
        columns: [table.extracted, table.formId, table.fieldRefId],
        name: 'typeform_insights_pkey',
      }),
    }
  },
)

export const factSettlementDateChanges = silverSchema.table(
  'fact_settlement_date_changes',
  {
    actionId: integer('action_id')
      .notNull()
      .references(() => dimMatters.actionId),
    changeId: integer('change_id').notNull(),
    date: date('date')
      .notNull()
      .references(() => dimDates.date),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    enteredTimeStamp: timestamp('entered_time_stamp', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    changeFrom: date('change_from'),
    changeTo: date('change_to'),
    created: timestamp('created', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      factSettlementDateChangesPkey: primaryKey({
        columns: [table.actionId, table.changeId],
        name: 'fact_settlement_date_changes_pkey',
      }),
    }
  },
)

export const factActiveMatters = silverSchema.table(
  'fact_active_matters',
  {
    actionId: integer('action_id')
      .notNull()
      .references(() => dimMatters.actionId),
    participantId: integer('participant_id').notNull(),
    instanceId: integer('instance_id').notNull(),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    dateStart: date('date_start'),
    dateEnd: date('date_end'),
    endCondition: text('end_condition'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      actionIdIdx: index('fact_active_matters_action_id_idx').on(
        table.actionId,
      ),
      factActiveMattersPkey: primaryKey({
        columns: [table.actionId, table.participantId, table.instanceId],
        name: 'fact_active_matters_pkey',
      }),
    }
  },
)

export const dimProducts = silverSchema.table(
  'dim_products',
  {
    brandId: integer('brand_id')
      .notNull()
      .references(() => dimBrands.brandId),
    productId: text('product_id').notNull(),
    product: text('product'),
    productSubcategory: text('product_subcategory'),
    productCategory: text('product_category'),
    productType: text('product_type'),
    productGroup: text('product_group'),
    active: boolean('active'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      productIdIdx: index('product_id_idx').on(table.productId),
      dimProductsPkey: primaryKey({
        columns: [table.brandId, table.productId],
        name: 'dim_products_pkey',
      }),
      productIdUnq: unique('product_id_unq').on(table.productId),
    }
  },
)

export const factDraftingCertificationTime = silverSchema.table(
  'fact_drafting_certification_time',
  {
    taskId: integer('task_id').notNull(),
    instanceId: smallint('instance_id').notNull(),
    actionKey: integer('action_key').references(() => dimMatters.actionId),
    assignerKey: integer('assigner_key'),
    assigneeKey: integer('assignee_key'),
    dateAssigned: date('date_assigned')
      .notNull()
      .references(() => dimDates.date),
    dateCompleted: date('date_completed'),
    businessHoursToCompletion: numeric('business_hours_to_completion', {
      precision: 10,
      scale: 2,
    }),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factDraftingCertificationTimePkey: primaryKey({
        columns: [table.taskId, table.instanceId],
        name: 'fact_drafting_certification_time_pkey',
      }),
    }
  },
)

export const factPdInvalidLeadCalls = silverSchema.table(
  'fact_pd_invalid_lead_calls',
  {
    dealId: integer('deal_id')
      .notNull()
      .references(() => factPdInvalidLeads.dealId),
    callId: integer('call_id').notNull(),
    timeChanged: timestamp('time_changed', {
      withTimezone: true,
      mode: 'string',
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    number: bigint('number', { mode: 'number' }),
    startTime: timestamp('start_time', { withTimezone: true, mode: 'string' }),
    agentTime: interval('agent_time'),
    totalTime: interval('total_time'),
    disposition: text('disposition'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factPdInvalidLeadCallsPkey: primaryKey({
        columns: [table.dealId, table.callId],
        name: 'fact_pd_invalid_lead_calls_pkey',
      }),
    }
  },
)

export const dimTypeform = silverSchema.table(
  'dim_typeform',
  {
    formId: text('form_id').notNull(),
    fieldRefId: text('field_ref_id').notNull(),
    workspaceId: text('workspace_id').notNull(),
    workspaceName: text('workspace_name'),
    formType: text('form_type'),
    formTitle: text('form_title'),
    fieldType: text('field_type'),
    fieldTitle: text('field_title'),
    fieldDescription: text('field_description'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      dimTypeformPkey: primaryKey({
        columns: [table.formId, table.fieldRefId],
        name: 'dim_typeform_pkey',
      }),
    }
  },
)

export const factMattersReassigned = silverSchema.table(
  'fact_matters_reassigned',
  {
    actionId: integer('action_id')
      .notNull()
      .references(() => dimMatters.actionId),
    instanceId: integer('instance_id').notNull(),
    reassignedTime: timestamp('reassigned_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    settlementDate: timestamp('settlement_date', {
      withTimezone: true,
      mode: 'string',
    }),
    earliestArchiveAfterSettlement: timestamp(
      'earliest_archive_after_settlement',
      { withTimezone: true, mode: 'string' },
    ),
    participantKeyFrom: integer('participant_key_from'),
    associateKeyFrom: text('associate_key_from'),
    participantKeyTo: integer('participant_key_to'),
    associateKeyTo: text('associate_key_to'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      actionIdIdx: index('action_id_idx').on(table.actionId),
      factMattersReassignedPkey: primaryKey({
        columns: [table.actionId, table.instanceId],
        name: 'fact_matters_reassigned_pkey',
      }),
    }
  },
)

export const factTypeformResponses = silverSchema.table(
  'fact_typeform_responses',
  {
    formId: text('form_id').notNull(),
    fieldRefId: text('field_ref_id').notNull(),
    responseId: text('response_id').notNull(),
    actionKey: integer('action_key'),
    landedAt: timestamp('landed_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    submittedAt: timestamp('submitted_at', {
      withTimezone: true,
      mode: 'string',
    }),
    referer: text('referer'),
    fieldType: text('field_type'),
    response: text('response'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factTypeformResponsesPkey: primaryKey({
        columns: [table.formId, table.fieldRefId, table.responseId],
        name: 'fact_typeform_responses_pkey',
      }),
    }
  },
)

export const factReviews = silverSchema.table(
  'fact_reviews',
  {
    id: integer('id').notNull(),
    employeeTypeId: text('employee_type_id').notNull(),
    stateKey: integer('state_key').references(() => dimStates.stateId),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    ourRef: text('our_ref'),
    date: date('date').references(() => dimDates.date),
    star: integer('star'),
    sentiment: integer('sentiment'),
    reviewSite: text('review_site'),
    title: text('title'),
    description: text('description'),
    source: text('source'),
    country: text('country'),
    email: text('email'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factReviewsPkey: primaryKey({
        columns: [table.id, table.employeeTypeId],
        name: 'fact_reviews_pkey',
      }),
    }
  },
)

export const factTaskChanges = silverSchema.table(
  'fact_task_changes',
  {
    timeExtractedId: timestamp('time_extracted_id', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    taskId: integer('task_id').notNull(),
    changeTypeId: text('change_type_id').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    actionKey: integer('action_key'),
    task: text('task'),
    date: date('date'),
    timeTaskCompleted: timestamp('time_task_completed', {
      withTimezone: true,
      mode: 'string',
    }),
    isOverdueChange: boolean('is_overdue_change'),
    isNoChange: boolean('is_no_change'),
    isDeleted: boolean('is_deleted'),
    isKeyDateChange: boolean('is_key_date_change'),
    isMovedEarlier: boolean('is_moved_earlier'),
    isPrevKeyDateMovedToPast: boolean('is_prev_key_date_moved_to_past'),
    isWeekend: boolean('is_weekend'),
    isBadDataDay: boolean('is_bad_data_day'),
    created: timestamp('created', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      factTaskChangesPkey: primaryKey({
        columns: [table.timeExtractedId, table.taskId, table.changeTypeId],
        name: 'fact_task_changes_pkey',
      }),
    }
  },
)

export const factPhonesGoto = silverSchema.table(
  'fact_phones_goto',
  {
    queue: text('queue').notNull(),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    date: date('date')
      .notNull()
      .references(() => dimDates.date),
    direction: text('direction').notNull(),
    otherPartyName: text('other_party_name'),
    otherPartyNumber: text('other_party_number').notNull(),
    timeStarted: text('time_started').notNull(),
    hourOfDay: integer('hour_of_day'),
    secondsInQueue: integer('seconds_in_queue'),
    secondsTalking: integer('seconds_talking'),
    secondsForCall: integer('seconds_for_call'),
    outcome: text('outcome'),
    disposition: text('disposition'),
    agentName: text('agent_name'),
    tribeCallFrom: text('tribe_call_from'),
    proportionOfDayOnLeave: numeric('proportion_of_day_on_leave'),
    isCall: boolean('is_call'),
    isTribeCall: boolean('is_tribe_call'),
    hasFutureContact: boolean('has_future_contact'),
    isInWorkHours: boolean('is_in_work_hours'),
    isAlreadyOnPhone: boolean('is_already_on_phone'),
    isAnswerable: boolean('is_answerable'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      factPhonesGotoPkey: primaryKey({
        columns: [table.queue, table.otherPartyNumber, table.timeStarted],
        name: 'fact_phones_goto_pkey',
      }),
    }
  },
)

export const factComplaints = silverSchema.table(
  'fact_complaints',
  {
    id: integer('id').notNull(),
    sourceId: integer('source_id').notNull(),
    associateKey: text('associate_key').references(
      () => dimEmployees.associateId,
    ),
    stateKey: integer('state_key').references(() => dimStates.stateId),
    ourRef: text('our_ref').notNull(),
    dateOfComplaint: date('date_of_complaint')
      .notNull()
      .references(() => dimDates.date),
    dateOfAcknowledgement: date('date_of_acknowledgement'),
    dateOfResolution: date('date_of_resolution'),
    dateOfResponse: date('date_of_response'),
    title: text('title'),
    whoFor: text('who_for'),
    complainer: text('complainer'),
    isKpiExcluded: boolean('is_kpi_excluded').notNull(),
    amountOfFinancialImpact: numeric('amount_of_financial_impact', {
      precision: 10,
      scale: 2,
    }),
    findings: text('findings'),
    resolution: text('resolution'),
    description: text('description'),
    owner: text('owner'),
    source: text('source'),
    rating: text('rating'),
    service: text('service'),
    clientType: text('client_type'),
    complaintType: text('complaint_type'),
    status: text('status'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => {
    return {
      idIdx: index('id_idx').on(table.id),
      factComplaintsPkey: primaryKey({
        columns: [table.id, table.sourceId],
        name: 'fact_complaints_pkey',
      }),
    }
  },
)
