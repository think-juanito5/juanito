import { describe, expect, it } from 'bun:test'
import { getMatterUpdatedAction } from '../../johnny5/btr/utils/matter-activity-update-utils'

describe('getMatterUpdatedAction', () => {
  it('should return updateField and replace for fields with action replace', () => {
    const field = 'bpdate'
    const incomingValue = '2023-01-01'
    const storedValue = '2022-01-01'

    const result = getMatterUpdatedAction(field, incomingValue, storedValue)

    expect(result).toEqual({ status: 'updateField', action: 'replace' })
  })

  it('should return updateField and doNothing when storedValue is empty and incomingValue is not empty', () => {
    const field = 'ctsnam'
    const incomingValue = 'New Value'
    const storedValue = ''

    const result = getMatterUpdatedAction(field, incomingValue, storedValue)

    expect(result).toEqual({ status: 'updateField', action: 'doNothing' })
  })

  it('should return skipField and doNothing when storedValue is not empty', () => {
    const field = 'ctsnam'
    const incomingValue = 'New Value'
    const storedValue = 'Existing Value'

    const result = getMatterUpdatedAction(field, incomingValue, storedValue)

    expect(result).toEqual({ status: 'skipField', action: 'doNothing' })
  })

  it('should return default and notFound for fields not in the map', () => {
    const field = 'unknownField'
    const incomingValue = 'Value'
    const storedValue = 'Value'

    const result = getMatterUpdatedAction(field, incomingValue, storedValue)

    expect(result).toEqual({ status: 'default', action: 'notFound' })
  })

  it('should return updateField and replace for fields with action replace regardless of storedValue', () => {
    const field = 'bpdate'
    const incomingValue = '2023-01-01'
    const storedValue = ''

    const result = getMatterUpdatedAction(field, incomingValue, storedValue)

    expect(result).toEqual({ status: 'updateField', action: 'replace' })
  })
})
