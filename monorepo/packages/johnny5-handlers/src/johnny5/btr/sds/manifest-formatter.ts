import {
  IsMobileNumber,
  J5Config,
  btrSdsClientWebhookSchema,
  formatPhoneNumberwithSpacing,
  getIntent,
  getValue,
  propertyAddressSchema,
} from '@dbc-tech/johnny5'
import { ConveyancingType } from '@dbc-tech/johnny5-btr'
import type { DbJob } from '@dbc-tech/johnny5-mongodb'
import { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import type {
  Issues,
  MatterCreateCreateDataCollection,
  MatterCreateDetailAddress,
  MatterCreateDetailPhone,
  MatterCreateExistingParticipant,
  MatterCreateFile,
  MatterCreateFileNote,
  MatterCreateLinkToParticipant,
  MatterCreateNewParticipant,
  MatterCreateStep,
  MatterCreateTask,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { type HydratedDocument } from 'mongoose'
import {
  createPropertyParticipantName,
  extractName,
  isCompany,
} from '../../../utils/data-utils'
import { extractEmails } from './../utils/string-utils'
import { SdsWebhookReader } from './sds-webhook-reader'

type CDPrefix =
  | 'sellers'
  | 'seller_2'
  | 'seller_3'
  | 'seller_4'
  | 'property'
  | 'sellers_agent'
  | 'sellers_agency'

type SDSubSection = 'seller' | 'agent' | 'agent_contact' | 'property'

export class ManifestFormatter {
  private readonly j5config: Johnny5ConfigService
  private readonly data: DataSource
  private readonly matterIssues: Issues[] = []

  constructor(
    private readonly job: HydratedDocument<DbJob>,
    private readonly logger: Logger,
  ) {
    this.j5config = new Johnny5ConfigService(job.tenant)

    const webhookData = getValue(
      this.job.meta,
      'webhookPayload',
      btrSdsClientWebhookSchema,
      false,
    )
    if (!webhookData) {
      this.logger.error(
        `Job Id:${this.job.id}  Webhook data not found in job meta`,
      )
      throw new Error(`Webhook data not found in job meta`)
    }
    const validatedAddress = getValue(
      this.job.meta,
      'validatedAddress',
      propertyAddressSchema,
      true,
    )
    this.data = new SdsWebhookReader(webhookData, validatedAddress)
  }

  getDataValue = (name: string): Promise<string | undefined> =>
    this.data.get(name).then((item) => item.value)

  intent() {
    const { serviceType } = this.job
    if (!serviceType)
      throw new Error(`Job Id:${this.job.id}  Service Type not found`)

    const intent = getIntent(serviceType)
    if (intent == 'unknown')
      throw new Error(`Job Id:${this.job.id} Intent unknown`)

    return intent
  }

  async existingParticipantsFromContract(): Promise<
    MatterCreateExistingParticipant[]
  > {
    const participants: MatterCreateExistingParticipant[] = []
    return participants
  }

  async create_link_participants(
    newParticipants: MatterCreateNewParticipant[],
  ): Promise<MatterCreateLinkToParticipant[] | undefined> {
    const getTypeId = async (key: string): Promise<number | undefined> => {
      const config = await this.j5config.get(key)
      return config ? +config.value : undefined
    }

    const clientPtcpTypeId = await getTypeId(J5Config.actionstep.clientTypeId)
    const sellerPtcpTypeId = await getTypeId(J5Config.actionstep.sellerTypeId)
    const primaryContactPtcpTypeId = await getTypeId(
      J5Config.actionstep.primaryContactTypeId,
    )

    if (!clientPtcpTypeId || !sellerPtcpTypeId || !primaryContactPtcpTypeId) {
      this.logger.error('Participant type IDs are not configured properly', {
        clientPtcpTypeId,
        sellerPtcpTypeId,
        primaryContactPtcpTypeId,
      })
      return undefined
    }

    const hasSeller = newParticipants.some(
      (p) => p.type_id === sellerPtcpTypeId,
    )
    if (!hasSeller) return undefined

    return [
      {
        target_type_id: clientPtcpTypeId,
        source_type_id: sellerPtcpTypeId,
      },
      {
        target_type_id: primaryContactPtcpTypeId,
        source_type_id: sellerPtcpTypeId,
      },
    ]
  }

  async seller1_participant(): Promise<MatterCreateNewParticipant | undefined> {
    return this.participant('seller', 'sellers')
  }

  async seller2_participant(): Promise<MatterCreateNewParticipant | undefined> {
    return this.participant('seller', 'seller_2')
  }

  async seller3_participant(): Promise<MatterCreateNewParticipant | undefined> {
    return this.participant('seller', 'seller_3')
  }

  async seller4_participant(): Promise<MatterCreateNewParticipant | undefined> {
    return this.participant('seller', 'seller_4')
  }

  async property_address_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    return this.participant('property', 'property', true)
  }

  async seller_agent_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    return this.participant('agent', 'sellers_agent', true)
  }

  async seller_agent_contact_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    return this.participant('agent_contact', 'sellers_agent')
  }

  async getCategoryId(indexKey: string) {
    const categoryId = await this.j5config.get(indexKey)
    if (!categoryId) {
      throw new Error(`Category ID for key "${indexKey}" not found in J5Config`)
    }
    return +categoryId.value
  }

  private getJ5KeyName = (sub_section: SDSubSection): string | undefined => {
    const map: Record<SDSubSection, keyof typeof J5Config.actionstep> = {
      property: 'propertyTypeId',
      seller: 'sellerTypeId',
      agent: 'sellerAgentOfficeTypeId',
      agent_contact: 'sellerAgentPrimaryContactTypeId',
    }
    const key = map[sub_section]
    return key ? J5Config.actionstep[key] : undefined
  }
  private getPropertyAddress = async (
    cd_prefix: CDPrefix,
  ): Promise<MatterCreateDetailAddress | undefined> => {
    const addressLine1 = await this.getDataValue(`${cd_prefix}_address_line_1`)
    const addressLine2 = await this.getDataValue(`${cd_prefix}_address_line_2`)
    const suburb = await this.getDataValue(`${cd_prefix}_suburb`)
    const state = await this.getDataValue(`${cd_prefix}_state`)
    const postcode = await this.getDataValue(`${cd_prefix}_postcode`)
    if (!addressLine1 || !suburb || !state || !postcode) {
      this.logger.warn(`Incomplete address data for ${cd_prefix}`)
      return undefined
    }
    return {
      type: 'physical',
      line1: addressLine1,
      line2: addressLine2,
      suburb,
      state,
      postcode,
    }
  }

  async participant(
    sub_section: SDSubSection,
    cd_prefix: CDPrefix,
    isCompanyEntity: boolean = false,
  ): Promise<MatterCreateNewParticipant | undefined> {
    const isAgent = sub_section === 'agent' || sub_section === 'agent_contact'
    const isProperty = sub_section === 'property'

    const clientName = await this.name(cd_prefix)
    if (!clientName && !isProperty) {
      this.logger.warn(`No client name found for sub_section: ${sub_section}`)
      return undefined
    }

    const is_company =
      isCompanyEntity || (clientName ? isCompany(clientName) : false)
    const { firstname, middlename, lastname } = clientName
      ? extractName(clientName)
      : {}

    const xAddress: MatterCreateDetailAddress[] = []
    const xAddr = isProperty
      ? await this.getPropertyAddress(cd_prefix)
      : undefined
    if (xAddr) {
      xAddress.push(xAddr)
    }

    const propertyName =
      isProperty && xAddr ? createPropertyParticipantName(xAddr) : undefined
    const agencyName = isAgent ? await this.name('sellers_agency') : undefined

    const email = await this.email(cd_prefix)

    const phones: MatterCreateDetailPhone[] = []
    const phone = await this.phone(cd_prefix)
    if (phone) phones.push(phone)

    const j5key = this.getJ5KeyName(sub_section)
    if (!j5key) {
      throw new Error(`J5Config key for sub_section "${sub_section}" not found`)
    }

    const categoryId = await this.getCategoryId(j5key)
    const participant: MatterCreateNewParticipant = {
      type_id: categoryId,
      description: sub_section,
      details: {
        is_company,
        company_name: is_company
          ? isAgent
            ? agencyName
            : (propertyName ?? clientName)
          : agencyName,
        addresses: xAddress,
        phones_numbers: phones.length > 0 ? phones : undefined,
        email_address: email ? email[0] : undefined,
        first_name: !is_company || isAgent ? firstname : undefined,
        middle_name: !is_company || isAgent ? middlename : undefined,
        last_name: !is_company || isAgent ? lastname : undefined,
      },
    }
    return participant
  }

  async name(cd_prefix: CDPrefix): Promise<string | undefined> {
    return this.getDataValue(`${cd_prefix}_name`)
  }

  async contact(cd_prefix: CDPrefix): Promise<string | undefined> {
    return this.getDataValue(`${cd_prefix}_contact`)
  }

  async email(cd_prefix: CDPrefix): Promise<string[] | undefined> {
    const emailInput = await this.getDataValue(`${cd_prefix}_email`)
    return extractEmails(emailInput)
  }

  async phone(
    cd_prefix: CDPrefix,
  ): Promise<MatterCreateDetailPhone | undefined> {
    const phone = await this.getDataValue(`${cd_prefix}_phone`)
    if (!phone) return undefined
    const fmtPhone = formatPhoneNumberwithSpacing(phone)

    return {
      label: IsMobileNumber(phone) ? 'mobile' : 'phone',
      number: fmtPhone!,
    }
  }

  async prepare_collections(): Promise<Record<string, number>> {
    const prepare: Record<string, number> = {}

    const bill_id = await this.config_matter_collection_id('bill')
    if (bill_id) prepare.bill = bill_id

    const dates_id = await this.config_matter_collection_id('dates')
    if (dates_id) prepare.dates = dates_id

    const trans_id = await this.config_matter_collection_id('trans')
    if (trans_id) prepare.trans = trans_id

    const prop_id = await this.config_matter_collection_id('prop')
    if (prop_id) prepare.prop = prop_id

    const addr_id = await this.config_matter_collection_id('addr')
    if (addr_id) prepare.addr = addr_id

    const btrhq_id = await this.config_matter_collection_id('btrhq')
    if (btrhq_id) prepare.btrhq = btrhq_id

    return prepare
  }

  async create_collections(): Promise<MatterCreateCreateDataCollection[]> {
    const collections: MatterCreateCreateDataCollection[] = []
    const intent = this.intent()

    collections.push({
      description: 'Conveyancing Type',
      field_name: 'ConveyType',
      value: ConveyancingType[intent],
    })
    await this.logger.debug('create_collections()', { collections })
    return collections
  }

  async config_matter_collection_id(name: string): Promise<number | undefined> {
    const config = await this.j5config.get(
      J5Config.actionstep.matterCollectionIds,
      [name],
    )
    return config ? +config.value : undefined
  }

  async filenotes(): Promise<MatterCreateFileNote[]> {
    const filenotes: MatterCreateFileNote[] = []

    const additionalInfo = this.job.meta?.find(
      (m) => m.key === 'additionalInfo',
    )?.value
    if (additionalInfo) {
      filenotes.push({
        note: additionalInfo,
      })
    }
    return filenotes
  }

  async tasks(): Promise<MatterCreateTask[]> {
    return []
  }

  async files(): Promise<MatterCreateFile[]> {
    const files: MatterCreateFile[] = []
    return files
  }

  async steps(): Promise<MatterCreateStep> {
    return { ready: 0 }
  }

  public get issues(): Issues[] {
    return this.matterIssues
  }
}
