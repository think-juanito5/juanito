import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Nullable, commonFields, legacyFields } from '../common'

const crcf3_matter_allocations_Schema = Type.Object({
  _dbc_conveyancer_value: Nullable(Type.String()),
  dbc_action_id: Type.Number(),
  crcf3_allocationdate: Nullable(Type.String()),
  _dbc_assigned_lawyer_value: Nullable(Type.String()),
  _dbc_allocated_by_value: Nullable(Type.String()),
  dbc_date_of_settlement: Nullable(Type.String()),
  dbc_allocation_status: Type.Number(),
  crcf3_matter_allocationid: Type.String(),
  crcf3_notes: Nullable(Type.String()),
  crcf3_allocationcheck: Nullable(Type.String()),
  crcf3_matterallocationapprovalstatus: Nullable(Type.String()),
  crcf3_is_restricted_matter: Type.Boolean(),
  dbc_askassignee: Type.Boolean(),
  dbc_canvas_app: Nullable(Type.String()),
  dbc_day_before_settlement: Nullable(Type.String()),
  crcf3_name: Type.String(),
  _dbc_conveyancing_manager_value: Nullable(Type.String()),
  _crcf3_matter_assignee_value: Nullable(Type.String()),
  crcf3_restricted_matter_allocation_consideratio: Nullable(Type.String()),
  dbc_is_partial_de_done: Type.Boolean(),
})

export const matterAllocationsSchema = Type.Object({
  '@odata.context': Type.String(),
  value: Type.Array(
    Type.Intersect([
      legacyFields,
      commonFields,
      crcf3_matter_allocations_Schema,
    ]),
  ),
  '@odata.nextLink': Type.Optional(Type.String()),
})
export type MatterAllocations = Static<typeof matterAllocationsSchema>
export const CMatterAllocations = TypeCompiler.Compile(matterAllocationsSchema)
