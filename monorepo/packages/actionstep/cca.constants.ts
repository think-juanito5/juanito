/**
 * An array of matter type IDs that represent CCA Sell File matters.
 */
export const ccaSellFileMatterTypes = [67, 68, 69, 70, 71, 72]

/**
 * Represents the mapping of matter types to their corresponding numbers.
 */
export const ccaMatterTypes: { [key: number]: string } = {
  67: 'Conveyancing.com.au: QLD',
  68: 'Conveyancing.com.au: NSW',
  69: 'Conveyancing.com.au: VIC',
  70: 'Conveyancing.com.au: SA',
  71: 'Conveyancing.com.au: TAS',
  72: 'Conveyancing.com.au: WA',
}

export const ccaMatterConstants: { [key: string]: number } = {
  primaryClientParticipantTypeId: 72,
}

export const ccaParticipantTypes: { [key: number]: string } = {
  71: 'Client',
  72: 'Client_Primary_Contact',
  84: 'Salesperson',
}

export const StepNameValues = {
  Archived: 'Archived',
  Cancellation: 'Cancellation',
  ContractDraftedDoNotUse: 'Contract Drafted DO NOT USE',
  ContractDrafting: 'Contract Drafting',
  ContractDraftingPDoNotUse: 'Contract Drafting (P) DO NOT USE',
  ContractDraftingSDoNotUse: 'Contract Drafting (S) DO NOT USE',
  ContractExchangeCoolingOffPDoNotUse:
    'Contract Exchange & Cooling Off (P) DO NOT USE',
  ContractExchangeDoNotUse: 'Contract Exchange DO NOT USE',
  ContractExchangeSDoNotUse: 'Contract Exchange (S) DO NOT USE',
  ContractReview: 'Contract Review',
  ContractTerminated: 'Contract Terminated',
  ContractWithCOPAndConditionsDoNotUse:
    'Contract with COP and Conditions DO NOT USE',
  DebtRecovery: 'Debt Recovery',
  DelayedSettlement: 'Delayed Settlement',
  IncorrectlySetupPreSettlementResiOTP:
    '(Incorrectly Setup step) Pre-Settlement Resi (OTP)',
  MatterPreparation: 'Matter Preparation',
  OutstandingInvoices: 'Outstanding Invoices',
  PaperSettlement: 'Paper Settlement',
  PendingDraftingWebform: 'Pending Drafting Webform',
  PendingRegistrationOTP: 'Pending Registration (OTP)',
  PendingTransfer: 'Pending Transfer',
  PostSettlementPDoNotUse: 'Post Settlement (P) DO NOT USE',
  PostSettlementSDoNotUse: 'Post Settlement (S) DO NOT USE',
  PreContractSigningPDoNotUse: 'Pre-Contract Signing (P) DO NOT USE',
  PreContractSigningSDoNotUse: 'Pre-Contract Signing (S) DO NOT USE',
  PreExchangePDoNotUse: 'Pre-Exchange (P) DO NOT USE',
  PreExchangeSDoNotUse: 'Pre-Exchange (S) DO NOT USE',
  PreSettlementResiOTP: 'Pre-Settlement Resi (OTP)',
  PreSettlementResiP: 'Pre-Settlement Resi (P)',
  PreSettlementResiS: 'Pre-Settlement Resi (S)',
  PreSettlementResiT: 'Pre-Settlement Resi (T)',
  SellerDisclosureStatement: 'Seller Disclosure Statement',
  Settled: 'Settled',
  TransferStampingLodgementDoNotUse: 'Transfer Stamping & Lodgement DO NOT USE',
  TrustSettlement: 'Trust Settlement',
  Unrecoverable: 'Unrecoverable',
} as const
