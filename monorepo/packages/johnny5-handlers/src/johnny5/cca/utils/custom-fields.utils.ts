import { type DataItem } from '@dbc-tech/johnny5/typebox'
import type {
  DealPersonCustomFieldsResponse,
  DealPersonMainOnly,
  DealUserCustomResponse,
  V2DealCustomFields,
  V2DealMainOnly,
} from '@dbc-tech/pipedrive'

export type CommonField = 'Text' | 'Number' | 'Date'

export const getMainFields = (
  mainDataFields: V2DealMainOnly | DealPersonMainOnly | DealUserCustomResponse,
  keyPrefix: string = '',
): DataItem[] =>
  Object.entries(mainDataFields)
    .filter(([key, _]) => key !== 'custom_fields')
    .flatMap(([key, value]) => {
      let type: CommonField = 'Text'
      const prefix = keyPrefix.length ? `${keyPrefix}_` : ''

      if (typeof value === 'number') {
        type = 'Number'
      } else if (Array.isArray(value)) {
        const pushItem = (
          name: string,
          type: CommonField,
          val: string,
        ): DataItem => {
          return {
            name,
            type,
            required: false,
            value: val,
          }
        }
        let i = 1
        const xitem: DataItem[] = value.map((v) => {
          return typeof v === 'object'
            ? pushItem(`${prefix}${key}_${i++}`, type, v.value)
            : pushItem(`${prefix}${key}`, type, v)
        })
        return xitem
      } else if (value instanceof Date || !isNaN(Date.parse(value as string))) {
        type = 'Date'
      }
      return {
        name: `${prefix}${key}`,
        type,
        required: false,
        value: value?.toString(),
      }
    })

export const convertCustomFields = (
  customFields: V2DealCustomFields | DealPersonCustomFieldsResponse,
): DataItem[] =>
  Object.entries(customFields).map(([key, value]) => {
    const type: CommonField =
      typeof value === 'number' ||
      (typeof value === 'object' && value !== null && 'value' in value)
        ? 'Number'
        : 'Text'

    const extractedValue =
      typeof value === 'object' && value !== null && 'value' in value
        ? (value.value?.toString() ?? undefined)
        : (value?.toString() ?? undefined)

    return {
      name: key,
      type,
      required: false,
      value: extractedValue,
    }
  })
