import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Nullable, commonFields, commonFieldsFormattedSchema } from '../common'

export const bespokeTasksIdSchema = Type.Object({
  dbc_bespoke_tasksid: Type.String(),
})

export const bespokeTasksUniqueSchema = Type.Object({
  dbc_action_type: Type.Optional(Nullable(Type.String())),
  dbc_actionstep_matter_type: Type.Optional(Nullable(Type.Number())),
  dbc_data_collection: Type.Optional(Nullable(Type.Number())),
  dbc_datafield: Type.Optional(Nullable(Type.String())),
  dbc_name: Type.Optional(Nullable(Type.String())),
  dbc_stringvalue: Type.Optional(Nullable(Type.String())),
  dbc_task_assignee: Type.Optional(Nullable(Type.Number())),
  dbc_task_business_day_offset: Type.Optional(Nullable(Type.Boolean())),
  dbc_task_due_date_anchor: Type.Optional(Nullable(Type.String())),
  dbc_task_due_date_offset: Type.Optional(Nullable(Type.Number())),
  dbc_task_name: Type.Optional(Nullable(Type.String())),
  dbc_taskdescription: Type.Optional(Nullable(Type.String())),
  dbc_trigger_type: Type.Optional(Nullable(Type.Number())),
  'dbc_trigger_type@OData.Community.Display.V1.FormattedValue': Type.Optional(
    Nullable(Type.String()),
  ),
  dbc_typeform_answer: Type.Optional(Nullable(Type.String())),
  dbc_typeform_form_id: Type.Optional(Nullable(Type.String())),
  dbc_typeform_question_id: Type.Optional(Nullable(Type.String())),
  dbc_folder: Type.Optional(Nullable(Type.String())),
  dbc_parent_folder: Type.Optional(Nullable(Type.String())),
  dbc_file_trigger_question: Type.Optional(Nullable(Type.String())),
  dbc_file_trigger_response: Type.Optional(Nullable(Type.String())),
})

export const bespokeTasksInnerSchema = Type.Array(
  Type.Intersect([
    commonFields,
    bespokeTasksIdSchema,
    bespokeTasksUniqueSchema,
  ]),
)
export type BespokeTasksInner = Static<typeof bespokeTasksInnerSchema>
export const CBespokeTasksInner = TypeCompiler.Compile(bespokeTasksInnerSchema)

export const bespokeTasksSchema = Type.Object({
  '@odata.context': Type.String(),
  value: bespokeTasksInnerSchema,
})
export type BespokeTasks = Static<typeof bespokeTasksSchema>
export const CBespokeTasks = TypeCompiler.Compile(bespokeTasksSchema)

export const bespokeTasksFormattedSchema = Type.Object({
  dbc_action_type: Type.Optional(Nullable(Type.String())),
  dbc_actionstep_matter_type: Type.Optional(Nullable(Type.Number())),
  dbc_data_collection: Type.Optional(Nullable(Type.Number())),
  dbc_datafield: Type.Optional(Nullable(Type.String())),
  dbc_name: Type.Optional(Nullable(Type.String())),
  dbc_stringvalue: Type.Optional(Nullable(Type.String())),
  dbc_task_assignee: Type.Optional(Nullable(Type.Number())),
  dbc_task_business_day_offset: Type.Optional(Nullable(Type.Boolean())),
  dbc_task_due_date_anchor: Type.Optional(Nullable(Type.String())),
  dbc_task_due_date_offset: Type.Optional(Nullable(Type.Number())),
  dbc_task_name: Type.Optional(Nullable(Type.String())),
  dbc_taskdescription: Type.Optional(Nullable(Type.String())),
  dbc_trigger_type: Type.Optional(Nullable(Type.String())),
  dbc_typeform_answer: Type.Optional(Nullable(Type.String())),
  dbc_typeform_form_id: Type.Optional(Nullable(Type.String())),
  dbc_typeform_question_id: Type.Optional(Nullable(Type.String())),
  dbc_folder: Type.Optional(Nullable(Type.String())),
  dbc_parent_folder: Type.Optional(Nullable(Type.String())),
  dbc_file_trigger_question: Type.Optional(Nullable(Type.String())),
  dbc_file_trigger_response: Type.Optional(Nullable(Type.String())),
})

export const bespokeTasksFormattedInnerSchema = Type.Array(
  Type.Intersect([
    commonFieldsFormattedSchema,
    bespokeTasksIdSchema,
    bespokeTasksFormattedSchema,
  ]),
)
export type BespokeTasksFormattedInner = Static<
  typeof bespokeTasksFormattedInnerSchema
>
