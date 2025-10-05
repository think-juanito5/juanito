import {
  primaryKey,
  text,
  timestamp,
  integer,
  jsonb,
  pgSchema,
} from 'drizzle-orm/pg-core'

export const ccaSchema = pgSchema('cca')

export const webformActions = ccaSchema.table(
  'webform_actions',
  {
    formId: text('form_id').notNull(),
    fieldRefId: text('field_ref_id').notNull(),
    responseId: text('response_id').notNull(),
    actionRequiredId: text('action_required_id').notNull(),
    details: text('details'),
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
      webformActionsPkey: primaryKey({
        columns: [
          table.formId,
          table.fieldRefId,
          table.responseId,
          table.actionRequiredId,
        ],
        name: 'webform_actions_pkey',
      }),
    }
  },
)

export const actionsTaken = ccaSchema.table(
  'actions_taken',
  {
    actionId: integer('action_id').notNull(),
    formId: text('form_id').notNull(),
    formResponseId: text('form_response_id').notNull(),
    fieldRefId: text('field_ref_id').notNull(),
    responseId: text('response_id').notNull(),
    actionTakenId: text('action_taken_id').notNull(),
    details: jsonb('details'),
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
      actionsTakenPkey: primaryKey({
        columns: [
          table.actionId,
          table.formId,
          table.formResponseId,
          table.fieldRefId,
          table.responseId,
          table.actionTakenId,
        ],
        name: 'actions_taken_pkey',
      }),
    }
  },
)
