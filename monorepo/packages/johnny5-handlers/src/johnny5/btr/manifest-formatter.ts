import type { ActionStepService, PagedParticipants } from '@dbc-tech/actionstep'
import { J5Config, getIntent } from '@dbc-tech/johnny5'
import {
  ContractDataLocation,
  ConveyancingType,
  EncumbrancesMessages,
  ParsedDataSource,
  PoolCertificateMessages,
  SmokeAlarmsInstalledMessages,
  asfieldToSkip,
  field,
} from '@dbc-tech/johnny5-btr'
import { getUnMatchedWaterAuthByCouncilId } from '@dbc-tech/johnny5-btr'
import {
  ContractDataModel,
  ContractDataValidationModel,
  type DbJob,
  MongoDbContractDataSource,
  MongoDbCorrectionDataSource,
} from '@dbc-tech/johnny5-mongodb'
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
  YesNoResponse,
} from '@dbc-tech/johnny5/typebox'
import {
  CoalescingDataSource,
  dateCalculator,
  formatDate,
  getLatestDate,
  getReverseIntent,
} from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'
import { type HydratedDocument } from 'mongoose'
import { serializeError } from 'serialize-error'
import {
  createPropertyParticipantName,
  extractName,
  isCompany,
} from '../../utils/data-utils'
import {
  type ParticipantSearchEntity,
  councilBuildSearch,
  ctsNameSearch,
  locateCouncilData,
} from '../btr/utils/search-utils'
import { RefdataContractDataService } from '../refdata-service'
import {
  type LayoutNameType,
  type OcrPropertyFields,
  createTitleRef,
  extractEmails,
  extractLotNumbers,
  extractPALayoutResponse,
  fmtSubsectionParticipant,
  getNaturePropAndSubConvType,
  getPersonOrCompanyName,
  getPlanNumbers,
  isOnlyPlanTypesOrPlanNumber,
  parsePlanType,
  sanitizeName,
} from './utils/string-utils'

const solicitorTypeMap: Record<string, CDPrefix> = {
  buy: 'buyers_solicitor',
  sell: 'sellers_solicitor',
}

type CDPrefix =
  | 'buyers'
  | 'sellers'
  | 'buyer_2'
  | 'seller_2'
  | 'buyers_solicitor'
  | 'sellers_solicitor'
  | 'property'
  | 'buyers_agent'
  | 'sellers_agent'
const maxLotCount = 4
export class ManifestFormatter {
  private readonly j5config: Johnny5ConfigService
  private readonly refdataContractData: RefdataContractDataService
  private readonly data: DataSource
  private readonly matterIssues: Issues[] = []

