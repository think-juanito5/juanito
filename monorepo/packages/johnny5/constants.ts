export const Defaults = {
  query: {
    limit: 50,
    latestLimit: 10,
    minimumLimit: 1,
    maximumLimit: 1000,
    sort: 'desc',
  },
} as const

export const AzConfig = {
  bark: {
    dealCreateEnabled: 'johnny5-bark-deal-creation-enabled',
    leadEmailRecipients: 'bark-lead-email-recipients',
    leadEmailTemplateId: 'bark-lead-email-template-id',
  },
  btr: {
    sellerDisclosure: {
      agents: {
        emailEnabled: 'btr-sds-agent-registered-email-enabled',
        emailTemplateId: 'btr-sds-agent-registered-email-template-id',
        testEmailRecipients: 'btr-sds-agent-registered-email-test-recipients',
      },
      clients: {
        matterCreationEnabled: 'btr-sds-matter-creation-enabled',
      },
    },
  },
  cca: {
    contactForm: {
      emailEnabled: 'cca-contact-form-email-enabled',
      emailRecipients: 'cca-contact-form-email-recipient',
      templateId: 'cca-contact-form-email-template-id',
    },
    feedbackForm: {
      emailEnabled: 'cca-feedback-form-email-enabled',
      emailRecipients: 'cca-feedback-form-email-recipient',
      templateId: 'cca-feedback-form-email-template-id',
    },
    quoteContractUploaded: {
      emailEnabled: 'cca-quotes-contract-uploaded-email-enabled',
      emailRecipients: 'cca-quotes-contract-uploaded-email-recipient',
      templateId: 'cca-quotes-contract-uploaded-email-template-id',
    },
    quotePlanSelected: {
      emailEnabled: 'cca-quotes-plan-selected-email-enabled',
      emailRecipients: 'cca-quotes-plan-selected-email-recipient',
      templateId: 'cca-quotes-plan-selected-email-template-id',
    },
    quoteCompleted: {
      emailEnabled: 'cca-quotes-completed-email-enabled',
      emailRecipients: 'cca-quotes-completed-email-recipient',
      templateId: 'cca-quotes-completed-email-template-id',
    },
    unsubscribeFormEnabled: 'cca-email-unsubscribe-form-enabled',
    refreshEnhancementEnabled: 'johnny5-refresh-enhancement-enabled',
    minimumProcessableMatterId: 'johnny5-minimum-processable-matter-id',
  },
  cron: {
    actionstepStaleMatterCleanupEnabled:
      'johnny5-cron-actionstep-stale-matter-cleanup',
  },
  pipedrive: {
    mcReadyStageId: 'johnny5-pipedrive-mc-ready-stage-id',
    testMcReadyStageId: 'johnny5-pipedrive-test-mc-ready-stage-id',
    mcEnabled: 'johnny5-matter-creation-enabled',
    mcReadyTeamsNotificationsEnabled:
      'pipedrive-mc-ready-teams-notifications-enabled',
    matterCreatedStageId: 'johnny5-pipedrive-matter-created-stage-id',
    noSaleStageId: 'johnny5-pipedrive-no-sale-stage-id',
    propertyValidationEnabled: 'johnny5-property-validation-enabled',
    marketingStatusEnabled: 'johnny5-pipedrive-marketing-status-enabled',
    lostUnsubscribeEnabled: 'johnny5-pipedrive-lost-unsubscribe-enabled',
    personUnsubscribeEnabled: 'pipedrive-person-unsubscribe-enabled',
  },
  raq: {
    datalakeRaqEnabled: 'johnny5-raq-datalake-enabled',
    dealCreateEnabled: 'johnny5-raq-deal-creation-enabled',
  },
  actionstep: {
    matterAddParticipantEnabled:
      'johnny5-actionstep-matter-add-participant-enabled',
    matterNameRefreshOnActionUpdateEnabled:
      'johnny5-actionstep-matter-name-refresh-action-update-enabled',
    nameNameRefreshOnStepChangeEnabled:
      'johnny5-actionstep-matter-name-refresh-stepchange-enabled',
    matterTrustpilotEnabled: 'johnny5-matter-create-trustpilot-link-enabled',
    matterTrustpilotUpdateEnabled:
      'johnny5-matter-create-trustpilot-link-update-enabled',
    ccaConveyancerTypeId: 'johnny5-actionstep-conveyancer-type-id',
    ccaClientTypeId: 'johnny5-actionstep-client-type-id',
    payment: 'johnny5-actionstep-matter-payment-enabled',
  },
} as const

