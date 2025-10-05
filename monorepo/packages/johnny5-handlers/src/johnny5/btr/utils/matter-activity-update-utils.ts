export type Action = 'replace' | 'doNothing' | 'replaceIf' | 'notFound'
export type DataState = 'updateField' | 'skipField' | 'default'

/**
 * Map of Actionstep fields to their respective update strategy.
 * "replace" means the value will be overwritten, "doNothing" means it will be skipped unless special conditions are met.
 */
export const MatterUpdatedActionstepMap = new Map<string, Action>([
  ['bpdate', 'replace'],
  ['findate', 'replace'],
  ['baldep', 'replace'],
  ['ctsnam', 'doNothing'],
  ['purprice', 'replace'],
  ['inidepdate', 'replace'],
  ['baldepdate', 'replace'],
  ['incchat', 'doNothing'],
  ['safetyswitch', 'replaceIf'],
  ['smokealarm', 'replaceIf'],
  ['plantype', 'doNothing'],
  ['tenancy_within_12months', 'doNothing'],
  ['last_rent_increase_date', 'doNothing'],
  ['pool_on_property', 'doNothing'],
  ['pool_cert', 'doNothing'],
  ['neighbour_dispute', 'replace'],
  ['planno', 'doNothing'],
  ['lotno', 'doNothing'],
  ['smtdateonly', 'replace'],
  ['initdep', 'replace'],
  ['kdate', 'replace'],
  ['ctsnum', 'doNothing'],
  ['titleref', 'doNothing'],
  ['no_encum', 'doNothing'],
  ['encum_details', 'doNothing'],
  ['deposit_holder', 'doNothing'],
  ['spc1det', 'doNothing'],
  ['excfix', 'doNothing'],
  ['lotno2', 'doNothing'],
  ['plantype2', 'doNothing'],
  ['planno2', 'doNothing'],
  ['titleref2', 'doNothing'],
  ['lotno3', 'doNothing'],
  ['plantype3', 'doNothing'],
  ['planno3', 'doNothing'],
  ['titleref3', 'doNothing'],
  ['lotno4', 'doNothing'],
  ['plantype4', 'doNothing'],
  ['planno4', 'doNothing'],
  ['titleref4', 'doNothing'],
  ['uncondate', 'replace'],
  ['adjustdate', 'doNothing'],
  ['cooloffdate', 'replace'],
  ['safe_switch_inform', 'replaceIf'],
  ['tenants_apply', 'doNothing'],
  ['propnat', 'doNothing'],
  ['excfix_applicable', 'replace'],
  ['incchat_applicable', 'replace'],
  ['pool_safety', 'replace'],
  ['smokealarmsinstalled', 'replace'],
  ['smoke_alarm_inform', 'replaceIf'],
  ['depamount', 'replace'],
])

/**
 * Determines the update action and status for a matter field based on the provided values and property type.
 *
 * @param field - The name of the field being evaluated.
 * @param incomingValue - The new value being considered for the field.
 * @param storedValue - The current value stored for the field.
 * @param isPropertyVacantLand - Optional. Indicates if the property is vacant land. Defaults to `false`.
 * @returns An object containing the `status` (of type `DataState`) and the `action` (of type `Action`) to be taken.
 *
 * The function uses a mapping (`MatterUpdatedActionstepMap`) to determine the raw action for the field.
 * - If the raw action is `'replaceIf'`, it checks if the property is vacant land to decide between `'doNothing'` and `'replace'`.
 * - If the action is `'replace'`, it returns an update status.
 * - If the action is `'doNothing'`, it decides between updating or skipping the field based on the presence of values.
 * - For all other cases, it returns a default status and action.
 */
export const getMatterUpdatedAction = (
  field: string,
  incomingValue: string,
  storedValue: string,
  isPropertyVacantLand: boolean = false,
): { status: DataState; action: Action } => {
  const rawAction = MatterUpdatedActionstepMap.get(field)
  const action: Action =
    rawAction === 'replaceIf'
      ? isPropertyVacantLand
        ? 'doNothing'
        : 'replace'
      : (rawAction ?? 'notFound')

  if (action === 'replace') {
    return { status: 'updateField', action }
  }

  if (action === 'doNothing') {
    if (!storedValue && incomingValue) {
      return { status: 'updateField', action }
    }
    if (storedValue) {
      return { status: 'skipField', action }
    }
  }

  return { status: 'default', action }
}