  constructor(
    private readonly job: HydratedDocument<DbJob>,
    private readonly actionstep: ActionStepService,
    private readonly logger: Logger,
  ) {
    this.j5config = new Johnny5ConfigService(job.tenant)
    this.refdataContractData = new RefdataContractDataService(job.tenant)
    this.data = new ParsedDataSource(
      new CoalescingDataSource(
        new MongoDbContractDataSource(
          job.tenant,
          job.id,
          job.serviceType,
          logger,
        ),
        new MongoDbCorrectionDataSource(
          job.tenant,
          job.id,
          job.serviceType,
          logger,
        ),
      ),
      logger,
    )
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

  async buyerName() {
    return this.getDataValue(field.buyerName)
  }

  async propertyPlanNumber() {
    return this.getDataValue(field.propertyPlanNumber)
  }

  async propertyPlanType() {
    return this.getDataValue(field.propertyPlanType)
  }

  async hasSecondBuyer() {
    const secondBuyer = await this.getDataValue(field.buyer2Name)
    return !!secondBuyer
  }

  async buyerName2() {
    return this.getDataValue(field.buyer2Name)
  }

  async getBuyerNamesForMatter() {
    if (await this.hasSecondBuyer()) {
      return `${await this.buyerName()} and ${await this.buyerName2()}`
    } else {
      return await this.buyerName()
    }
  }

  async sellerName() {
    return this.getDataValue(field.sellerName)
  }

  async hasSecondSeller() {
    const secondSeller = await this.getDataValue(field.seller2Name)
    return !!secondSeller
  }

  async seller2Name() {
    return this.getDataValue(field.seller2Name)
  }

  async sellerNamesForMatter() {
    if (await this.hasSecondSeller()) {
      return `${await this.sellerName()} and ${await this.seller2Name()}`
    } else {
      return await this.sellerName()
    }
  }

  async getCTSName(): Promise<string | undefined> {
    const refName = await this.getDataValue(field.propertySchemeName)
    if (!refName) return undefined

    const { searchParams, filterVal } = ctsNameSearch(refName) || {}
    if (!searchParams || !filterVal) return undefined

    for (const { name, value } of searchParams) {
      const query = { [name]: value }
      await this.logger.log(`getCTSName() name: ${name} value: ${value}`)
      const response = await this.actionstep.getParticipants(query)
      const pagedRes = response as PagedParticipants

      if (pagedRes) {
        if (pagedRes.participants.length > 0) {
          const searchResponse: ParticipantSearchEntity[] =
            pagedRes.participants.map((participant) => {
              return {
                id: participant.id,
                displayName: participant.displayName || undefined,
                companyName: participant.companyName || undefined,
                firstName: participant.firstName || undefined,
                lastName: participant.lastName || undefined,
              }
            })

          await this.logger.debug(
            `getCTSName() name: ${name} searchResponse: `,
            JSON.stringify(searchResponse),
          )

          const res = searchResponse.filter(
            (item) => item.displayName === filterVal,
          )
          //The correct CTS participant was not available please verify the details captured in the contract and add the correct participant participant role - “show the details here”
          if (res.length > 0) {
            return res[0].id.toString()
          }

          this.matterIssues.push({
            description: `The correct CTS participant was not available please verify the details captured in the contract and add the correct participant "${refName}".`,
            meta: ['name: cts', `value: ${refName}`, `filter: ${filterVal}`],
          })
          await this.logger.log(
            `getCTSName(): The name '${filterVal}' does not match any entries in the searchResponse!`,
            JSON.stringify(searchResponse),
          )
        }
      } else {
        await this.logger.log(`getCTSName() name: ${name} empty response!`)
      }
      this.matterIssues.push({
        description: `The correct CTS participant was not available please verify the details captured in the contract and add the correct participant "${refName}".`,
        meta: ['name: cts', `value: ${refName}`, `filter: ${filterVal}`],
      })
    }
    return undefined
  }

  async getWaterAuthAndCouncil(): Promise<
    MatterCreateExistingParticipant[] | undefined
  > {
    const councilIssues: Issues[] = []
    const refName = await this.getDataValue(field.propertyLocalGovernment)
    if (!refName) return undefined
    const { searchParams, filterVal } = councilBuildSearch(refName) || {}
    if (!searchParams || !filterVal) return undefined

    for (const { name, value } of searchParams) {
      const query = { [name]: value }
      await this.logger.log(`getCouncil() name: ${name} value: ${value}`)
      const response = await this.actionstep.getParticipants(query)
      const pagedRes = response as PagedParticipants
      if (pagedRes) {
        await this.logger.log(
          `getCouncil() #pagedRes: `,
          JSON.stringify(pagedRes.participants),
        )

        if (pagedRes.participants.length > 0) {
          const councilResponse: ParticipantSearchEntity[] =
            pagedRes.participants.map((participant) => {
              return {
                id: participant.id,
                displayName: participant.displayName || undefined,
                companyName: participant.companyName || undefined,
                firstName: participant.firstName || undefined,
                lastName: participant.lastName || undefined,
              }
            })
          const res = locateCouncilData(filterVal, councilResponse)

          if (res) {
            await this.logger.debug(
              `getCouncil.locateCouncilData() [${name}:${value}] final result:`,
              res,
            )

            const councilTypeId = await this.j5config.get(
              J5Config.actionstep.councilTypeId,
            )
            if (!councilTypeId) {
              throw new Error('Council Type Id not found in Johnny5 Config')
            }
            const waterAuthTypeId = await this.j5config.get(
              J5Config.actionstep.waterAuthTypeId,
            )
            if (!waterAuthTypeId) {
              throw new Error(
                'Water Authority Type Id not found in Johnny5 Config',
              )
            }

            const waterAuthId =
              getUnMatchedWaterAuthByCouncilId(res.id) || res.id
            const existingParticipants: MatterCreateExistingParticipant[] = [
              {
                id: res.id,
                type_id: +councilTypeId.value,
                description: 'local council',
              },
              {
                id: waterAuthId,
                type_id: +waterAuthTypeId.value,
                description: 'Water Authority',
              },
            ]
            await this.logger.debug(
              `getCouncil.locateCouncilData() [${name}:${value}] waterAuthId result:`,
              existingParticipants,
            )

            return existingParticipants
          } else {
            await this.logger.log(
              `getCouncil.locateCouncilData() [${name}:${value}] -- empty response!`,
            )
            councilIssues.push({
              description: `The correct contact card for Local Council - "${refName}" was not found please confirm and update the Council and Water Authority  participants as appropriate.`,
              meta: [
                'name: council',
                `value: ${refName}`,
                `filter: ${filterVal}`,
                'tag: locateCouncilData empty',
              ],
            })
          }
        }
      } else {
        await this.logger.log(
          `getCouncil() [${name}:${value}] -- empty response!`,
        )
      }

      councilIssues.push({
        description: `The correct contact card for Local Council - "${refName}" was not found please confirm and update the Council and Water Authority  participants as appropriate.`,
        meta: [
          'name: council',
          `value: ${refName}`,
          `filter: ${filterVal}`,
          'tag: AS empty',
        ],
      })
    }
    if (councilIssues.length > 0) {
      this.matterIssues.push(councilIssues[0])
    }
    return undefined
  }

  async existingParticipantsFromContract(): Promise<
    MatterCreateExistingParticipant[]
  > {
    const participants: MatterCreateExistingParticipant[] = []

    const waterCouncil = await this.getWaterAuthAndCouncil()
    if (waterCouncil) {
      participants.push(...waterCouncil)
    }
    return participants
  }

  async create_link_participants(
    newParticipants: MatterCreateNewParticipant[],
  ): Promise<MatterCreateLinkToParticipant[] | undefined> {
    const intent = this.intent()
    const clientPtcpTypeId = await this.j5config.get(
      J5Config.actionstep.clientTypeId,
    )
    const otherSidePtcpTypeId = await this.j5config.get(
      J5Config.actionstep.othersideTypeId,
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

    const reverseIntent = getReverseIntent(intent)
    const otherSidetypeIdKey = typeMap[reverseIntent]
    if (!otherSidetypeIdKey)
      return participantLinks.length > 0 ? participantLinks : undefined

    const reverseTargetTypeId = await this.j5config.get(otherSidetypeIdKey, [
      reverseIntent,
    ])

    if (otherSidePtcpTypeId && reverseTargetTypeId) {
      participantLinks.push({
        target_type_id: +otherSidePtcpTypeId.value,
        source_type_id: +reverseTargetTypeId.value,
      })
    }

    return participantLinks.length > 0 ? participantLinks : undefined
  }

  async buyer1_participant(): Promise<MatterCreateNewParticipant | undefined> {
    return this.participant('buyer_1', 'buyers')
  }

  async buyer2_participant(): Promise<MatterCreateNewParticipant | undefined> {
    return this.participant('buyer_2', 'buyer_2')
  }

  async seller1_participant(): Promise<MatterCreateNewParticipant | undefined> {
    return this.participant('seller_1', 'sellers')
  }

  async seller2_participant(): Promise<MatterCreateNewParticipant | undefined> {
    return this.participant('seller_2', 'seller_2')
  }

  async otherside_solicitor_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    const isCompany = true
    const reverseIntent = getReverseIntent(this.intent())
    const sub_section = solicitorTypeMap[reverseIntent]

    if (!sub_section) return undefined
    return this.participant(sub_section, sub_section, isCompany)
  }

  async otherside_solicitor_primary_contact_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    const isCompany = false
    const reverseIntent = getReverseIntent(this.intent())
    const sub_section = solicitorTypeMap[reverseIntent]

    if (!sub_section) return undefined
    return this.participant(sub_section, sub_section, isCompany)
  }

