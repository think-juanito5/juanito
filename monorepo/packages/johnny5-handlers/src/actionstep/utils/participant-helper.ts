import {
  type Issues,
  J5Config,
  type MatterCreateNewParticipant,
  formatPhoneIntl,
} from '@dbc-tech/johnny5'
import type { Logger } from '@dbc-tech/logger'
import { serializeError } from 'serialize-error'

import type {
  ActionParticipantPost,
  ActionStepService,
  PagedParticipants,
  ParticipantDefaultTypesPost,
  ParticipantPut,
} from '@dbc-tech/actionstep'
import { btrDefaultCompanyNames, participantTypes } from '@dbc-tech/johnny5-btr'
import type { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import {
  buildSearch,
  getMapParticipants,
  getParticipantInfoForFilenote,
  getParticipantPhoneNumbers,
  getPaticipantAddresses,
  processRetrievedParticipants,
} from './participant-utils'

export class ParticipantHelper {
  private logger: Logger
  private actionstep: ActionStepService
  private matterIssues: Issues[] = []

  constructor(
    readonly as: ActionStepService,
    readonly xlogger: Logger,
    readonly j5config: Johnny5ConfigService,
  ) {
    this.logger = xlogger
    this.actionstep = as
  }

  public processNewParticipant = async (
    participant: MatterCreateNewParticipant,
  ): Promise<number> => {
    try {
      await this.logger.info(
        `processNewParticipant(+) Processing participant: ${JSON.stringify(participant)}`,
      )

      const participantId = await this.searchNewParticipant(participant)
      if (participantId) {
        await this.logger.info(
          `processNewParticipant(-) Participant already exists in Actionstep: ${participantId}`,
        )
        return participantId
      }

      const { physicalAddr, mailingAddr } = getPaticipantAddresses(
        participant.details.addresses ?? [],
      )

      const nullToEmpty = (val: string | null | undefined) => val ?? ''

      const [
        phone1Number,
        phone1Label,
        phone2Number,
        phone2Label,
        phone3Number,
        phone3Label,
        phone4Number,
        phone4Label,
      ] = getParticipantPhoneNumbers(participant.details.phones_numbers ?? [])

      const params: Partial<ParticipantPut> = {
        participants: {
          isCompany: participant.details.is_company ? 'T' : 'F',
          companyName: nullToEmpty(participant.details.company_name),
          salutation: nullToEmpty(participant.details.salutation),
          firstName: participant.details.first_name,
          middleName: nullToEmpty(participant.details.middle_name),
          lastName: participant.details.last_name,
          suffix: nullToEmpty(participant.details.suffix),
          preferredName: '',
          physicalAddressLine1: nullToEmpty(physicalAddr.line1),
          physicalAddressLine2: nullToEmpty(physicalAddr.line2),
          physicalCity: nullToEmpty(physicalAddr.suburb),
          physicalStateProvince: nullToEmpty(physicalAddr.state),
          physicalPostCode: nullToEmpty(physicalAddr.postcode),
          mailingAddressLine1: nullToEmpty(mailingAddr.line1),
          mailingAddressLine2: nullToEmpty(mailingAddr.line2),
          mailingCity: nullToEmpty(mailingAddr.suburb),
          mailingStateProvince: nullToEmpty(mailingAddr.state),
          mailingPostCode: nullToEmpty(mailingAddr.postcode),
          phone1Number: phone1Number,
          phone1Label: phone1Label,
          phone2Number: phone2Number,
          phone2Label: phone2Label,
          phone3Number: phone3Number,
          phone3Label: phone3Label,
          phone4Number: phone4Number,
          phone4Label: phone4Label,
          email: participant.details.email_address,
        },
      }

      await this.logger.debug(
        `processNewParticipant(*) Creating new participant: ${JSON.stringify(params)}`,
      )

      const newParticipantResponse = await this.actionstep.createParticipant(
        params as ParticipantPut,
      )
      await this.logger.info(
        `Created new participant: ${newParticipantResponse.participants.id}`,
      )

      if (!newParticipantResponse.participants.id) {
        throw new Error(
          'Failed to create Participant, no participant id returned!',
        )
      }

      // Update if company name is provided and is_company flag = false -- actionstep hack on employer name in the individual participant
      if (
        !participant.details.is_company &&
        params.participants?.companyName?.length &&
        participant.type_id === participantTypes.othersideSolicitor
      ) {
        const response = await this.actionstep.updateParticipant(
          newParticipantResponse.participants.id,
          {
            participants: {
              isCompany: 'T',
              companyName: params.participants?.companyName,
            },
          } as ParticipantPut,
        )
        await this.logger.info(
          `Updating Employer name (${params.participants?.companyName}) in participant Id: ${response.participants.id}`,
        )
      }
      return newParticipantResponse.participants.id
    } catch (error) {
      const errMsg = serializeError(error)
      await this.logger.error(
        `Failed to process participant ${participant.details.first_name} ${participant.details.last_name}`,
        { errMsg },
      )

      throw new Error('Failed to process participant!')
    }
  }

  private searchNewParticipant = async (
    participant: MatterCreateNewParticipant,
  ): Promise<number | undefined> => {
    const {
      details: { is_company, email_address, phones_numbers, company_name },
    } = participant
    if (!email_address && !phones_numbers && !is_company) {
      await this.logger.info(
        `processNewParticipant(-) No identifying info for individual — skipping search.`,
        participant,
      )
      return undefined
    }

    if (is_company && company_name) {
      const normalize = (str: string) => str.trim().toLowerCase()
      const isDefaultCompany = btrDefaultCompanyNames.some(
        (name) => normalize(name) === normalize(company_name),
      )
      if (isDefaultCompany) {
        await this.logger.info(
          `processNewParticipant(-) Company name matches the default - skipping search.`,
          JSON.stringify(participant),
        )
        const defaultBtrCompanyId = await this.j5config.get(
          J5Config.btr.actionstep.participantDefaultId,
        )
        if (!defaultBtrCompanyId) {
          throw new Error(
            `Default BTR participant ID not found for ${company_name}`,
          )
        }
        await this.logger.info(
          `processNewParticipant(-) Company name matches the default - using default participant ID: ${defaultBtrCompanyId.value}`,
          JSON.stringify(participant),
        )
        return +defaultBtrCompanyId.value
      }
    }

    try {
      const [searchParam] = buildSearch(participant)
      await this.logger.info(
        `searchNewParticipant(*) Searching for participant: ${JSON.stringify(searchParam)}`,
      )

      const { participantType: fnParticipantType, participantName } =
        getParticipantInfoForFilenote(participant, searchParam)

      const participantResponse =
        await this.actionstep.getParticipants(searchParam)

      const pagedRes = participantResponse as PagedParticipants
      if (pagedRes && pagedRes.participants.length > 0) {
        const mapParticipants = getMapParticipants(pagedRes)
        await this.logger.info(
          `searchNewParticipant(*) Found ${mapParticipants.length} participants`,
        )
        await this.logger.debug(
          `searchNewParticipant(*) debug mapParticipants: ,${JSON.stringify(mapParticipants)}`,
        )

        const searchResponse = processRetrievedParticipants(
          mapParticipants,
          participant,
        )

        await this.logger.info(
          `searchNewParticipant(*) Matched participants: ,${JSON.stringify(searchResponse)}`,
        )
        const { matchedParticipant = { id: 0 }, count = 0 } =
          searchResponse || {}

        //Post file note if multiple participants found
        if (matchedParticipant?.id && count > 1) {
          const multipleContactCardsMessage = `[${fnParticipantType}] Multiple contact cards were found for "${participantName}" please verify the contact card is correct and update if required.`
          await this.logger.info(
            `searchNewParticipant(*) ${multipleContactCardsMessage}`,
          )
          this.matterIssues.push({
            description: multipleContactCardsMessage,
          })
        }

        if (matchedParticipant && count > 0) {
          await this.logger.debug(
            `searchNewParticipant(*) Matched participant: ${JSON.stringify(
              matchedParticipant,
            )}`,
          )

          const existingContactCardMessage = `[${fnParticipantType}] Existing contact card found for “${participantName}” and linked to matter.`
          await this.logger.info(
            `searchNewParticipant(*) ${existingContactCardMessage}`,
          )
          this.matterIssues.push({
            description: existingContactCardMessage,
          })
          return matchedParticipant.id
        } else {
          await this.logger.debug(
            'searchNewParticipant(*) Matched participants is empty for this param: ',
            JSON.stringify(participant),
          )

          //sds filenotes
          const btrSdsFormFilenotesEnabled = await this.j5config.get(
            J5Config.btr.sellerDisclosure.clients.sdsFormFilenotesEnabled,
          )
          await this.logger.info(
            `searchNewParticipant(*) btrSdsFormFilenotesEnabled: ${btrSdsFormFilenotesEnabled?.value}`,
          )

          if (btrSdsFormFilenotesEnabled?.value === 'true') {
            const existingPhone =
              mapParticipants?.[0]?.phone1 || mapParticipants?.[0]?.phone2 || ''
            const existingEmail = mapParticipants?.[0]?.email || ''
            const newPhone =
              participant.details?.phones_numbers?.[0].number ||
              participant.details?.phones_numbers?.[1].number ||
              ''
            const newEmail = participant.details?.email_address || ''

            const existingContactCardMessage =
              this.buildExistingContactCardMessage(
                fnParticipantType,
                participantName,
                formatPhoneIntl(existingPhone),
                existingEmail,
                formatPhoneIntl(newPhone) ?? '',
                newEmail,
              )

            await this.logger.info(
              `searchNewParticipant(*) ${existingContactCardMessage}`,
            )
            this.matterIssues.push({
              description: existingContactCardMessage,
            })
          }
        }
      } else {
        await this.logger.info(
          'searchNewParticipant(*) Empty response, participant not found in Actionstep for this param: ',
          JSON.stringify(searchParam),
        )
        const noContactCardMessage = `[${fnParticipantType}] No contact card found for “${participantName}” so a new contact card has been created.`
        await this.logger.info(
          `searchNewParticipant(*) ${noContactCardMessage}`,
        )
        this.matterIssues.push({
          description: noContactCardMessage,
        })
      }
    } catch (error) {
      const errMsg = serializeError(error)
      await this.logger.error(
        `searchNewParticipant(-) Failed to process participant ${participant.details.first_name} ${participant.details.last_name}`,
        { errMsg },
      )
    }
    return undefined
  }

  private buildExistingContactCardMessage(
    fnParticipantType: string,
    participantName: string,
    existingPhone: string | undefined,
    existingEmail: string | undefined,
    newPhone: string,
    newEmail: string,
  ): string {
    const mismatchPart = `phone “${existingPhone || 'Empty'}“ and/or email “${existingEmail || 'Empty'}“ did not match the given phone “${newPhone}” and/or email “${newEmail}”`
    return `[${fnParticipantType}] Existing contact card found for “${participantName}” but ${mismatchPart}, so a new contact card has been created.`
  }

  public linkExistingParticipant = async (body: ActionParticipantPost) => {
    try {
      await this.logger.debug(
        `linkExistingParticipant(+) Linking participant: ${JSON.stringify(body)}`,
      )
      const res = await this.actionstep.linkActionParticipant(body)
      if (!res.actionparticipants.id) {
        throw new Error(
          `Failed to link Participant, no participant id returned!`,
        )
      }
    } catch (error) {
      const pcptInfo = `participantId: ${body.actionparticipants.links.participant} TypeId: ${body.actionparticipants.links.participantType}`
      const errMsg = serializeError(error)
      await this.logger.error(
        `linkExistingParticipant(-) #Ignore Error! (${pcptInfo}) Error: `,
        {
          errMsg,
        },
      )
    }
  }

  public forceToPropertyParticipant = async (
    body: ParticipantDefaultTypesPost,
    targetParticipantTypeId: string,
  ) => {
    try {
      await this.logger.info(
        `forceTopropertyParticipant(+) property participantDefaultType body: ${JSON.stringify(body)}`,
      )
      const id = body.participantdefaulttypes.links.participant
      if (!id) {
        throw new Error('Participant ID not found!')
      }
      await this.actionstep.deleteParticipantDefaultType(
        id,
        targetParticipantTypeId,
      )
      const res = await this.actionstep.createParticipantDefaultType(body)
      if (!res.participantdefaulttypes.id) {
        throw new Error(
          `Failed to link ParticipantDefaultType, no participant id returned!`,
        )
      }
    } catch (error) {
      const pcptInfo = `participantId: ${body.participantdefaulttypes.links.participant} TypeId: ${body.participantdefaulttypes.links.participantType}`
      const errMsg = serializeError(error)
      await this.logger.error(
        `forceTopropertyParticipant(-) #Ignore Error! (${pcptInfo}) Error: `,
        {
          errMsg,
        },
      )
    }
  }

  public get issues(): Issues[] {
    return this.matterIssues
  }

  public addMatterNotes(issue: Issues): void {
    this.matterIssues.push(issue)
  }
}
