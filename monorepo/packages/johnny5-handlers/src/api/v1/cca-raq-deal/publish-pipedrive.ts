import { datalakeQuery, getOfficeHourCategory } from '@dbc-tech/datalake'
import { formatPhoneIntl, jobCloudEventSchema } from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5'
import { setJsonContentHeader } from '@dbc-tech/johnny5'
import { dapr } from '@dbc-tech/johnny5'
import {
  CcaRaqModel,
  DealCreateModel,
  FileModel,
  QuoteModel,
} from '@dbc-tech/johnny5-mongodb'
import {
  type Person,
  type PersonResponseItem,
  type V2CreatePersonResponse,
  type V2DealCreate,
  type V2DealCustom,
  type V2DealCustomField,
  type V2PersonCreate,
  customFields,
  offerCodeData,
  racvCustomData,
} from '@dbc-tech/pipedrive'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { dbTimestampMelbourne } from '../../../utils/date-utils'
import { type LeadTag, applyRules } from '../../../utils/lead-tagging-utils'
import { datalakeDb } from '../../plugins/db.datalake.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const publish_pipedrive = new Elysia()
  .use(jobContext({ name: 'cca-raq-deal.publish-pipedrive' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .use(datalakeDb)
  .post(
    '/publish-pipedrive',
    async ({ body, ctx, datalakeDb }) => {
      const { logger, status } = ctx
      const { data } = body
      const { fileId, jobId } = data

      await logger.info(
        `Starting to publish raq to pipedrive for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const clientDL = await datalakeDb.connect()
      const dlQuery = datalakeQuery(clientDL)

      try {
        await logger.debug(
          `Get related CcaRaq and DealCreate for File Id:${fileId}, Job Id:${jobId}`,
        )
        const raqData = await CcaRaqModel.findOne({ jobId: jobId })
        if (!raqData) {
          throw new Error(
            `CcaRaq not found for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        const dealData = await DealCreateModel.findOne({ jobId: jobId })
        if (!dealData) {
          throw new Error(
            `DealCreate not found for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        const dataId = dealData.datainputId
        const leadId = dealData.leadId
        await logger.debug(
          `Updating DataInput status to start publishing for File Id:${fileId}, Job Id:${jobId}`,
        )
        const updateDataInputStart = {
          status: 'I', // started publishing
          startedPublishing: dbTimestampMelbourne(),
          updated: dbTimestampMelbourne(),
        }
        await dlQuery.dataInput.update(dataId!, updateDataInputStart)

        await DealCreateModel.updateOne({ jobId: jobId }, { status: 'deal' })

        // get data
        const leadRes = await dlQuery.leads.getByID(leadId!)
        const leadData = leadRes[0]
        const {
          fullName,
          email,
          phone,
          stateId,
          userId,
          acceptTerms,
          utmId,
          utmSource,
          utmMedium,
          utmCampaign,
          channel,
          referralPage,
          sendEmail,
          statusId,
          statusReasonId,
          transactionServiceId,
          offerCode,
          otoProduct,
          preferredContactTime,
          agentName,
          referralId,
          leadSourceCat,
        } = leadData

        const transactionService = await dlQuery.transactionService.findById(
          transactionServiceId!,
        )

        // check if duplicate correction
        if (statusId === 2 && statusReasonId === 3 && !transactionService[0]) {
          await logger.info(
            `Deal created for TransactionService Id:${transactionService[0]}, File Id:${fileId}, Job Id:${jobId}`,
          )
        } else {
          const { campaignTrigger, leadJourney, notes } = transactionService[0]
          const phoneFormatted = formatPhoneIntl(phone!)

          let userPdToken = ''
          if (raqData.sub === 'Webform') {
            await logger.debug(
              `Webform:${raqData.sub} detected for File Id:${fileId}, Job Id:${jobId}`,
            )
            if (utmId) {
              const pdUserToken =
                await dlQuery.pipedriveUserList.getPipedriveToken(utmId)

              await logger.debug(
                `pdUserToken result for File Id:${fileId}, Job Id:${jobId}`,
                pdUserToken,
              )

              if (pdUserToken && pdUserToken[0]) {
                userPdToken = pdUserToken[0].token!
              }
            }
          }

          await logger.debug(
            `User Pipedrive Token for File Id:${fileId}, Job Id:${jobId}`,
            userPdToken,
          )

          const pdServiceV1 = userPdToken
            ? ctx.pipedriveV1(userPdToken)
            : ctx.pipedriveV1()

          const pdServiceV2 = userPdToken
            ? ctx.pipedriveV2(userPdToken)
            : ctx.pipedriveV2()

          const keyCF: { [key: string]: string } = customFields

          const userIdentity = await dlQuery.userIdentity.findByUserId(userId!)
          let userIdentityId: number = 0
          let personId: number = 0

          let enableMarketing = acceptTerms ? 'Yes' : 'No'
          const marketingStatus = sendEmail ? 'subscribed' : 'no_consent'

          if (userIdentity.length > 0) {
            userIdentityId = userIdentity[0].id
            if (userIdentity[0].crmPersonId! > 0) {
              const person = await pdServiceV2.getPerson(
                userIdentity[0].crmPersonId!,
              )
              if (person != 0) {
                personId = userIdentity[0].crmPersonId!
              }
            }
          }

          const personFields: Person = {
            name: fullName || '',
            email: email || '',
            phone: phoneFormatted!,
            marketing_status: marketingStatus,
          }

          const personFieldsV2: V2PersonCreate = {
            name: fullName!,
            emails: [{ value: email! }],
            phones: [{ value: phoneFormatted! }],
            marketing_status: marketingStatus,
          }

          await logger.debug(
            `Processing Pipedrive person for File Id:${fileId}, Job Id:${jobId}`,
            personFieldsV2,
          )
          let personCreatedFlag: boolean = false
          if (personId == 0) {
            const personSearchTerms = ['email', 'name', 'phone']
              .map((term) => ({
                field: term,
                term: personFields[term as keyof Person],
              }))
              .filter((term) => term.term)

            const personData: PersonResponseItem[] =
              await pdServiceV2.searchPersonByTerm(personSearchTerms)

            if (personData.length > 0) {
              personId = personData[0].item.id
            } else {
              const personResponse =
                await pdServiceV2.createPerson(personFieldsV2)
              personId = personResponse.data.id
              personCreatedFlag = true
            }
          }

          if (personId > 0 && personCreatedFlag == false) {
            // check marketing status
            const pdPerson: V2CreatePersonResponse | number =
              await pdServiceV2.getPerson(personId)
            if (typeof pdPerson !== 'number') {
              const pdMarketingStatus = pdPerson.data.marketing_status

              if (pdMarketingStatus === 'unsubscribed') {
                enableMarketing = 'No'
              } else {
                if (marketingStatus === 'subscribed') {
                  await pdServiceV2.updatePerson(personId, {
                    marketing_status: 'subscribed',
                  })
                } else if (marketingStatus === 'no_consent') {
                  if (pdMarketingStatus === 'subscribed') {
                    await pdServiceV2.updatePerson(personId, {
                      marketing_status: 'archived',
                    })
                  }
                }
              }
            }
          }

          const keysToMap: (keyof V2DealCustom)[] = [
            'phone',
            'source',
            'referralPage',
            'leadSourceCampaign',
            'leadSourceCategory',
            'leadChannel',
            'leadSubSource',
            'state',
            'bst',
            'propertyDetIndex',
            'webformTtt',
            'enableMarketing',
            'racvConsent',
            'racvMembershipNo',
            'offerApplied',
            'otoProduct',
            'prefferredContactTime',
            'agentReferee',
            'ReferralId',
            'campaignTrigger',
            'leadJourney',
            'searchesFee',
            'draftingFee',
            'reviewFee',
            'fixedFee',
            'additionalInfo',
            'discountOffered',
            'webformUrl',
            'leadSource',
          ]

          const leadTag: LeadTag = {
            leadSource: '',
            leadSourceCategory: '',
            source: null,
          }
          applyRules(utmSource, utmMedium, leadTag)

          // get pipedrive IDs for custom fields(enum)
          let pdStateId = 0
          let pdBstId = 0
          let pdPropTypeId = 0
          let pdEnableMktgId = 0
          let pdCampTriggerId = 0
          let offerAppliedId = 0
          let pdOtoProductId = 0
          let pdLeadSourceCatId = 0
          let pdLeadSourceId = 0

          const discountOffered =
            offerCode === racvCustomData.offerCode ? racvCustomData.discount : 0
          const offerCodeFinal = offerCode || offerCodeData.default

          const stateRes = await dlQuery.state.getById(stateId!)
          if (stateRes && stateRes[0]) {
            pdStateId = stateRes[0].pipedriveId!
          }

          const pdBst = await dlQuery.pipedriveDdLists.getPipedriveId(
            'BST',
            raqData.bst!,
          )
          if (pdBst && pdBst[0]) {
            pdBstId = pdBst[0].pipedriveId!
          }

          let propTypeCode = raqData.propertyType!
          if (
            raqData.propertyType === 'A' ||
            raqData.propertyType === 'T' ||
            raqData.propertyType === 'V'
          ) {
            propTypeCode = 'AVT'
          }

          const pdPropType = await dlQuery.pipedriveDdLists.getPipedriveId(
            'PropType',
            propTypeCode,
          )
          if (pdPropType && pdPropType[0]) {
            pdPropTypeId = pdPropType[0].pipedriveId!
          }

          const pdEnableMktg = await dlQuery.pipedriveDdLists.getPipedriveId(
            'EnableMarketing',
            enableMarketing.toUpperCase(),
          )
          if (pdEnableMktg && pdEnableMktg[0]) {
            pdEnableMktgId = pdEnableMktg[0].pipedriveId!
          }

          if (campaignTrigger) {
            const pdCampTrigger = await dlQuery.pipedriveDdLists.getPipedriveId(
              'CampaignTrigger',
              campaignTrigger,
            )
            if (pdCampTrigger && pdCampTrigger[0]) {
              pdCampTriggerId = pdCampTrigger[0].pipedriveId!
            }
          }

          const resRACV = await dlQuery.racvMembership.findByLeadId(leadId!)
          let pdRacvConsentId = 0
          if (resRACV.length > 0) {
            pdRacvConsentId = acceptTerms ? 259 : 260
          }

          if (offerCodeFinal) {
            const resOffer =
              await dlQuery.offerCode.findByOfferCode(offerCodeFinal)
            if (resOffer.length > 0) {
              offerAppliedId = resOffer[0].pipedriveOfferId!
            }
          }

          if (otoProduct) {
            const pdOtoProduct = await dlQuery.pipedriveDdLists.getPipedriveId(
              'OtoProduct',
              otoProduct,
            )
            if (pdOtoProduct && pdOtoProduct[0]) {
              pdOtoProductId = pdOtoProduct[0].pipedriveId!
            }
          }

          if (leadSourceCat || leadTag.leadSourceCategory) {
            const pdLeadSourceCat =
              await dlQuery.pipedriveDdLists.getPipedriveId(
                'CrmLeadSourceCategory',
                leadTag.leadSourceCategory || leadSourceCat || '',
              )
            if (pdLeadSourceCat && pdLeadSourceCat[0]) {
              pdLeadSourceCatId = pdLeadSourceCat[0].pipedriveId!
            }
          }

          if (leadTag.leadSource) {
            const pdLeadSource = await dlQuery.pipedriveDdLists.getPipedriveId(
              'CrmLeadSource',
              leadTag.leadSource,
            )
            if (pdLeadSource && pdLeadSource[0]) {
              pdLeadSourceId = pdLeadSource[0].pipedriveId!
            }
          }

          let searchesFee = 0
          let draftingFee = 0
          let reviewFee = 0
          let fixedFee = 0

          const prices = await QuoteModel.findOne({
            fileId: fileId,
          })

          if (prices) {
            searchesFee = prices.searchesFeeMax || prices.searchesFee || 0
            draftingFee = raqData.sdsRequired
              ? prices.sdsFee || 0
              : prices.draftingFee || 0
            reviewFee = prices.reviewFee || 0
            fixedFee = prices.fixedFee || 0
          }

          let additionalInfoPdId = 0
          if (leadJourney) {
            let infoType = ''
            if (leadJourney.includes('Online Conversion')) {
              infoType = leadJourney.includes('SDS')
                ? 'Seller disclosure statement'
                : 'Drafting'
            }
            if (infoType) {
              const pdAdditionalInfo =
                await dlQuery.pipedriveDdLists.getPipedriveId(
                  'AdditionalInfo',
                  infoType,
                )
              if (pdAdditionalInfo && pdAdditionalInfo[0]) {
                additionalInfoPdId = pdAdditionalInfo[0].pipedriveId!
              }
            }
          }

          const quote = await QuoteModel.findOne({ fileId: fileId })
          if (!quote) {
            throw new Error(
              `Quote not found for File Id:${fileId}, Job Id:${jobId}`,
            )
          }

          let quoteUrl = ''
          if (raqData.source === 'Website' && referralPage) {
            const referralBaseUrl = new URL(referralPage)
            quoteUrl = `${referralBaseUrl.origin}/quotes/${quote._id}/offer`
          }

          const dealCustomData: V2DealCustom = {
            phone: phoneFormatted,
            source: leadTag.source || utmSource,
            referralPage: referralPage,
            leadSourceCampaign: utmCampaign,
            leadSourceCategory: pdLeadSourceCatId,
            leadChannel: channel,
            leadSubSource: utmMedium,
            state: pdStateId,
            bst: pdBstId,
            propertyDetIndex: pdPropTypeId,
            webformTtt: raqData.timeToTransact,
            enableMarketing: pdEnableMktgId,
            racvConsent: pdRacvConsentId,
            racvMembershipNo: raqData.membershipNo,
            offerApplied: offerAppliedId,
            otoProduct: pdOtoProductId,
            prefferredContactTime: preferredContactTime,
            agentReferee: agentName,
            ReferralId: referralId,
            campaignTrigger: pdCampTriggerId,
            leadJourney: leadJourney,
            searchesFee: searchesFee,
            reviewFee: reviewFee,
            draftingFee: draftingFee,
            fixedFee: fixedFee,
            additionalInfo: additionalInfoPdId,
            discountOffered: discountOffered,
            webformUrl: quoteUrl,
            leadSource: pdLeadSourceId,
          }

          const dealFields: Record<string, V2DealCustomField> = {}

          await logger.debug(
            `Assigning pipedrive deal custom fields for File Id:${fileId}, Job Id:${jobId}`,
          )
          keysToMap.forEach((keyName) => {
            if (dealCustomData[keyName]) {
              let fieldVal: V2DealCustomField = dealCustomData[keyName]

              if (fieldVal === 0) {
                return
              }

              if (
                [
                  'searchesFee',
                  'draftingFee',
                  'reviewFee',
                  'fixedFee',
                  'discountOffered',
                ].includes(keyName)
              ) {
                fieldVal = { value: fieldVal, currency: 'AUD' }
              }

              const pdKey = keyCF[keyName].toString()
              ;(dealFields as Record<string, unknown>)[pdKey] = fieldVal
            }
          })

          const officeHourCat = getOfficeHourCategory()
          const officeHourTitle =
            officeHourCat === 2
              ? 'After Hours'
              : officeHourCat === 3
                ? 'Weekend'
                : ''

          const pdTitle = `${fullName}_${raqData.state}${!utmSource ? '' : '_' + utmSource}${!officeHourTitle ? '' : '_' + officeHourTitle}`

          const dealFieldsv2: V2DealCreate = {
            person_id: personId,
            title: pdTitle,
            stage_id: 1, // lead stage
            custom_fields: dealFields,
          }

          if (raqData.sub === 'Webform') {
            if (utmId) {
              dealFieldsv2.owner_id = Number(utmId)
            }
          }

          await logger.debug(
            `Creating Pipedrive deal for File Id:${fileId}, Job Id:${jobId}`,
            dealFieldsv2,
          )
          const dealResponseV2 = await pdServiceV2.createDeal(dealFieldsv2)
          const dealId = dealResponseV2.data.id

          await logger.debug(
            `Updating related tables for Deal Id:${dealId}, File Id:${fileId}, Job Id:${jobId}`,
          )

          if (notes && notes.trim().length > 0 && dealId > 0) {
            await logger.debug(
              `Creating Pipedrive note for Deal Id:${dealId}, File Id:${fileId}, Job Id:${jobId}`,
            )
            await pdServiceV1.createPipedriveNote(dealId, notes)
          }

          const transUpdateData = {
            crmDealId: dealId,
            crmCreated: dbTimestampMelbourne(),
            updated: dbTimestampMelbourne(),
          }

          await dlQuery.transactionService.update(
            transactionServiceId!,
            transUpdateData,
          )

          // update File
          await FileModel.updateOne(
            { _id: fileId },
            { $set: { pipedriveDealId: dealId } },
          )

          await DealCreateModel.updateOne(
            { jobId: jobId },
            { status: 'completed' },
          )

          // Add or update user identity
          if (userIdentityId === 0) {
            const userIdentityInsert = {
              userId,
              crmPersonId: personId,
              created: dbTimestampMelbourne(),
              updated: dbTimestampMelbourne(),
            }
            await dlQuery.userIdentity.insert(userIdentityInsert)
          } else {
            const userIdentityUpdate = {
              crmPersonId: personId,
              updated: dbTimestampMelbourne(),
            }
            await dlQuery.userIdentity.update(
              userIdentityId,
              userIdentityUpdate,
            )
          }
        }

        // update DataInput - end of publish
        await logger.debug(
          `Updating DataInput status to publishing completed for File Id:${fileId}, Job Id:${jobId}`,
        )
        const updateDataInputCompleted = {
          status: 'C', // completed publishing
          completedPublishing: dbTimestampMelbourne(),
          updated: dbTimestampMelbourne(),
        }
        await dlQuery.dataInput.update(dataId!, updateDataInputCompleted)

        await status('completed')

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)

        await logger.error(
          `Error processing lead for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await status(
          'error-processing',
          `Error processing Lead: ${JSON.stringify(errJson)}`,
        )

        return dapr.drop
      } finally {
        clientDL.release()
      }
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
