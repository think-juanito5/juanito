import type { Bst, ServiceType } from '../typebox'

export type Intent = 'buy' | 'sell' | 'transfer' | 'unknown'

export const getIntent = (serviceType: ServiceType): Intent => {
  switch (serviceType) {
    case 'conveyancing-buy':
      return 'buy'
    case 'conveyancing-sell':
      return 'sell'
    default:
      return 'unknown'
  }
}

export const getIntentFromBst = (bst: Bst): Intent => {
  switch (bst) {
    case 'B':
      return 'buy'
    case 'S':
      return 'sell'
    case 'T':
      return 'transfer'
    default:
      return 'unknown'
  }
}

export const getReverseIntent = (inputIntent: Intent): Intent => {
  switch (inputIntent) {
    case 'buy':
      return 'sell'
    case 'sell':
      return 'buy'
    default:
      return 'unknown'
  }
}

export const getServiceType = (intent: Intent): ServiceType => {
  switch (intent) {
    case 'buy':
      return 'conveyancing-buy'
    case 'sell':
      return 'conveyancing-sell'
    case 'transfer':
      return 'conveyancing-transfer'
    default:
      return 'unknown'
  }
}
