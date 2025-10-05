import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import type { AustralianState, DataItem } from '@dbc-tech/johnny5/typebox'
import {
  StreetNameAbbreviationExpander,
  calculateDateOrOffsetDate,
  capitalise,
  capitalizePlus,
  extractNumberOnly,
  formatDate,
  formatPhoneNumberwithSpacing,
  parseCurrencyAmountOrPercentage,
  parseDateOnly,
  parseSelectionMark,
  yearEndShutdown,
} from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'
import { field } from './constants'
export const ignoredValues = ['NA', 'N/A', 'Not Applicable']
export const textIgnoredValues = ['Nil.', 'Nil', '| NIL']
const textIgnoredRegex = /\|\s*NIL/i

export const filterDataItem = async (
  item: DataItem,
  logger: Logger,
): Promise<DataItem> => {
  switch (item.type) {
    case 'Number':
    case 'Date':
      if (item.value && ignoredValues.includes(item.value)) {
        await logger.debug('Ignoring value', {
          name: item.name,
          type: item.type,
          value: item.value,
        })
        return { ...item, value: undefined }
      }
      return item

    case 'Text': {
      const normalizedValue = item.value?.trim().toLowerCase()
      const isIgnored =
        textIgnoredValues.some(
          (ignored) => normalizedValue === ignored.toLowerCase(),
        ) || textIgnoredRegex.test(item.value || '')

      if (isIgnored) {
        await logger.debug('Ignoring value', {
          name: item.name,
          type: item.type,
          value: item.value,
        })
        return { ...item, value: undefined }
      }
      return item
    }

    default:
      return item
  }
}

export const parseDataItem = async (
  item: DataItem,
  datasource: DataSource,
  logger: Logger,
  state: AustralianState = 'QLD', // TODO: Get state from matter / contract
): Promise<DataItem> => {
  if (!item.value) {
    return { ...item, value: undefined }
  }
  if (!item.value) {
    return item
  }

  switch (item.name) {
    case field.dateOfContract: {
      const date = parseDateOnly(item.value)
      return { ...item, value: date ? formatDate(date) : undefined }
    }

    case field.dateBuildingPestInspection:
    case field.dateFinance:
    case field.dateOfSettlement:
    case field.depositInitialDue:
    case field.depositBalanceDue: {
      const contractDateItem = await datasource.get(field.dateOfContract)
      return await calculateDateOrOffsetDate(
        item,
        logger,
        state,
        contractDateItem,
        yearEndShutdown,
        false,
      )
    }

    case field.buyerAddresLine1:
    case field.buyerAddresLine2:
    case field.buyer2AddresLine1:
    case field.buyer2AddresLine2:
    case field.buyerSolicitorAddressLine1:
    case field.buyerSolicitorAddressLine2:
    case field.propertyAddressLine1:
    case field.propertyAddressLine2:
    case field.sellerAddressLine1:
    case field.sellerAddressLine2:
    case field.seller2AddressLine1:
    case field.seller2AddressLine2:
    case field.sellerAgentAddressLine1:
    case field.sellerAgentaddressline2:
    case field.sellerSolicitorAddressLine1:
    case field.sellerSolicitorAddressLine2:
    case field.buyerAgentAddressLine1:
    case field.buyerAgentAddressLine2:
      return {
        ...item,
        value: capitalise(StreetNameAbbreviationExpander(item.value)),
      }

    case field.buyerSuburb:
    case field.buyer2Suburb:
    case field.buyerSolicitorSuburb:
    case field.sellerSuburb:
    case field.seller2Suburb:
    case field.sellerAgentSuburb:
    case field.sellerSolicitorSuburb:
    case field.propertySuburb:
    case field.buyerAgentSuburb:
      return {
        ...item,
        value: capitalise(item.value),
      }

    case field.buyerName:
    case field.buyer2Name:
    case field.buyerSolicitorName:
    case field.sellerName:
    case field.seller2Name:
    case field.sellerAgentName:
    case field.sellerSolicitorContact:
    case field.buyerSolicitorContact:
    case field.sellerSolicitorName:
    case field.buyerAgentName:
    case field.depositHolder:
    case field.excludedFixtures:
    case field.includedChattels:
      return { ...item, value: capitalizePlus(item.value) }

    case field.buyerEmail:
    case field.buyer2Email:
    case field.buyerSolicitorEmail:
    case field.sellerEmail:
    case field.seller2Email:
    case field.sellerAgentEmail:
    case field.sellerSolicitorEmail:
    case field.buyerAgentEmail:
      return { ...item, value: item.value.toLowerCase() }

    case field.neighbourhoodDisputeYes:
    case field.propertyMattersEncumbrancesYes:
    case field.safetySwitchYes:
    case field.smokeAlarmsYes:
    case field.propertyPresentUseVacantLand:
    case field.propertyPresentUseBuiltOn:
      return { ...item, value: parseSelectionMark(item.value) }

    case field.poolCertificateYes:
    case field.poolExistanceYes:
      return {
        ...item,
        value: parseSelectionMark(item.value) === 'Yes' ? 'T' : 'F',
      }

    case field.leaseDateLastRentIncrease: {
      const date = parseDateOnly(item.value)
      return { ...item, value: date ? formatDate(date) : undefined }
    }

    case field.settlementPlace:
    case field.propertySchemeName:
      return { ...item, value: capitalise(item.value) }

    case field.buyerState:
    case field.buyer2State:
    case field.buyerSolicitorState:
    case field.sellerState:
    case field.seller2State:
    case field.sellerAgentState:
    case field.sellerSolicitorState:
    case field.propertyState:
    case field.buyerAgentState:
      return { ...item, value: item.value.toUpperCase() }

    case field.depositInitial:
    case field.depositBalance: {
      const purchasePriceItem = await datasource.get(field.purchasePrice)

      return {
        ...item,
        value: parseCurrencyAmountOrPercentage(
          purchasePriceItem,
          item.rawText ?? item.value,
        )?.toString(),
      }
    }

    case field.purchasePrice:
      return { ...item, value: extractNumberOnly(item.value)?.toString() }

    case field.buyerMobile:
    case field.buyer2Mobile:
    case field.buyerPhone:
    case field.buyer2Phone:
    case field.buyerAgentMobile:
    case field.buyerAgentPhone:
    case field.buyerSolicitorPhone:
    case field.buyerSolicitorMobile:
    case field.sellerMobile:
    case field.sellerPhone:
    case field.seller2Phone:
    case field.seller2Mobile:
    case field.sellerAgentMobile:
    case field.sellerAgentPhone:
    case field.sellerSolicitorPhone:
    case field.sellerSolicitorMobile:
      return { ...item, value: formatPhoneNumberwithSpacing(item.value) }

    default:
      return item
  }
}
