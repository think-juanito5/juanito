import {
  integer,
  date,
  text,
  boolean,
  timestamp,
  bigint,
  primaryKey,
  numeric,
  pgSchema,
} from 'drizzle-orm/pg-core'
import { dimDates, dimEmployees } from './silver.schema'

export const wfmSchema = pgSchema('wfm')

export const matters = wfmSchema.table('matters', {
  actionId: integer('action_id').primaryKey().notNull(),
  dateCreated: date('date_created'),
  engagedProduct: text('engaged_product'),
  state: text('state'),
  actionStatus: text('action_status'),
  stepName: text('step_name'),
  dateOfSettlement: date('date_of_settlement'),
  dateOfContractReview: date('date_of_contract_review'),
  isOtp: boolean('is_otp'),
  isBuy: boolean('is_buy'),
  isSell: boolean('is_sell'),
  isTransfer: boolean('is_transfer'),
  isTestMatter: boolean('is_test_matter'),
  isRestrictedMatter: boolean('is_restricted_matter'),
  hasCancelled: boolean('has_cancelled'),
  hasTerminated: boolean('has_terminated'),
  matterAssignee: text('matter_assignee'),
  conveyancer: text('conveyancer'),
  assignedLawyer: text('assigned_lawyer'),
  conveyancingManager: text('conveyancing_manager'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  deleted: timestamp('deleted', { withTimezone: true, mode: 'string' }),
  reviewDraftReadyForConveyance: timestamp(
    'review_draft_ready_for_conveyance',
    { withTimezone: true, mode: 'string' },
  ),
})

export const attendance = wfmSchema.table('attendance', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  messageId: bigint('message_id', { mode: 'number' }).primaryKey().notNull(),
  string: text('string'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const changes = wfmSchema.table('changes', {
  actionId: integer('action_id').primaryKey().notNull(),
  dateCreated: date('date_created'),
  engagedProduct: text('engaged_product'),
  state: text('state'),
  actionStatus: text('action_status'),
  stepName: text('step_name'),
  dateOfSettlement: date('date_of_settlement'),
  dateOfContractReview: date('date_of_contract_review'),
  isOtp: boolean('is_otp'),
  isBuy: boolean('is_buy'),
  isSell: boolean('is_sell'),
  isTransfer: boolean('is_transfer'),
  isTestMatter: boolean('is_test_matter'),
  isRestrictedMatter: boolean('is_restricted_matter'),
  hasCancelled: boolean('has_cancelled'),
  hasTerminated: boolean('has_terminated'),
  matterAssignee: text('matter_assignee'),
  conveyancer: text('conveyancer'),
  assignedLawyer: text('assigned_lawyer'),
  conveyancingManager: text('conveyancing_manager'),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  deleted: timestamp('deleted', { withTimezone: true, mode: 'string' }),
  reviewDraftReadyForConveyance: timestamp(
    'review_draft_ready_for_conveyance',
    { withTimezone: true, mode: 'string' },
  ),
})

export const futureLeave = wfmSchema.table(
  'future_leave',
  {
    associateId: text('associate_id')
      .notNull()
      .references(() => dimEmployees.associateId),
    dateId: date('date_id')
      .notNull()
      .references(() => dimDates.date),
    proportionOfDayOnLeave: numeric('proportion_of_day_on_leave'),
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
      futureLeavePkey: primaryKey({
        columns: [table.associateId, table.dateId],
        name: 'future_leave_pkey',
      }),
    }
  },
)
