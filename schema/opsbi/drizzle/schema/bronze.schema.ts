import {
  text,
  timestamp,
  date,
  smallint,
  primaryKey,
  integer,
  numeric,
  boolean,
  pgSchema,
} from 'drizzle-orm/pg-core'
import { dimBrands, dimDates, dimStates } from './silver.schema'

export const bronzeSchema = pgSchema('bronze')

export const employeesAudit = bronzeSchema.table('employees_audit', {
  associateId: text('associate_id').notNull(),
  field: text('field').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  modified: timestamp('modified', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
})

export const employeesHistory = bronzeSchema.table('employees_history', {
  associateId: text('associate_id').notNull(),
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
  created: timestamp('created', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  modified: timestamp('modified', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  deleted: timestamp('deleted', { withTimezone: true, mode: 'string' }),
})

export const employees = bronzeSchema.table('employees', {
  extracted: timestamp('extracted', { withTimezone: true, mode: 'string' })
    .primaryKey()
    .notNull(),
  data: text('data').notNull(),
  created: timestamp('created', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  modified: timestamp('modified', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})

export const taskDueDates = bronzeSchema.table(
  'task_due_dates',
  {
    timeExtractedId: timestamp('time_extracted_id', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    taskId: integer('task_id').notNull(),
    dueDate: text('due_date'),
    assignedToParticipantId: integer('assigned_to_participant_id'),
  },
  (table) => {
    return {
      taskDueDatesPkey: primaryKey({
        columns: [table.timeExtractedId, table.taskId],
        name: 'task_due_dates_pkey',
      }),
    }
  },
)

export const budget = bronzeSchema.table(
  'budget',
  {
    brandId: integer('brand_id')
      .notNull()
      .references(() => dimBrands.brandId),
    monthEndingId: date('month_ending_id')
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
    leads: integer('leads'),
    sales: integer('sales'),
  },
  (table) => {
    return {
      budgetCcaPkey: primaryKey({
        columns: [table.brandId, table.monthEndingId],
        name: 'budget_cca_pkey',
      }),
    }
  },
)

export const gotoQueueCaller = bronzeSchema.table(
  'goto_queue_caller',
  {
    startTime: timestamp('start_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    timeInQueueS: integer('time_in_queue_s'),
    talkDurationS: integer('talk_duration_s'),
    callDurationS: integer('call_duration_s'),
    queue: text('queue'),
    callerNameNumber: text('caller_name__number').notNull(),
    outcome: text('outcome'),
    agentName: text('agent_name'),
    created: timestamp('created', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    modified: timestamp('modified', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    smsSent: boolean('sms_sent'),
  },
  (table) => {
    return {
      gotoQueueCallerPkey: primaryKey({
        columns: [table.startTime, table.callerNameNumber],
        name: 'goto_queue_caller_pkey',
      }),
    }
  },
)

export const gotoContactSummary = bronzeSchema.table(
  'goto_contact_summary',
  {
    contactId: text('contact_id'),
    queueName: text('queue_name').notNull(),
    contactCreationTime: timestamp('contact_creation_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    contactResolutionTime: timestamp('contact_resolution_time', {
      withTimezone: true,
      mode: 'string',
    }),
    timeInQueueMillis: integer('time_in_queue_millis'),
    timeInQueueHhmmss: text('time_in_queue_hhmmss'),
    talkTimeMillis: integer('talk_time_millis'),
    talkTimeHhmmss: text('talk_time_hhmmss'),
    wrapTimeMillis: integer('wrap_time_millis'),
    wrapTimeHhmmss: text('wrap_time_hhmmss'),
    handleTimeMillis: integer('handle_time_millis'),
    handleTimeHhmmss: text('handle_time_hhmmss'),
    contactResolution: text('contact_resolution'),
    contactType: text('contact_type'),
    contactParticipantType: text('contact_participant_type'),
    contactParticipantName: text('contact_participant_name'),
    contactParticipantValue: text('contact_participant_value').notNull(),
    agentName: text('agent_name'),
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
      gotoContactSummaryPkey: primaryKey({
        columns: [
          table.queueName,
          table.contactCreationTime,
          table.contactParticipantValue,
        ],
        name: 'goto_contact_summary_pkey',
      }),
    }
  },
)
