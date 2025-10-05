import {
  integer,
  text,
  timestamp,
  date,
  index,
  pgSchema,
} from 'drizzle-orm/pg-core'
import { dimMatters } from './silver.schema'

export const notifSchema = pgSchema('notif')

export const basecheckData = notifSchema.table('basecheck_data', {
  actionId: integer('action_id').primaryKey().notNull(),
  actionTypeName: text('action_type_name').notNull(),
  matterowneremail: text('matterowneremail'),
  matterownerfirstname: text('matterownerfirstname'),
  actiontype: text('actiontype').notNull(),
  matterownerid: integer('matterownerid'),
  cmid: integer('cmid'),
  emailAddressToNotify: text('email_address_to_notify').notNull(),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  timeTaskCompleted: timestamp('time_task_completed', {
    withTimezone: true,
    mode: 'string',
  }),
})

export const basecheckTimestamp = notifSchema.table('basecheck_timestamp', {
  actionId: integer('action_id').primaryKey().notNull(),
  emailSentByPowerAutomate: timestamp('email_sent_by_power_automate', {
    withTimezone: true,
    mode: 'string',
  }),
})

export const cancellationTimestamp = notifSchema.table(
  'cancellation_timestamp',
  {
    actionId: integer('action_id').primaryKey().notNull(),
    emailSentByPowerAutomate: timestamp('email_sent_by_power_automate', {
      withTimezone: true,
      mode: 'string',
    }),
  },
)

export const reviewCancellationData = notifSchema.table(
  'review_cancellation_data',
  {
    actionId: integer('action_id').primaryKey().notNull(),
    dealKey: integer('deal_key'),
    dateCreated: date('date_created'),
    dateOfContractReview: date('date_of_contract_review'),
    dateOfCancellation: date('date_of_cancellation'),
    matterType: text('matter_type'),
    conveyancingType: text('conveyancing_type'),
    cancellationReason: text('cancellation_reason'),
    cancellationWork: text('cancellation_work'),
    client: text('client'),
    salesPerson: text('sales_person'),
    assignedTo: text('assigned_to'),
    lastFileNote: text('last_file_note'),
    currentStep: text('current_step'),
    status: text('status'),
    warningMessageText: text('warning_message_text'),
    emailAddressToNotify: text('email_address_to_notify'),
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

export const reviewCancellationTimestamp = notifSchema.table(
  'review_cancellation_timestamp',
  {
    actionId: integer('action_id').primaryKey().notNull(),
    emailSentByPowerAutomate: timestamp('email_sent_by_power_automate', {
      withTimezone: true,
      mode: 'string',
    }),
  },
)

export const reviewData = notifSchema.table('review_data', {
  id: integer('id').primaryKey().notNull(),
  date: date('date'),
  title: text('title'),
  description: text('description'),
  source: text('source'),
  actionId: integer('action_id'),
  dealId: integer('deal_id'),
  salespersonEmail: text('salesperson_email'),
  propertyAddress: text('property_address'),
  settlementDate: text('settlement_date'),
  reaName: text('rea_name'),
  reaCompanyName: text('rea_company_name'),
  reaEmail: text('rea_email'),
  reaPhone: text('rea_phone'),
  brokerName: text('broker_name'),
  brokerCompanyName: text('broker_company_name'),
  brokerEmail: text('broker_email'),
  brokerPhone: text('broker_phone'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const reviewTimestamp = notifSchema.table('review_timestamp', {
  id: integer('id').primaryKey().notNull(),
  emailSentByPowerAutomate: timestamp('email_sent_by_power_automate', {
    withTimezone: true,
    mode: 'string',
  }),
})

export const cancellationData = notifSchema.table(
  'cancellation_data',
  {
    actionId: integer('action_id')
      .primaryKey()
      .notNull()
      .references(() => dimMatters.actionId),
    dealId: integer('deal_id'),
    salespersonEmail: text('salesperson_email'),
    timeCancelled: timestamp('time_cancelled', {
      withTimezone: true,
      mode: 'string',
    }),
    stepPriorToCancellation: text('step_prior_to_cancellation'),
    cancellationReason: text('cancellation_reason'),
    note1: text('note_1'),
    note2: text('note_2'),
    note3: text('note_3'),
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
      dealIdIdx: index('deal_id_idx').on(table.dealId),
    }
  },
)
