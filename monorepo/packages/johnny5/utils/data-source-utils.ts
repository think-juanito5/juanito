import { Err, Ok, type Result } from 'ts-results-es'
import type { DataSource } from '../interfaces'
import type { DataItem, DataItemType } from '../typebox'

export const validateDataSource = async (
  redata: {
    name: string
    required_for_matter_creation: boolean
    data_type: DataItemType
  }[],
  dataSource: DataSource,
): Promise<Result<boolean, DataItem[]>> => {
  const invalidItems: DataItem[] = []
  for (const item of redata) {
    if (!item.required_for_matter_creation) continue
    const dataItem = await dataSource.get(item.name)
    if (!dataItem) {
      invalidItems.push({
        name: item.name,
        value: undefined,
        type: item.data_type,
        required: true,
      })
      continue
    }
    if (!dataItem.value) {
      invalidItems.push(dataItem)
      continue
    }
    switch (dataItem.type) {
      case 'Text':
        if (typeof dataItem.value !== 'string' || !dataItem.value) {
          invalidItems.push(dataItem)
        }

        break
      case 'Number':
        if (!isValidNumber(dataItem.value)) {
          invalidItems.push(dataItem)
        }

        break
      case 'Date': {
        const date = Date.parse(dataItem.value)
        if (isNaN(date)) {
          invalidItems.push(dataItem)
        }

        break
      }
      default:
        throw new Error(
          `field: ${dataItem.name} invalid data type: ${dataItem.type}`,
        )
    }
  }

  return invalidItems.length > 0 ? Err(invalidItems) : Ok(true)
}

export const isValidNumber = (value?: string): boolean => {
  if (!value) return false
  const number = extractNumberOnly(value)
  if (!number) return false
  return Number.isFinite(number)
}

/**
 * Parses a currency amount or percentage value from a string.
 *
 * If the value contains a percentage sign, it calculates the percentage of the purchase price item's value.
 * Otherwise, it returns the parsed number directly.
 *
 * @param purchase_price_item - The data item containing the purchase price value.
 * @param value - The string value to parse, which can be a currency amount or a percentage.
 * @returns The parsed number, or undefined if the value is invalid or missing.
 */
export const parseCurrencyAmountOrPercentage = (
  purchase_price_item: DataItem,
  value?: string,
): number | undefined => {
  if (!value) return undefined

  const numberOnly = extractNumberOnly(value)
  if (!numberOnly) return undefined

  // Does the value contain a percentage sign?
  if (value.includes('%')) {
    const purchase_price_value = purchase_price_item.value
    if (!purchase_price_value) return undefined
    const parsedPurchasePrice = parseFloat(purchase_price_value)
    if (!parsedPurchasePrice || isNaN(parsedPurchasePrice)) return undefined
    return (parsedPurchasePrice * numberOnly) / 100
  }

  return numberOnly
}

/**
 * Extracts a number from a string, removing any non-numeric characters except for the decimal point.
 *
 * @param value - The string to extract the number from.
 * @returns The extracted number, or undefined if the string is null, undefined, or cannot be parsed into a number.
 */
export const extractNumberOnly = (value?: string): number | undefined => {
  if (!value) return undefined
  // Remove any non-numeric characters except for the decimal point
  const cleanedValue = value.replace(/[^0-9.-]+/g, '')
  const number = parseFloat(cleanedValue)
  return isNaN(number) ? undefined : number
}
