import type { BlobUploadCommonResponse } from '@azure/storage-blob'
import type { ActionStepService, PagedParticipants } from '@dbc-tech/actionstep'
import { validateAddress } from '@dbc-tech/cca-common'
import { type DbJob, OfferCodeModel } from '@dbc-tech/johnny5-mongodb'
import { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import { J5Config } from '@dbc-tech/johnny5/constants'
import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import {
  type AustralianState,
  type DataItem,
  type Issues,
  type MatterCreateCreateDataCollection,
  type MatterCreateDetailAddress,
  type MatterCreateDetailPhone,
  type MatterCreateExistingParticipant,
  type MatterCreateFile,
  type MatterCreateFileNote,
  type MatterCreateLinkToParticipant,
  type MatterCreateNewParticipant,
  type MatterCreateStep,
  type MatterCreateTask,
} from '@dbc-tech/johnny5/typebox'
import type { ManifestMeta } from '@dbc-tech/johnny5/typebox/manifest-meta.schema'
import {
  capitalise,
  formatToAULocalMobile,
  getIntent,
} from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'
import {
  OnlineConversionNotes,
  PipedriveAdditionalInfo,
  type PipedriveAdditionalInfoType,
  type PipedriveV1Service,
  type PipedriveV2Service,
  investmentPropertyCode,
  pipdriveState,
  pipedriveAdditionalInfoTypes,
  pipedriveCampaignTrigger,
  pipedriveNatureProperty,
  pipedrivePropertyType,
  yesNoOptionsEnableMarketing,
} from '@dbc-tech/pipedrive'
import { type HydratedDocument } from 'mongoose'
import { serializeError } from 'serialize-error'
import { uploadStreamtoAzureStorage } from '../../utils/azure-utils'
import {
  buildDealAddress,
  createPropertyParticipantName,
  getFirstnameOrLastname,
} from '../../utils/data-utils'

import { AddressValidationService } from '@dbc-tech/google'
import {
  ConveyancingMatterTransType,
  type OnlineConversionType,
  azureBlobStorage,
  field,
} from './constants'
import { convertCustomFields, getMainFields } from './utils/custom-fields.utils'

export type PersonName = {
  name: string | undefined
  isCompany: boolean
  firstName: string | undefined
  lastName: string | undefined
  middleName: string | undefined
}

type MatterCreateFileWithFileId = MatterCreateFile & { fileId: number }

export class PipedriveSource implements DataSource {
  private items: DataItem[] = []
  constructor(
    private readonly dealId: number,
    private readonly pipedriveV1: PipedriveV1Service,
    private readonly pipedriveV2: PipedriveV2Service,
  ) {}

  async get(name: string): Promise<DataItem> {
    if (this.items.length === 0) {
      const dealData = await this.pipedriveV2.getDeal(this.dealId)

      if (!dealData) throw new Error(`Deal Id:${this.dealId} not found!`)

      const userId = dealData.data.owner_id
      if (!userId)
        throw new Error(`Creator User Id not found for Deal Id:${this.dealId}!`)

      const personId = dealData.data.person_id
      if (!personId)
        throw new Error(`Person Id not found for Deal Id:${this.dealId}`)

      const personData = await this.pipedriveV2.getDealPerson(personId)
      if (!personData) throw new Error(`Person Id:${personId} not found!`)

      const userData = await this.pipedriveV1.getDealUser(userId)
      if (!userData) throw new Error(`Creator User Id:${userId} not found!`)

      const dealItems = getMainFields(dealData.data)
      const personItems = getMainFields(personData.data, 'person')
      const userItems = getMainFields(userData.data, 'user')

      // Convert custom_fields
      const cfData = dealData.data.custom_fields
      const customFieldItems = convertCustomFields(cfData!)
      const personCfData = personData.data.custom_fields
      const personCustomFields = convertCustomFields(personCfData!)

      this.items = [
        ...dealItems,
        ...customFieldItems,
        ...personCustomFields,
        ...personItems,
        ...userItems,
      ]
    }
    const item = this.items.find((item) => item.name === name)
    if (!item) throw new Error(`Data item not found for name:${name}`)
    return item
  }
}

export class ManifestFormatter {
  private readonly j5config: Johnny5ConfigService
  private readonly matterIssues: Issues[] = []
  private readonly data: DataSource
  private readonly googleService: AddressValidationService

  constructor(
    private readonly job: HydratedDocument<DbJob>,
    private readonly dealId: number,
    private readonly pipedriveV1: PipedriveV1Service,
    private readonly pipedriveV2: PipedriveV2Service,
    private readonly actionstep: ActionStepService,
    private readonly logger: Logger,
  ) {
    this.j5config = new Johnny5ConfigService(this.job.tenant)
    this.data = new PipedriveSource(
      this.dealId,
      this.pipedriveV1,
      this.pipedriveV2,
    )
    this.googleService = new AddressValidationService({
      apiKey: process.env.GOOGLE_API_KEY!,
    })
  }

  getDataValue = (name: string): Promise<string | undefined> =>
    this.data.get(name).then((item) => item.value)

  intent() {
    const { serviceType } = this.job
    if (!serviceType)
      throw new Error(
        `Job Id:${this.job.id} ${this.job.serviceType} Service Type not found`,
      )

    const intent = getIntent(serviceType)
    if (intent == 'unknown')
      throw new Error(`Job Id:${this.job.id} Intent unknown`)

    return intent
  }

  async getState(): Promise<AustralianState> {
    const state = await this.getDataValue(field.property_state)
    if (!state) throw new Error('State not found!')
    return pipdriveState[+state] as AustralianState
  }

  async personAddress(): Promise<MatterCreateDetailAddress | undefined> {
    const address = await this.getDataValue(field.person_testAddress)
    return validateAddress(
      this.googleService,
      address ?? (await this.getState()),
      this.logger,
    )
  }

  async dealAddress(): Promise<MatterCreateDetailAddress | undefined> {
    const postCode = await this.getDataValue(field.property_postCode)
    const stateId = await this.getDataValue(field.property_state)
    const streetName = await this.getDataValue(field.property_streetName)
    const streetNo = await this.getDataValue(field.property_streetNo)
    const streetType = await this.getDataValue(field.property_streetType)
    const suburb = await this.getDataValue(field.property_suburb)
    const unitNo = await this.getDataValue(field.property_unitNo)

    return buildDealAddress({
      postCode,
      stateId,
      streetName,
      streetNo,
      streetType,
      suburb,
      unitNo,
    })
  }

  async personPhone(): Promise<MatterCreateDetailPhone | undefined> {
    const phone = await this.getDataValue(field.person_phone1)
    if (!phone) return undefined
    const fmtPhone = formatToAULocalMobile(phone)
    return {
      label: 'Mobile',
      number: fmtPhone !== undefined ? fmtPhone : phone,
    }
  }

  async personEmail(): Promise<string | undefined> {
    return this.getDataValue(field.person_email1)
  }

  async getPersonName(): Promise<PersonName | undefined> {
    const firstName = await this.getDataValue(field.person_firstName)
    const lastName = await this.getDataValue(field.person_lastName)
    const testLastName = await this.getDataValue(field.person_testLastName)
    const testMiddleName = await this.getDataValue(field.person_testMiddleName)
    const isCompany = await this.getDataValue(field.person_isCompany)
    const name = await this.getDataValue(field.person_name)
    if (!name && !isCompany && !firstName && !lastName) return undefined

    const p = getFirstnameOrLastname(firstName, lastName)

    return {
      name,
      isCompany: isCompany === '400' ? true : false,
      firstName: p?.firstName,
      lastName: p?.lastName ?? testLastName,
      middleName: testMiddleName,
    }
  }

  async buyer_seller_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    const intent = this.intent()

    const j5ConfigKey = (() => {
      switch (intent) {
        case 'buy':
          return J5Config.actionstep.buyerTypeId
        case 'sell':
          return J5Config.actionstep.sellerTypeId
        case 'transfer':
          return J5Config.actionstep.transferTypeId
        default:
          throw new Error(`Invalid intent: ${intent}`)
      }
    })()

    const buyerOrSellerId = await this.j5config.get(j5ConfigKey)
    if (!buyerOrSellerId) {
      throw new Error(`${intent}er type id not found in Johnny5 Config`)
    }

    const address = await this.personAddress()

    const personName = await this.getPersonName()
    await this.logger.debug(`buyer_seller_participant() personName: `, {
      personName,
      address,
    })
    if (!personName) return undefined
    const {
      name: companyName,
      isCompany: is_company,
      firstName,
      lastName,
      middleName,
    } = personName

    const email = await this.personEmail()
    const phones: MatterCreateDetailPhone[] = []
    const phone = await this.personPhone()
    if (phone) phones.push(phone)

    const participant: MatterCreateNewParticipant = {
      type_id: +buyerOrSellerId?.value,
      description: capitalise(`${intent}er participant`),
      details: {
        is_company,
        company_name: is_company ? companyName : undefined,
        addresses: address ? [address] : undefined,
        phones_numbers: phones.length > 0 ? phones : undefined,
        email_address: email,
        first_name: is_company ? undefined : firstName,
        middle_name: is_company ? undefined : middleName,
        last_name: is_company ? undefined : lastName,
      },
    }
    return participant
  }

  async property_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    const propertyTypeId = await this.j5config.get(
      J5Config.actionstep.propertyTypeId,
    )
    if (!propertyTypeId) {
      throw new Error(`Property Type Id not found in Johnny5 Config`)
    }

    const address = await this.dealAddress()
    await this.logger.debug(`property_participant() address: `, address)

    const propertyName = createPropertyParticipantName(address)
    await this.logger.info(
      `property_participant() propertyName: `,
      propertyName,
    )

    if (!propertyName) throw new Error('Property details is empty!')

    const is_company = true

    const email = await this.personEmail()
    const phones: MatterCreateDetailPhone[] = []
    const phone = await this.personPhone()
    if (phone) phones.push(phone)

    const participant: MatterCreateNewParticipant = {
      type_id: +propertyTypeId?.value,
      description: 'Property Participant',
      details: {
        is_company,
        company_name: is_company ? propertyName : undefined,
        addresses: address ? [address] : undefined,
        phones_numbers: phones.length > 0 ? phones : undefined,
        email_address: email,
        first_name: undefined,
        middle_name: undefined,
        last_name: undefined,
      },
    }
    return participant
  }

  async create_link_participants(
    newParticipants: MatterCreateNewParticipant[],
  ): Promise<MatterCreateLinkToParticipant[] | undefined> {
    const intent = this.intent()
    const clientPtcpTypeId = await this.j5config.get(
      J5Config.actionstep.clientTypeId,
    )
    const primaryContactPtcpTypeId = await this.j5config.get(
      J5Config.actionstep.primaryContactTypeId,
    )

    if (!clientPtcpTypeId || !intent) return undefined

    const participantLinks: MatterCreateLinkToParticipant[] = []
    const typeMap = {
      buy: J5Config.actionstep.buyerTypeId,
      sell: J5Config.actionstep.sellerTypeId,
      transfer: J5Config.actionstep.transferTypeId,
      unknown: undefined,
    }
    const typeIdKey = typeMap[intent]
    const targetTypeId = await this.j5config.get(typeIdKey, [intent])

    if (!targetTypeId) return undefined

    const participantCount = newParticipants.filter(
      (p) => p.type_id === +targetTypeId.value,
    ).length

    if (!participantCount) return undefined

    participantLinks.push({
      target_type_id: +clientPtcpTypeId.value,
      source_type_id: +targetTypeId.value,
    })

    if (primaryContactPtcpTypeId) {
      participantLinks.push({
        target_type_id: +primaryContactPtcpTypeId.value,
        source_type_id: +targetTypeId.value,
      })
    }
    return participantLinks.length > 0 ? participantLinks : undefined
  }

  async getSalesPerson(): Promise<
    MatterCreateExistingParticipant[] | undefined
  > {
    const salesPersonTypeId = await this.j5config.get(
      J5Config.actionstep.salespersonTypeId,
    )
    if (!salesPersonTypeId) {
      throw new Error('Sales Person Type Id not found in Johnny5 Config')
    }

    const additionalInfo = (await this.getAdditionalInfo()) as
      | PipedriveAdditionalInfoType
      | undefined
    const isSdsOnlineConv =
      additionalInfo && additionalInfo === PipedriveAdditionalInfo.sds
    await this.logger.debug(
      `getSalesPerson() #additionalInfo value: ${additionalInfo}, isSdsOnlineConv: ${isSdsOnlineConv}`,
    )

    const onlineConv = await this.getOnlineConversion()
    if (onlineConv || isSdsOnlineConv) {
      const salesPersonAsId = await this.j5config.get(
        J5Config.cca.actionstep.onlineConversionSalespersonAsId,
      )
      if (!salesPersonAsId) {
        throw new Error(
          'Online Conversion Sales Person Actionstep Id not found in Johnny5 Config',
        )
      }

      const existingParticipants = [
        {
          id: +salesPersonAsId.value,
          type_id: +salesPersonTypeId.value,
          description: 'Online Conversion Sales Person',
        },
      ]

      await this.logger.debug(
        `getSalesPerson() Online Conversion result:`,
        existingParticipants,
      )
      return existingParticipants
    }

    const salesPersonEmail = await this.getDataValue(field.user_email)
    if (!salesPersonEmail) return undefined

    const query = { email: salesPersonEmail }
    await this.logger.log(`getSalesPerson() query: `, JSON.stringify(query))

    const response = (await this.actionstep.getParticipants(
      query,
    )) as PagedParticipants
    if (!response?.participants?.length) {
      await this.logger.log(
        `getSalesPerson() ${JSON.stringify(query)} empty result!`,
      )
      return undefined
    }

    const existingParticipants = [
      {
        id: response.participants[0].id,
        type_id: +salesPersonTypeId.value,
        description: 'Sales Person',
      },
    ]

    await this.logger.debug(
      `getSalesPerson() ${JSON.stringify(query)} result:`,
      existingParticipants,
    )
    return existingParticipants
  }

  async existingParticipantsFromContract(): Promise<
    MatterCreateExistingParticipant[]
  > {
    const participants: MatterCreateExistingParticipant[] = []

    const salesPerson = await this.getSalesPerson()
    if (salesPerson) {
      participants.push(...salesPerson)
    }

    return participants
  }

  async prepare_collections(): Promise<Record<string, number>> {
    const prepare: Record<string, number> = {}
    const state = await this.getState()
    if (!state) throw new Error('State not found')
    const tag = state.toLowerCase()

    const bill_id = await this.config_matter_collection_id(`whattobill-${tag}`)
    if (bill_id) prepare.bill = bill_id

    const dates_id = await this.config_matter_collection_id(`keydates-${tag}`)
    if (dates_id) prepare.dates = dates_id

    const trans_id = await this.config_matter_collection_id(
      `transdetails-${tag}`,
    )
    if (trans_id) prepare.trans = trans_id

    const prop_id = await this.config_matter_collection_id(
      `propertydetails-${tag}`,
    )
    if (prop_id) prepare.prop = prop_id

    const addr_id = await this.config_matter_collection_id(
      `propertyaddress-${tag}`,
    )
    if (addr_id) prepare.addr = addr_id

    return prepare
  }

  async config_matter_collection_id(name: string): Promise<number | undefined> {
    const config = await this.j5config.get(
      J5Config.actionstep.matterCollectionIds,
      [name],
    )
    return config ? +config.value : undefined
  }

  async propertyCollection(): Promise<
    MatterCreateCreateDataCollection[] | undefined
  > {
    const fields = [
      {
        key: field.property_postCode,
        name: 'Postcode',
        description: 'Postcode - Property Collection',
      },
      {
        key: field.property_state,
        name: 'State',
        description: 'State - Property Collection',
      },
      {
        key: field.property_streetName,
        name: 'StreetName',
        description: 'Street Name - Property Collection',
      },
      {
        key: field.property_streetNo,
        name: 'StreetNumber',
        description: 'Street No - Property Collection',
      },
      {
        key: field.property_streetType,
        name: 'StreetType',
        description: 'Street Type - Property Collection',
      },
      {
        key: field.property_suburb,
        name: 'Suburb',
        description: 'Suburb - Property Collection',
      },
      {
        key: field.property_unitNo,
        name: 'UnitNumber',
        description: 'Unit No - Property Collection',
      },
      {
        key: field.property_propertyCode,
        name: 'PropertyType',
        description: 'PropertyType - Property Collection',
      },
    ]

    const collections: MatterCreateCreateDataCollection[] = []

    for (const { key, name, description } of fields) {
      const value = await this.getDataValue(key)

      if (value && key === field.property_propertyCode) {
        const propertyType = pipedrivePropertyType[+value]
        if (propertyType)
          collections.push({
            description,
            field_name: name,
            value: propertyType,
          })
      } else if (value && key === field.property_state) {
        const state = pipdriveState[+value]
        if (state)
          collections.push({ description, field_name: name, value: state })
      } else {
        if (value) collections.push({ description, field_name: name, value })
      }
    }
    return collections.length > 0 ? collections : undefined
  }

  private async getAdditionalInfo(): Promise<string | undefined> {
    const additionalInfoCode = await this.getDataValue(field.additionalInfo)
    if (!additionalInfoCode) return undefined
    const additionalInfo = pipedriveAdditionalInfoTypes[+additionalInfoCode]
    if (!additionalInfo) return undefined
    return additionalInfo
  }

  async create_collections(): Promise<MatterCreateCreateDataCollection[]> {
    const collections: MatterCreateCreateDataCollection[] = []

    const billingAdditionalInfo = await this.getDataValue(
      field.billingAdditionalInfo,
    )

    const additionalInfo =
      (await this.getAdditionalInfo()) ?? billingAdditionalInfo

    if (additionalInfo) {
      collections.push({
        description: 'Additional Info',
        field_name: 'AdditionalInfo',
        value: additionalInfo,
      })
    }

    const discountOffered = await this.getDataValue(field.discountOffered)
    if (discountOffered) {
      collections.push({
        description: 'Discount Offered',
        field_name: 'DiscountOffered',
        value: discountOffered,
      })
    }

    const fixedFee = await this.getDataValue(field.fixedFee)
    if (fixedFee) {
      collections.push({
        description: 'Fixed Fee',
        field_name: 'FixedFee',
        value: fixedFee,
      })
    }

    const offerApplied = await this.getDataValue(field.offerApplied)
    if (offerApplied) {
      const ocdata = await OfferCodeModel.findOne({
        pipedriveofferid: offerApplied,
        isenabled: true,
      })
        .select('offercode')
        .exec()
      if (!ocdata) this.logger.warn(`Offercode Id:${offerApplied} not found!`)

      const offerCode = ocdata?.offercode
      this.logger.debug(`Offer Code: ${offerCode}`)

      if (offerCode) {
        collections.push({
          description: 'Offer Applied',
          field_name: 'OfferApplied',
          value: offerCode,
        })
      }
    }

    const intent = this.intent()
    const source = await this.getDataValue(field.source)

    if (source && intent === 'buy') {
      collections.push({
        description: 'Source',
        field_name: 'Source',
        value: source,
      })
    }

    const enableMarketing = await this.getDataValue(field.enableMarketing)
    if (enableMarketing) {
      collections.push({
        description: 'Enable Marketing',
        field_name: 'EnableMarketing',
        value: yesNoOptionsEnableMarketing[+enableMarketing],
      })
    }

    const rawInvestmentProperty = await this.getDataValue(
      field.investorOwnerOccupier,
    )
    const investmentProperty = rawInvestmentProperty
      ? investmentPropertyCode[+rawInvestmentProperty]
      : undefined
    if (investmentProperty) {
      collections.push({
        description: 'Investment Property',
        field_name: 'investment_property',
        value: investmentProperty,
      })
    }

    const campTrigger = await this.getDataValue(field.campaignTrigger)
    if (campTrigger)
      collections.push({
        description: 'Campaign Trigger',
        field_name: 'camptrigger',
        value: pipedriveCampaignTrigger[+campTrigger],
      })

    const racvMembershipNo = await this.getDataValue(field.racvMembershipNo)
    if (
      (racvMembershipNo && racvMembershipNo?.length > 0) ||
      (campTrigger && pipedriveCampaignTrigger[+campTrigger] === 'RACV')
    ) {
      collections.push({
        description: 'Hypercare Reason',
        field_name: 'HypercareReason',
        value: 'RACV (VIP)',
      })
    }

    const searchesFee = await this.getDataValue(field.searchesFee)
    if (searchesFee) {
      collections.push({
        description: 'Searches Fee',
        field_name: 'SearchesFee',
        value: searchesFee,
      })
    }

    const discountOfferedReviewFee = await this.getDataValue(
      field.discountOfferedReviewFee,
    )
    if (discountOfferedReviewFee) {
      collections.push({
        description: 'Discount Offered Review Fee',
        field_name: 'DiscountOfferedReview',
        value: discountOfferedReviewFee,
      })
    }

    const reviewFee = await this.getDataValue(field.reviewFee)

    const draftingFee = await this.getDataValue(field.draftingFee)
    if (draftingFee) {
      collections.push({
        description: 'Drafting Fee',
        field_name: 'ReviewDraftingFee',
        value: draftingFee,
      })
    } else if (reviewFee) {
      collections.push({
        description: 'Review Fee',
        field_name: 'ReviewDraftingFee',
        value: additionalInfo === 'Conveyance' ? '0' : reviewFee,
      })
    }

    const propertyCollection = await this.propertyCollection()
    if (propertyCollection) {
      await this.logger.debug(
        `Property Collection: ${JSON.stringify(collections)}`,
      )
      collections.push(...propertyCollection)
    }
    return collections
  }

  async filenotes(): Promise<MatterCreateFileNote[]> {
    let fileNotes: MatterCreateFileNote[] = []

    await this.logger.info(`Pipedrive fileNotes dealId ${this.dealId} #Start`)
    try {
      const result = await this.pipedriveV1.getDealNotes(this.dealId)
      if (!result)
        throw new Error(
          `getDealNotes() Deal Id ${this.dealId} Filenote result is empty!`,
        )

      if (result.data.length === 0) {
        this.logger.warn(
          `Pipedrive fileNotes dealId ${this.dealId} #Result : No fileNotes found!`,
        )
        return fileNotes
      }

      fileNotes = result.data
        .filter(
          (filenote) => !(filenote.content || '').includes('SYSTEM GENERATED'),
        )
        .map((filenote) => ({
          note: (filenote.content || '').replace(/<[^>]*>/g, '').trim(),
        }))

      await this.logger.debug(
        `Pipedrive fileNotes dealId ${this.dealId} #Result : ${JSON.stringify(fileNotes)}`,
      )

      const onlineConv = await this.getOnlineConversion()
      if (onlineConv) {
        fileNotes.push({ note: OnlineConversionNotes[onlineConv] })
      }

      const additionalInfo = (await this.getAdditionalInfo()) as
        | PipedriveAdditionalInfoType
        | undefined
      await this.logger.debug(
        `Deal custom field (${field.additionalInfo}) containing additionalInfo value:`,
        additionalInfo,
      )

      if (additionalInfo && additionalInfo === PipedriveAdditionalInfo.sds) {
        fileNotes.push({
          note: OnlineConversionNotes.sds,
        })
      }
      return fileNotes
    } catch (error) {
      this.logger.error(
        `Pipedrive fileNotes dealId ${this.dealId} #Error : ${error}`,
      )
      return fileNotes
    }
  }

  async tasks(): Promise<MatterCreateTask[]> {
    return []
  }

  async files(): Promise<MatterCreateFile[]> {
    let filesData: MatterCreateFile[] = []
    this.logger.info(`Pipedrive files dealId ${this.dealId} #Start`)

    try {
      const result = await this.pipedriveV1.getDealFiles(this.dealId)
      if (!result)
        throw new Error(
          `getDealFiles() Deal Id ${this.dealId} File result is empty!`,
        )

      if (result?.data.length === 0) {
        this.logger.warn(
          `Pipedrive files dealId ${this.dealId} #Result : No files found!`,
        )
        return filesData
      }

      const filesDataWithId: MatterCreateFileWithFileId[] = result.data.map(
        (file) => {
          return {
            filename: file.name,
            url: file.url,
            fileId: file.id,
          }
        },
      )

      await this.logger.debug(
        `Pipedrive files dealId ${this.dealId} #Result : ${JSON.stringify(filesDataWithId)}`,
      )

      filesData = await this.uploadToAzureStorage(filesDataWithId)
      return filesData
    } catch (error) {
      this.logger.error(
        `Pipedrive files dealId ${this.dealId} #Error : ${error}`,
      )
      return filesData
    }
  }

  private uploadToAzureStorage = async (
    locFiles: MatterCreateFileWithFileId[],
  ): Promise<MatterCreateFile[]> => {
    const mcFiles: MatterCreateFile[] = []

    await this.logger.info(
      `uploadToAzureStorage(+) Pipedrive files dealId ${this.dealId}`,
    )

    try {
      for (const file of locFiles ?? []) {
        const { fileId, filename } = file
        if (!fileId) {
          this.logger.warn(
            `uploadToAzureStorage(*) File Id:${fileId} ${filename} not found!`,
          )
          continue
        }
        const stream = await this.pipedriveV1.downloadFile(fileId)
        if (!stream) {
          throw new Error(
            `File Id:${fileId} ${filename} pipedrive stream download failed!`,
          )
        }

        const generateBlobName = (filename: string, id: number) => {
          const blobName = filename
            .replace(/[^a-zA-Z0-9.]/g, '_')
            .replace(/_(?=[^.]*$)/, '')
          return `${azureBlobStorage.virtualFolder}/${this.dealId}/${this.dealId}-${id}-${blobName}`
        }

        const storedBlobName = generateBlobName(filename, fileId)
        const res = await uploadStreamtoAzureStorage(storedBlobName, stream)

        const uploadResult = res.val as BlobUploadCommonResponse
        if (
          typeof res.val === 'string' ||
          uploadResult._response.status !== 201
        ) {
          throw new Error(
            `File Id:${fileId} ${filename} azure upload failed! Error: ${res.val}`,
          )
        }

        const getBlobUrlName = (docResponse: BlobUploadCommonResponse) => {
          const blobNameUrl = docResponse._response.request.url
          const docUrl = new URL(blobNameUrl).pathname
          this.logger.debug('getBlobUrlName() blobNameUrl: ', {
            blobNameUrl,
            docUrl,
          })
          return (
            docUrl.split('/' + azureBlobStorage.containerName + '/')[1] ||
            docUrl
          )
        }

        const azureUrl = getBlobUrlName(res.val as BlobUploadCommonResponse)
        this.logger.info(`uploadToAzureStorage(*) File uploaded:`, {
          fileId,
          filename,
          azureUrl,
        })

        mcFiles.push({
          filename,
          url: String(azureUrl),
        })
      }
      this.logger.debug(
        `uploadToAzureStorage(-) Pipedrive files dealId ${this.dealId} #Result : ${JSON.stringify(mcFiles)}`,
      )
      return mcFiles
    } catch (error) {
      const errMsg = serializeError(error)
      this.logger.error(
        `uploadToAzureStorage(-) Pipedrive files dealId ${this.dealId} #Error : `,
        { errMsg },
      )
      return mcFiles
    }
  }

  async steps(): Promise<MatterCreateStep> {
    return { ready: 0 }
  }

  private getOnlineConversion = async (): Promise<
    OnlineConversionType | undefined
  > => {
    const { meta } = this.job
    const onlineConv = meta?.find((m) => m.key === 'onlineConversionType')
      ?.value as OnlineConversionType

    return onlineConv || undefined
  }

  async manifestMeta(): Promise<ManifestMeta[]> {
    const newMatterEnabled = await this.j5config.get(
      J5Config.cca.ccaDealMatterNewNameEnabled,
    )

    await this.logger.info(
      `manifestMeta() newMatterEnabled: ${newMatterEnabled?.value}`,
    )

    if (newMatterEnabled && newMatterEnabled.value === 'true') {
      return this.manifestMetaV2()
    } else {
      return this.manifestMetaV1()
    }
  }

  async manifestMetaV1(): Promise<ManifestMeta[]> {
    const intent = this.intent()
    const state = await this.getState()

    const rawNatureProperty = await this.getDataValue(
      field.property_propertyCode,
    )
    const natureProperty = rawNatureProperty
      ? pipedriveNatureProperty[+rawNatureProperty]
      : undefined

    const meta: ManifestMeta[] = []
    if (intent) {
      meta.push({ key: 'intent', value: intent })
    }
    if (state) {
      meta.push(
        { key: 'state', value: state },
        {
          key: 'matterTypeName',
          value: `Conveyancing.com.au: ${state} - ${ConveyancingMatterTransType[intent]}`,
        },
      )
    }
    const postCode = await this.getDataValue(field.property_postCode)
    if (postCode) {
      meta.push({ key: 'postCode', value: postCode })
    }

    const salesPersonName = await this.getDataValue(field.user_name)
    if (salesPersonName) {
      meta.push({ key: 'concierge', value: salesPersonName })
    }
    if (natureProperty) {
      meta.push({ key: 'natureOfProperty', value: natureProperty })
    }

    const additionalInfo = await this.getAdditionalInfo()
    if (additionalInfo) {
      meta.push({ key: 'additionalInfo', value: additionalInfo })
    }

    const person = await this.getPersonName()
    await this.logger.debug(`manifestMetaV1() person: `, person)

    if (!person) throw new Error('Person Client Name not found!')
    const midName = person.middleName ? ` ${person.middleName}` : ''
    const clientName = person.isCompany
      ? person.name
      : `${person.firstName}${midName} ${person.lastName}`
    if (clientName) {
      const cliCodeName = person.isCompany ? person.name : person.lastName
      if (!cliCodeName) throw new Error('Client Code Name not found!')

      const filteredName = cliCodeName.replace(/`/g, '')
      meta.push(
        { key: 'clientName', value: clientName },
        {
          key: 'clientCode',
          value: `${(filteredName.substring(0, 3).toUpperCase()).padEnd(3, '0')}01`,
        },
      )
    }

    await this.logger.debug(`manifestMeta Meta: ${JSON.stringify(meta)}`)
    return meta
  }

  async manifestMetaV2(): Promise<ManifestMeta[]> {
    const meta: ManifestMeta[] = []

    meta.push({ key: 'dealId', value: this.dealId.toString() })
    const intent = this.intent()
    if (intent) {
      meta.push({ key: 'intent', value: intent })
    }

    const state = await this.getState()
    if (state) {
      meta.push(
        { key: 'state', value: state },
        {
          key: 'matterTypeName',
          value: `Conveyancing.com.au: ${state} - ${ConveyancingMatterTransType[intent]}`,
        },
      )
    }

    const rawNatureProperty = await this.getDataValue(
      field.property_propertyCode,
    )
    const natureProperty = rawNatureProperty
      ? pipedriveNatureProperty[+rawNatureProperty]
      : undefined
    if (natureProperty) {
      meta.push({ key: 'natureOfProperty', value: natureProperty })
    }

    const postCode = await this.getDataValue(field.property_postCode)
    if (postCode) {
      meta.push({ key: 'postCode', value: postCode })
    }

    const salesPersonName = await this.getDataValue(field.user_name)
    if (salesPersonName) {
      meta.push({ key: 'concierge', value: salesPersonName })
    }

    const person = await this.getPersonName()
    await this.logger.debug(`manifestMetaV2() person: `, person)

    if (!person) {
      throw new Error('Person Client Name not found!')
    }

    if (person.isCompany) {
      if (!person.name) {
        throw new Error('Company Name is required for company clients!')
      }
    } else {
      if (!person.lastName) {
        throw new Error('Last Name is required for individual clients!')
      }
    }

    const clientName = person.isCompany
      ? person.name
      : `${person.firstName}${person.middleName ? ` ${person.middleName}` : ''} ${person.lastName}`

    meta.push({ key: 'isCompany', value: person.isCompany ? 'true' : 'false' })
    meta.push({
      key: 'clientName',
      value: clientName!.replace(/[`']/g, ''),
    })

    if (person.isCompany) {
      meta.push({
        key: 'companyName',
        value: person.name!.replace(/[`']/g, ''),
      })
    } else {
      meta.push({
        key: 'lastName',
        value: person.lastName!.replace(/[`']/g, ''),
      })
    }

    await this.logger.debug(`manifestMeta Meta: ${JSON.stringify(meta)}`)
    return meta
  }

  public get issues(): Issues[] {
    return this.matterIssues
  }
}
