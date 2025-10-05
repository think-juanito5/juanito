import {
  primaryKey,
  date,
  text,
  numeric,
  boolean,
  timestamp,
  integer,
  pgSchema,
} from 'drizzle-orm/pg-core'

export const goldSchema = pgSchema('gold')

export const kpiDraftingParalegal = goldSchema.table(
  'kpi_drafting_paralegal',
  {
    monthEnded: date('month_ended').notNull(),
    associateKey: text('associate_key').notNull(),
    position: text('position'),
    team: text('team'),
    manager: text('manager'),
    dateFrom: date('date_from'),
    dateTo: date('date_to'),
    activePercentOfQuarter: numeric('active_percent_of_quarter'),
    eligible: boolean('eligible').notNull(),
    turnaroundMetric: boolean('turnaround_metric'),
    resubRate: numeric('resub_rate'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      kpiDraftingParalegalPkey: primaryKey({
        columns: [table.monthEnded, table.associateKey],
        name: 'kpi_drafting_paralegal_pkey',
      }),
    }
  },
)

export const kpiCm = goldSchema.table(
  'kpi_cm',
  {
    quarterEnded: date('quarter_ended').notNull(),
    monthEnded: date('month_ended').notNull(),
    associateKey: text('associate_key').notNull(),
    position: text('position'),
    team: text('team'),
    manager: text('manager'),
    dateFrom: date('date_from'),
    dateTo: date('date_to'),
    activePercentOfQuarter: numeric('active_percent_of_quarter'),
    eligible: boolean('eligible').notNull(),
    qaMetric: boolean('qa_metric').notNull(),
    reviewsMetric: boolean('reviews_metric').notNull(),
    tasksMetric: boolean('tasks_metric').notNull(),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      kpiCmPkey: primaryKey({
        columns: [table.monthEnded, table.associateKey],
        name: 'kpi_cm_pkey',
      }),
    }
  },
)

export const kpiParalegal = goldSchema.table(
  'kpi_paralegal',
  {
    quarterEnded: date('quarter_ended').notNull(),
    associateKey: text('associate_key').notNull(),
    position: text('position'),
    team: text('team'),
    manager: text('manager'),
    dateFrom: date('date_from'),
    dateTo: date('date_to'),
    activePercentOfQuarter: numeric('active_percent_of_quarter'),
    eligible: boolean('eligible').notNull(),
    qaMetric: numeric('qa_metric'),
    phoneMetric: numeric('phone_metric'),
    reviewsCount: integer('reviews_count'),
    complaints: integer('complaints'),
    activeMatters: integer('active_matters'),
    taskMetric: numeric('task_metric'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    unplannedLeave: integer('unplanned_leave'),
  },
  (table) => {
    return {
      kpiParalegalPkey: primaryKey({
        columns: [table.quarterEnded, table.associateKey],
        name: 'kpi_paralegal_pkey',
      }),
    }
  },
)

export const kpiCtl = goldSchema.table(
  'kpi_ctl',
  {
    quarterEnded: date('quarter_ended').notNull(),
    monthEnded: date('month_ended').notNull(),
    associateKey: text('associate_key').notNull(),
    position: text('position'),
    team: text('team'),
    manager: text('manager'),
    dateFrom: date('date_from'),
    dateTo: date('date_to'),
    activePercentOfQuarter: numeric('active_percent_of_quarter'),
    eligible: boolean('eligible').notNull(),
    monthHurdle: boolean('month_hurdle'),
    filesReallocated: integer('files_reallocated'),
    baseCheck: numeric('base_check'),
    draftSettlementStatement: numeric('draft_settlement_statement'),
    firstCall: numeric('first_call'),
    firstLetter: numeric('first_letter'),
    orderSearches: numeric('order_searches'),
    complaints: integer('complaints'),
    activeMatters: integer('active_matters'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      kpiCtlPkey: primaryKey({
        columns: [table.monthEnded, table.associateKey],
        name: 'kpi_ctl_pkey',
      }),
    }
  },
)