export const J5Config = {
  actionstep: {
    trustAccount: 'actionstep_trust_account',
    trustAccountName: 'trust_account_name',
    othersideTypeId: 'otherside_type_id',
    clientTypeId: 'client_type_id',
    propertyTypeId: 'property_type_id',
    changestepAssignedId: 'changestep_assigned_id',
    primaryContactTypeId: 'primary_contact_type_id',
    practitionerId: 'practitioner_id',
    fileOwnerId: 'file_owner_id',
    buyerTypeId: 'buyer_type_id',
    sellerTypeId: 'seller_type_id',
    transferTypeId: 'transfer_type_id',
    depositHolderTypeId: 'deposit_holder_type_id',
    othersideSolicitorTypeId: 'otherside_solicitor_type_id',
    othersideSolicitorContactTypeId: 'otherside_solicitor_contact_type_id',
    councilTypeId: 'council_type_id',
    waterAuthTypeId: 'water_auth_type_id',
    conveyancingAdministrationId: 'actionstep-conveyancing-administration-id',
    salespersonTypeId: 'salesperson_type_id',
    matterCollectionIds: 'matter_collection_ids',
    conveyancerTypeId: 'conveyancer_type_id',
    sellerAgentTypeId: 'agent_type_id',
    sellerAgentContactTypeId: 'agent_contact_type_id',
    sellerAgentOfficeTypeId: 'seller_agent_office_type_id',
    sellerAgentPrimaryContactTypeId: 'seller_agent_primary_contact_type_id',
    assignedLawyerTypeId: 'assigned_lawyer_type_id',
    adminStaffTypeId: 'admin_staff_type_id',
    conveyancingManagerTypeId: 'conveyancing_manager_type_id',
    sdsAssignedLawyerId: 'sds-assigned-lawyer-id',
    sdsAdminStaffId: 'sds-admin-staff-id',
    preSettlementAssignedLawyerId: 'pre-settlement-assigned-lawyer-id',
    conveyancingManagerId: 'oc-conveyancing-manager-id',
    preSettlementConveyancingManagerId:
      'pre-settlement-conveyancing-manager-id',
    smsEmailProcEnabled: 'actionstep-sds-sms-email-processing-enabled',
  },
  btr: {
    settlementAgentFee: 'settlement_agent_fee',
    actionstep: {
      participantDefaultId: 'actionstep-btr-participant-default-id',
    },
    powerAutomate: {
      fileOpeningExtractUrl: 'power-automate-file-opening-extract-url',
    },
    sellerDisclosure: {
      agents: {
        emailTemplateId: 'btr-sds-agent-registered-email-template-id',
        testEmailRecipients: 'btr-sds-agent-registered-email-test-recipients',
        ccEmailRecipients: 'btr-sds-agent-registered-email-cc-recipients',
      },
      clients: {
        sdsFormFilenotesEnabled: 'btr-sds-client-form-filenotes-enabled',
      },
    },
    teams: {
      contractDropHitlWaitingMessages: {
        teamsId: 'btr-contract-drop-hitl-waiting-messages-teams-id',
        channelId: 'btr-contract-drop-hitl-waiting-messages-channel-id',
      },
      sdsMatterCreatedMessages: {
        teamsId: 'btr-sds-matter-created-messages-teams-id',
        channelId: 'btr-sds-matter-created-messages-channel-id',
      },
    },
  },
  cca: {
    ccaDealMatterNewNameEnabled: 'cca-deal-matter-new-name-enabled',
    actionstep: {
      draftingId: 'actionstep-cca-drafting-id',
      onlineConversionSalespersonAsId: 'online-conversion-salesperson-as-id',
    },
    teams: {
      newLeads: {
        teamsId: 'new-leads-teams-id',
        channelId: 'new-leads-channel-id',
      },
      mcReadyMessages: {
        teamsId: 'pipedrive-mc-ready-teams-id',
        channelId: 'pipedrive-mc-ready-channel-id',
      },
      matterCreatedMessages: {
        teamsId: 'matter-created-messages-teams-id',
        channelId: 'matter-created-messages-channel-id',
      },
    },
    quoteContractUploaded: {
      emailEnabled: 'cca-quotes-contract-uploaded-email-enabled',
      emailRecipients: 'cca-quotes-contract-uploaded-email-recipient',
      templateId: 'cca-quotes-contract-uploaded-email-template-id',
    },
    quoteCompleted: {
      emailEnabled: 'cca-quotes-completed-email-enabled',
      emailRecipients: 'cca-quotes-completed-email-recipient',
      templateId: 'cca-quotes-completed-email-template-id',
    },
    quotePlanSelected: {
      emailEnabled: 'cca-quotes-plan-selected-email-enabled',
      emailRecipients: 'cca-quotes-plan-selected-email-recipient',
      templateId: 'cca-quotes-plan-selected-email-template-id',
    },
    ccaPayment: {
      datalakeSourceId: 'cca-payment-datalake-source-id',
    },
  },
  email: {
    defaultEmailSubscriber: 'johnny5-default-email-subscriber',
  },
  teams: {
    powerAutomateTeamsServiceUrl: 'power-automate-teams-service-url',
    undeliveredMessages: {
      teamsId: 'undelivered-messages-teams-id',
      channelId: 'undelivered-messages-channel-id',
    },
  },
} as const

export const testing = {
  ignoreDealMobileNumber: '0400000001',
} as const

export const urlPattern = '^https?://\\S+$'