  async property_address_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    return this.participant('property', 'property', true) // isCompanyEntity = true if the sub_section is property
  }

  async seller_agent_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    return this.participant('sellers_agent', 'sellers_agent')
  }

  async buyer_agent_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    return this.participant('buyers_agent', 'buyers_agent')
  }

  async deposit_holder_participant(): Promise<
    MatterCreateNewParticipant | undefined
  > {
    const isCompanyEntity = true
    return this.basicParticipant('deposit_holder', isCompanyEntity)
  }

  async basicParticipant(
    sub_section: string,
    isCompanyEntity: boolean,
  ): Promise<MatterCreateNewParticipant | undefined> {
    const depositHolder = await this.getDataValue(field.depositHolder)
    if (!depositHolder) {
      return undefined
    }

    const sanitizeData = (input: string): string =>
      input
        .replace(/^\|+|\|+$/g, '')
        .trim()
        .replace(/^./, (char) => char.toUpperCase())

    const depositor = sanitizeData(depositHolder)
    if (!depositor) {
      return undefined
    }
    const is_company = isCompanyEntity ? isCompanyEntity : isCompany(depositor)
    const { firstname, middlename, lastname } = extractName(depositor)
    if (!is_company && !firstname && !lastname) {
      return undefined
    }

    const categoryId = await this.getCategoryId(
      sub_section,
      J5Config.actionstep.depositHolderTypeId,
    )

    const participant: MatterCreateNewParticipant = {
      type_id: categoryId,
      description: sub_section,
      details: {
        is_company,
        company_name: is_company ? depositor : undefined,
        addresses: undefined,
        phones_numbers: undefined,
        email_address: undefined,
        first_name: is_company ? undefined : firstname,
        middle_name: is_company ? undefined : middlename,
        last_name: is_company ? undefined : lastname,
      },
    }

    return participant
  }

  async getCategoryId(sub_section: string, indexKey: string) {
    const intent = this.intent()
    const categoryId = await this.j5config.get(indexKey, [intent])
    if (!categoryId) {
      throw new Error(
        `Property Type (${sub_section}_type_id)[${intent}] not found in Johnny5 Config`,
      )
    }
    await this.logger.log(
      `getCategoryId() [${sub_section}] categoryId: ${categoryId}`,
    )
    return +categoryId.value
  }

  async participant(
    sub_section: string,
    cd_prefix: CDPrefix,
    isCompanyEntity?: boolean,
  ): Promise<MatterCreateNewParticipant | undefined> {
    const intent = this.intent()
    const refdata = await this.refdataContractData.findOneBySubSection(
      ContractDataLocation.Participant,
      sub_section,
      [intent],
    )
    if (!refdata)
      throw new Error(
        `Refdata not found sub_section: ${sub_section} tags: ${intent}`,
      )

    const bsSolicitor = ['buyers_solicitor', 'sellers_solicitor'].includes(
      sub_section,
    )
    const address = await this.participantAddress(cd_prefix)
    const propertyName =
      sub_section === 'property'
        ? createPropertyParticipantName(address)
        : undefined

    const name = propertyName || (await this.name(cd_prefix))
    const contact = bsSolicitor ? await this.contact(cd_prefix) : undefined

    if (!name && !contact) {
      return undefined
    }

    if (bsSolicitor) {
      if ((isCompanyEntity && !name) || (!isCompanyEntity && !contact)) {
        return undefined
      }
    }

    let is_company = isCompanyEntity || (name ? isCompany(name) : false)
    let { firstname, middlename, lastname } = name ? extractName(name) : {}
    let employerName: string | undefined
    let email: string | undefined
    let categoryId = +refdata.category
    const emailAddresses =
      sub_section !== 'property' ? await this.email(cd_prefix) : undefined
    const emailExtractedCount = emailAddresses?.length || 0
    email = emailExtractedCount > 0 ? emailAddresses?.[0] : undefined

    if (bsSolicitor) {
      const categoryKey = isCompanyEntity
        ? J5Config.actionstep.othersideSolicitorTypeId
        : J5Config.actionstep.othersideSolicitorContactTypeId
      categoryId = await this.getCategoryId(sub_section, categoryKey)

      if (contact) {
        if (isCompanyEntity) {
          email = undefined
        } else {
          ;({ firstname, middlename, lastname } = extractName(contact))
          is_company = false
          employerName = name
        }
      }
    }

    if (sub_section !== 'property') {
      const sub_section2 =
        sub_section === 'buyers_solicitor' && isCompanyEntity === false
          ? 'buyer_solicitor_contact'
          : sub_section
      const fnParticipant = fmtSubsectionParticipant(sub_section2)
      const participantName = getPersonOrCompanyName({
        is_company,
        company_name: name,
        firstname,
        middlename,
        lastname,
      })

      if (emailExtractedCount > 1) {
        this.matterIssues.push({
          description: `${fnParticipant} - "${participantName}" has multiple emails ${emailAddresses?.map((m) => `"${m}"`).join(',')} please verify the correct email is on the contact card.`,
          meta: [`name: ${sub_section}`, `emailCount: ${emailExtractedCount}`],
        })
      } else if (emailExtractedCount === 0) {
        this.matterIssues.push({
          description: `${fnParticipant} - "${participantName}" has no email address please verify the contact card is correct and update if required.`,
          meta: [`name: ${sub_section}`, `emailCount: 0`],
        })
      }
    }

    const phones: MatterCreateDetailPhone[] = []
    const phone =
      sub_section !== 'property' ? await this.phone(cd_prefix) : undefined
    if (phone) phones.push(phone)
    const mobile =
      sub_section !== 'property' ? await this.mobile(cd_prefix) : undefined
    if (mobile) phones.push(mobile)

    if (sub_section === 'property') {
      categoryId = await this.getCategoryId(
        sub_section,
        J5Config.actionstep.propertyTypeId,
      )
    }

    const participant: MatterCreateNewParticipant = {
      type_id: categoryId,
      description: sub_section,
      details: {
        is_company,
        company_name: is_company
          ? name || employerName
          : employerName || undefined,
        addresses: address ? [address] : undefined,
        phones_numbers: phones.length > 0 ? phones : undefined,
        email_address: email,
        first_name: is_company ? undefined : firstname,
        middle_name: is_company ? undefined : middlename,
        last_name: is_company ? undefined : lastname,
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

  async deposit(cd_prefix: CDPrefix): Promise<string | undefined> {
    return this.getDataValue(`${cd_prefix}`)
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

    return {
      label: 'phone',
      number: phone,
    }
  }

  async mobile(
    cd_prefix: CDPrefix,
  ): Promise<MatterCreateDetailPhone | undefined> {
    const mobile = await this.getDataValue(`${cd_prefix}_mobile`)
    if (!mobile) return undefined

    return {
      label: 'mobile',
      number: mobile,
    }
  }

  async participantAddress(
    cd_prefix: CDPrefix,
  ): Promise<MatterCreateDetailAddress | undefined> {
    const line1 = await this.getDataValue(`${cd_prefix}_address_line_1`)
    const line2 = await this.getDataValue(`${cd_prefix}_address_line_2`)
    const suburb = await this.getDataValue(`${cd_prefix}_suburb`)
    const state = await this.getDataValue(`${cd_prefix}_state`)
    const postcode = await this.getDataValue(`${cd_prefix}_postcode`)
    if (!line1 && !line2 && !suburb && !state && !postcode) return undefined

    return {
      type: 'physical',
      line1,
      line2,
      suburb,
      state,
      postcode,
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

  private async getUnconDate(): Promise<string | undefined> {
    return getLatestDate([
      await this.getDataValue(field.dateFinance),
      await this.getDataValue(field.dateBuildingPestInspection),
      await this.getCoolOffDate(),
    ])
  }

  private async getCoolOffDate(): Promise<string | undefined> {
    const contractDateValue = await this.getDataValue(field.dateOfContract)
    if (!contractDateValue) return undefined

    const cal = dateCalculator('QLD')
    const contractDate = new Date(contractDateValue)
    const effectiveContractDate = cal.getNextWorkingDay(contractDate)
    const offsetDate = cal.offsetWorkingDays(effectiveContractDate, 4)
    const nextWorkingDay = cal.getNextWorkingDay(offsetDate)
    return formatDate(nextWorkingDay)
  }

  private async getSettlementDate(): Promise<string | undefined> {
    return this.getDataValue(field.dateOfSettlement)
  }

  private async getInitialDepositDueDate(): Promise<string | undefined> {
    const initDepositDue = await this.getDataValue(field.depositInitialDue)
    return initDepositDue ?? (await this.getDataValue(field.dateOfContract))
  }

  private async getDepositAmount(): Promise<string> {
    const toSafeNumber = (value: unknown): number => {
      const num = Number(value ?? 0)
      return isNaN(num) ? 0 : num // Handle NaN case
    }

    const initDeposit = await this.getDataValue(field.depositInitial)
    const depBalance = await this.getDataValue(field.depositBalance)

    await this.logger.log(
      `getDepositAmount() initial Deposit: ${initDeposit}, deposit Balance: ${depBalance}`,
    )

    const initialDeposit = toSafeNumber(initDeposit)
    const depositBalance = toSafeNumber(depBalance)

    return (initialDeposit + depositBalance).toString()
  }

  private async natPropertySubConvType(
    layoutName: LayoutNameType,
    numberOfLots: number,
  ): Promise<MatterCreateCreateDataCollection[] | undefined> {
    const collections: MatterCreateCreateDataCollection[] = []
    const intent = this.intent()
    const isVacantLand =
      (await this.getDataValue(field.propertyPresentUseVacantLand)) === 'Yes'
        ? true
        : false
    const isBuiltOn =
      (await this.getDataValue(field.propertyPresentUseBuiltOn)) === 'Yes'
        ? true
        : false
    const propertyAddress = await this.getDataValue(field.propertyAddressLine1)

    const ocrProperty: OcrPropertyFields = {
      propertyAddress,
      isVacantLand,
      isBuiltOn,
      numberOfLots,
    }

    const natureSubConvType = getNaturePropAndSubConvType(
      layoutName,
      intent,
      ocrProperty,
    )

    await this.logger.debug(
      `natPropertySubConvType() ocrProperty: ${JSON.stringify(ocrProperty)} layoutName: ${layoutName} natureSubConvType: `,
      natureSubConvType,
    )

    if (!natureSubConvType) return undefined

    collections.push({
      description: 'Nature of Property',
      field_name: 'propnat',
      value: natureSubConvType.natureOfProperty,
    })

    collections.push({
      description: 'Conveyancing Sub Type',
      field_name: 'ConveySubType',
      value: natureSubConvType.conveyancingSubtype,
    })

    if (natureSubConvType.filenotes) {
      this.matterIssues.push({
        description: natureSubConvType.filenotes,
        meta: ['name: propnat__ConveySubType', `captured: ${layoutName}`],
      })
    }

    const isNaturePropertyVacantLand =
      natureSubConvType?.natureOfProperty === 'Vacant Land'

    if (isNaturePropertyVacantLand) {
      collections.push({
        description: 'Safe Switch Inform',
        field_name: 'safe_switch_inform',
        value: 'NA',
      })

      collections.push({
        description: 'Smoke Alarm Inform',
        field_name: 'smoke_alarm_inform',
        value: 'NA',
      })

      collections.push({
        description: 'Safety Switch',
        field_name: 'safetyswitch',
        value: 'NA - Vacant Land',
      })

      collections.push({
        description: 'Have smoke alarms been installed',
        field_name: 'smokealarm',
        value: 'NA',
      })

      collections.push({
        description: 'Are Smoke Alarms Installed',
        field_name: 'smokealarmsinstalled',
        value: 'NA – Vacant Land | Commercial',
      })

      collections.push({
        description:
          'Has the property been the subject of a Residential Tenancy Agreement?',
        field_name: 'tenancy_within_12months',
        value: 'No',
      })
    } else {
      const hasYesEntry = (entry: string | undefined): YesNoResponse =>
        entry?.includes('Yes') ? 'Yes' : 'No'
      const safetySwitchEntry = await this.getDataValue(field.safetySwitchYes)
      if (safetySwitchEntry) {
        collections.push({
          description: 'Safe Switch Inform',
          field_name: 'safe_switch_inform',
          value: hasYesEntry(safetySwitchEntry),
        })
      }

      const smokeAlarmInform = await this.getDataValue(field.smokeAlarmsYes)
      if (smokeAlarmInform) {
        collections.push({
          description: 'Smoke Alarm Inform',
          field_name: 'smoke_alarm_inform',
          value: hasYesEntry(smokeAlarmInform),
        })
      }
    }
    return collections
  }

  private async getSmokeAlarmsInstalled(): Promise<string | undefined> {
    const smokeAlarmsInstalled = await this.getDataValue(field.smokeAlarmsYes)
    if (!smokeAlarmsInstalled) return undefined

    const isSmokeAlarm = smokeAlarmsInstalled.toLowerCase().includes('yes')
      ? 'Yes'
      : 'No'
    return SmokeAlarmsInstalledMessages[isSmokeAlarm] || undefined
  }

  private async getPoolSafetyCertificate(): Promise<string | undefined> {
    const poolExistanceYes = (await this.getDataValue(field.poolExistanceYes))
      ?.trim()
      .toLowerCase()

    if (!poolExistanceYes || poolExistanceYes !== 't') {
      return PoolCertificateMessages.noPool
    }

    const poolSafetyCertificate = (
      await this.getDataValue(field.poolCertificateYes)
    )
      ?.trim()
      .toLowerCase()

    if (!poolSafetyCertificate || poolSafetyCertificate === 'f') {
      return PoolCertificateMessages.noPSC
    } else if (poolSafetyCertificate === 't') {
      return PoolCertificateMessages.currentPSC
    }

    return PoolCertificateMessages.noPool
  }

  async getEncumbrances(): Promise<string | undefined> {
    const encumbrancesYesNo = (
      await this.getDataValue(field.propertyMattersEncumbrancesYes)
    )?.toLowerCase()
    const encumbrancesText = await this.getDataValue(
      field.propertyMattersEncumbrances,
    )
    if (!encumbrancesYesNo) return undefined

    if (encumbrancesYesNo.includes('yes')) {
      return encumbrancesText && encumbrancesText.length > 1
        ? EncumbrancesMessages.YesNotedSameAsContract
        : EncumbrancesMessages.YesNotedListedOnContract
    }
    return EncumbrancesMessages.No
  }

  async getKeyMappings(): Promise<
    MatterCreateCreateDataCollection[] | undefined
  > {
    const keyMappings = [
      {
        get: this.getUnconDate,
        description: 'Unconditional Date',
        fieldName: 'uncondate',
      },
      {
        get: this.getCoolOffDate,
        description: 'Cool Off Date',
        fieldName: 'cooloffdate',
      },
      {
        get: this.getSettlementDate,
        description: 'Adjustment Date',
        fieldName: 'adjustdate',
      },
      {
        get: this.getSettlementDate,
        description: 'Stamping Lodge Date',
        fieldName: 'stamping_lodgedate',
      },
      {
        get: this.getSettlementDate,
        description: 'Fees Lodge Date',
        fieldName: 'lodge_date',
      },
      {
        get: this.getInitialDepositDueDate,
        description: 'Initial Deposit Due Date',
        fieldName: 'inidepdate',
      },
      {
        get: this.getDepositAmount,
        description: 'Deposit Amount',
        fieldName: 'depamount',
      },
      {
        get: this.getSmokeAlarmsInstalled,
        description: 'Is Smoke Alarms Installed',
        fieldName: 'smokealarmsinstalled',
      },
      {
        get: this.getPoolSafetyCertificate,
        description: 'Pool Safety Certificate',
        fieldName: 'pool_safety',
      },
      {
        get: this.getEncumbrances,
        description: 'Are there Encumbrances on title',
        fieldName: 'no_encum',
      },
    ]

    const keyCollections: MatterCreateCreateDataCollection[] = []
    for (const { get, description, fieldName } of keyMappings) {
      const cdValue = await get.call(this)
      await this.logger.log(
        `getKeyMappings() [${description}] field_name: ${fieldName} value: ${cdValue}`,
      )

      if (cdValue) {
        keyCollections.push({
          description,
          field_name: fieldName,
          value: cdValue,
        })
      }
    }
    return keyCollections.length > 0 ? keyCollections : undefined
  }

  async getPropertyLotNumbers(): Promise<
    MatterCreateCreateDataCollection[] | undefined
  > {
    const lotNocollections: MatterCreateCreateDataCollection[] = []
    const lotNumber = await this.getDataValue(field.propertyLotNumber)
    const lotNos = extractLotNumbers(lotNumber)
    if (lotNos.length == 0) return undefined

    await this.logger.debug(`getPropertyLotNumbers() extractedLotNos: `, {
      extractedLotNos: lotNos,
    })

    const maxLotNumber =
      lotNos.length > maxLotCount ? maxLotCount : lotNos.length

    for (let i = 0; i < maxLotNumber; i++) {
      const typedKeyName = i == 0 ? 'lotno' : 'lotno' + (i + 1)
      lotNocollections.push({
        description: typedKeyName,
        field_name: typedKeyName,
        value: lotNos[i].toString(),
      })
    }

    if (lotNocollections.length > 1) {
      this.matterIssues.push({
        description: `The property contains multiple lots please review the lot numbers added to the matter. Please see the data extracted from the contract "${lotNumber}".`,
        meta: ['name: lotno', `captured: ${lotNumber}`],
      })
    }

    await this.logger.log(
      `getPropertyLotNumbers() numberoflots: ${lotNocollections.length}`,
    )

    lotNocollections.push({
      description: 'Property Number of Lots',
      field_name: 'numberoflots',
      value: `${lotNocollections.length}`,
    })

    await this.logger.debug(
      `getPropertyLotNumbers() lotNocollections: `,
      lotNocollections,
    )

    return lotNocollections
  }

  async getYesNoFromContractData(): Promise<
    MatterCreateCreateDataCollection[] | undefined
  > {
    const otherCollections: MatterCreateCreateDataCollection[] = []
    type YesNoResponse = 'Yes' | 'No'

    const hasEntry = (entry: string | undefined): YesNoResponse =>
      entry?.length ? 'Yes' : 'No'

    const fixturesEntry = await this.getDataValue(field.excludedFixtures)

    otherCollections.push({
      description: 'Excluded Fixture applicable',
      field_name: 'excfix_applicable',
      value: hasEntry(fixturesEntry),
    })

    const chattelsEntry = await this.getDataValue(field.includedChattels)

    otherCollections.push({
      description: 'Included chattel applicable',
      field_name: 'incchat_applicable',
      value: hasEntry(chattelsEntry),
    })

    const tenantName = await this.getDataValue(field.leaseTenantsName)
    const tenantsEntry = sanitizeName(tenantName)

    otherCollections.push({
      description: 'Tenants Apply',
      field_name: 'tenants_apply',
      value: hasEntry(tenantsEntry),
    })
    return otherCollections
  }

  async getContractLayoutName(): Promise<LayoutNameType | undefined> {
    try {
      const cdm = await ContractDataModel.findOne({
        tenant: this.job.tenant,
        jobId: this.job.id,
      })
        .select('layoutName')
        .exec()
      if (!cdm)
        throw new Error(
          `getContractLayoutName: Contract Data not found for Job Id:${this.job.id}`,
        )
      return cdm.layoutName as LayoutNameType
    } catch (error) {
      const errorMsg = serializeError(error)
      await this.logger.error('getContractLayoutName: #error ', { errorMsg })
      return undefined
    }
  }

  async getPropertyCTS(
    layoutName: LayoutNameType,
  ): Promise<MatterCreateCreateDataCollection[] | undefined> {
    const reiqAdlCollections: MatterCreateCreateDataCollection[] = []
    const layoutSettings = extractPALayoutResponse(layoutName)

    await this.logger.debug(
      `getPropertyCTS() layoutName: ${layoutName} layoutSettings: ${JSON.stringify(layoutSettings)}`,
    )

    if (layoutSettings) {
      reiqAdlCollections.push({
        description: 'Property located CTS',
        field_name: 'Property_located_CTS',
        value: layoutSettings.communityTitles ? 'Yes' : 'No',
      })

      if (layoutSettings?.type) {
        reiqAdlCollections.push({
          description: 'REIQ or ADL',
          field_name: 'reiq_adl',
          value: layoutSettings.type,
        })

        const conveyYesNo: YesNoResponse = 'Yes' //default to Yes - always CTS for now
        reiqAdlCollections.push({
          description: 'e_convey REIQ ADL',
          field_name: 'e_convey',
          value: conveyYesNo,
        })
      }
    }
    return reiqAdlCollections
  }

  async create_collections(): Promise<MatterCreateCreateDataCollection[]> {
    const collections: MatterCreateCreateDataCollection[] = []
    const intent = this.intent()

    const isValueInSkipField = (
      asfield: Record<string, string>,
      val: string,
    ): boolean => {
      for (const key in asfield) if (asfield[key] === val) return true
      return false
    }

    const refdata = await this.refdataContractData.findAllByLocation(
      'datafield',
      [intent],
    )

    for (const r of refdata) {
      if (isValueInSkipField(asfieldToSkip, r.field_name)) {
        continue
      }
      const cd = await this.getDataValue(r.name)
      if (!cd) continue

      collections.push({
        description: r.friendly_name,
        field_name: r.field_name,
        value: cd,
      })
    }

    const trustAcctName = await this.j5config.get(
      J5Config.actionstep.trustAccountName,
    )
    if (!trustAcctName) {
      throw new Error('Trust Account Name not found in Johnny5 Config')
    }

    collections.push({
      description: 'Trust Account Name',
      field_name: 'trust_account_nam',
      value: trustAcctName.value,
    })

    const settlementAgentFee = await this.j5config.get(
      J5Config.btr.settlementAgentFee,
    )
    if (!settlementAgentFee) {
      throw new Error('Settlement Agent Fee not found in Johnny5 Config')
    }

    collections.push({
      description: 'Settlement Agent Fee',
      field_name: 'AgentFee',
      value: settlementAgentFee.value,
    })

    collections.push({
      description: 'Conveyancing Type',
      field_name: 'ConveyType',
      value: ConveyancingType[intent],
    })

    const professionalFees = this.job.meta?.find(
      (m) => m.key === 'professionalFees',
    )?.value
    if (professionalFees) {
      collections.push({
        description: 'Professional Fees',
        field_name: 'fees',
        value: professionalFees,
      })
    }

    collections.push({
      description: 'retainer',
      field_name: 'retainer',
      value: intent === 'buy' ? '800.00' : '200.00',
    })

    const ctsNameId = await this.getCTSName()
    if (ctsNameId) {
      collections.push({
        description: 'CTS Name',
        field_name: 'ctsnam',
        value: ctsNameId,
      })
    }

    const keyMappings = await this.getKeyMappings()
    if (keyMappings) collections.push(...keyMappings)

    const lotNumbers = await this.getPropertyLotNumbers()
    const lotNumbersCount = (lotNumbers?.length || 1) - 1

    if (lotNumbers) collections.push(...lotNumbers)

    const planNumber = await this.propertyPlanNumber()
    const planType = await this.propertyPlanType()

    if (planNumber && planType) {
      const xPlanType = parsePlanType(planType)
      if (xPlanType) {
        collections.push({
          description: 'plantype',
          field_name: 'plantype',
          value: xPlanType,
        })
      }
      const planNumbersDataOnly = getPlanNumbers(planNumber)
      if (isOnlyPlanTypesOrPlanNumber(planNumbersDataOnly, 'planType')) {
        const maxItems = Math.min(planNumbersDataOnly.length, maxLotCount)
        for (let i = 0; i < maxItems; i++) {
          const planNoField = i == 0 ? 'planno' : 'planno' + (i + 1)
          collections.push({
            description: planNoField,
            field_name: planNoField,
            value: planNumbersDataOnly[i].planNumber!,
          })
        }
      }

      const planTypeDataOnly = getPlanNumbers(planType)
      if (isOnlyPlanTypesOrPlanNumber(planTypeDataOnly, 'planNumber')) {
        const maxItems = Math.min(planTypeDataOnly.length, maxLotCount)
        for (let i = 0; i < maxItems; i++) {
          const planTypeField = i == 0 ? 'plantype' : 'plantype' + (i + 1)
          collections.push({
            description: planTypeField,
            field_name: planTypeField,
            value: planTypeDataOnly[i].planType!,
          })
        }
      }
    } else if (planNumber) {
      const planNumbers = getPlanNumbers(planNumber)
      const maxItems = Math.min(planNumbers.length, maxLotCount)
      for (let i = 0; i < maxItems; i++) {
        const planTypeField = i == 0 ? 'plantype' : 'plantype' + (i + 1)
        collections.push({
          description: planTypeField,
          field_name: planTypeField,
          value: planNumbers[i].planType!,
        })

        const planNoField = i == 0 ? 'planno' : 'planno' + (i + 1)
        collections.push({
          description: planNoField,
          field_name: planNoField,
          value: planNumbers[i].planNumber!,
        })
      }
    }

    const titleReference = await this.getDataValue(field.propertyTitleReference)
    if (titleReference) {
      const tRefs = createTitleRef(lotNumbersCount, titleReference)
      const maxItems = Math.min(tRefs.length, maxLotCount)
      for (let i = 0; i < maxItems; i++) {
        const trefField = i === 0 ? 'titleref' : `titleref${i + 1}`
        collections.push({
          description: trefField,
          field_name: trefField,
          value: tRefs[i],
        })
      }
    }

    const yesNoDataFields = await this.getYesNoFromContractData()
    if (yesNoDataFields) collections.push(...yesNoDataFields)

    const layoutName = await this.getContractLayoutName()
    if (layoutName) {
      const layout = await this.getPropertyCTS(layoutName)
      if (layout) collections.push(...layout)

      const natPropertySubConvType = await this.natPropertySubConvType(
        layoutName,
        lotNumbersCount,
      )
      if (natPropertySubConvType) collections.push(...natPropertySubConvType)
    }

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

    const validation = await ContractDataValidationModel.findOne({
      jobId: this.job.id,
    })
    if (!validation)
      throw new Error(
        `Contract Data Validation not found for Job Id:${this.job.id}`,
      )

    if (validation.note) {
      filenotes.push({
        note: validation.note,
      })
    }

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

    const contractBlob = this.job.blobs?.find((b) => b.type === 'contract')
    if (!contractBlob)
      throw new Error(
        `No linked Contract file found for file Id:${this.job.id} `,
      )

    const contractDocumentBlobName = contractBlob.name
    const filename = contractDocumentBlobName.substring(
      contractDocumentBlobName.lastIndexOf('/') + 1,
    )

    files.push({
      filename,
      url: contractDocumentBlobName,
    })

    return files
  }

  async steps(): Promise<MatterCreateStep> {
    return { ready: 0 }
  }

  public get issues(): Issues[] {
    return this.matterIssues
  }
}
