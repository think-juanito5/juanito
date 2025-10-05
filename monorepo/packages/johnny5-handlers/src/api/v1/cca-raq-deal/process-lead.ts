import {
  type InsertLeadsSchema,
  checkCommonPhone,
  checkIfTest,
  datalakeQuery,
  empty,
} from '@dbc-tech/datalake'
import { component, jobCloudEventSchema } from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5'
import { setJsonContentHeader } from '@dbc-tech/johnny5'
import { dapr } from '@dbc-tech/johnny5'
import { CcaRaqModel, DealCreateModel } from '@dbc-tech/johnny5-mongodb'
import { racvCustomData } from '@dbc-tech/pipedrive'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { dbTimestampMelbourne } from '../../../utils/date-utils'
import { datalakeDb } from '../../plugins/db.datalake.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const process_lead = new Elysia()
  .use(jobContext({ name: 'cca-raq-deal.process-lead' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .use(datalakeDb)
  .post(
    '/process-lead',
    async ({ body, ctx, datalakeDb }) => {
      const { logger, next, status } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to process raq lead for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const clientDL = await datalakeDb.connect()
      const dlQuery = datalakeQuery(clientDL)

      try {
        await logger.debug(
          `Get related CcaRaq and DealCreate  for File Id:${fileId}, Job Id:${jobId}`,
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

        // update DataInput - start of process
        await logger.debug(
          `Updating DataInput status to start processing for File Id:${fileId}, Job Id:${jobId}`,
        )
        const updateDataInputStart = {
          status: 'P', // started processing
          startedProcessing: dbTimestampMelbourne(),
          updated: dbTimestampMelbourne(),
        }
        await dlQuery.dataInput.update(
          dealData.datainputId!,
          updateDataInputStart,
        )

        // update DealCreate status
        await logger.debug(
          `Updating DealCreate status to lead for File Id:${fileId}, Job Id:${jobId}`,
        )
        const updateDealCreate = {
          status: 'lead',
          datainputStatus: 'I',
          updated: dbTimestampMelbourne(),
        }
        await DealCreateModel.updateOne({ jobId: jobId }, updateDealCreate)

        // create lead data and validation
        const dataInputID = dealData.datainputId
        const firstName = (raqData.firstName || '').trim()
        const lastName = (raqData.lastName || '').trim()
        const fullName = `${firstName} ${lastName}`.trim()
        const email = (raqData.email || '').trim()
        const phone = (raqData.phone || '').trim()
        const bst = raqData.bst || ''
        const state = raqData.state || ''
        const propertyType = raqData.propertyType || ''
        const timeToTransact = raqData.timeToTransact || ''
        const referralPage = raqData.referralPage || ''
        const cid = raqData.cid || ''
        const utmID = raqData.utm_id || ''
        const utmSource = raqData.utm_source || ''
        let utmCampaign = raqData.utm_campaign || ''
        const channel = raqData.channel || ''
        const utmMed = raqData.utm_medium || ''
        const utmContent = raqData.utm_content || ''
        const optIn = raqData.optIn || false
        const sendEmailQuote = raqData.sendEmailQuote || false
        const racvMemberNo = raqData.membershipNo || ''
        const sendEmailQuoteFinal = email ? sendEmailQuote : false
        let offerCode = raqData.offerCode || ''
        const notes = raqData.notes || ''
        const preferredContactTime = raqData.preferredContactTime || null
        const agent = raqData.agent || null
        const referralID = raqData.referralID || null
        const referralPartnerEmail = raqData.referralPartnerEmail || null
        const referralFranchiseeEmail = raqData.referralFranchiseeEmail || null
        const conveyancingFirm = raqData.conveyancingFirm || null
        const conveyancingName = raqData.conveyancingName || null
        const experiment_id = raqData.experiment_id || null
        const experiment_variation = raqData.experiment_variation || null
        const otoProductType = raqData.otoProductType || null
        const otoBuyerIdHash = raqData.otoBuyerIdHash || null
        const otoOfferIdHash = raqData.otoOfferIdHash || null
        const otoListingIdHash = raqData.otoListingIdHash || null

        const otoProductMap: Record<string, string> = {
          'OTO-CCA': 'CCA',
          'OTO-RBI': 'RBI',
          'OTO-CCA-RBI': 'CCA&RBI',
        }
        const otoProduct = otoProductType ? otoProductMap[otoProductType] : null

        // assign offerCode if RACV
        if (racvMemberNo || utmSource.toUpperCase() === 'RACV') {
          offerCode = racvCustomData.offerCode
          utmCampaign = racvCustomData.utmCampaign
          await logger.info(
            `RACV Member No detected: Offer Code: ${offerCode}, UTM Campaign: ${utmCampaign}`,
          )
        }

        const offerAppliedTemp = offerCode
          ? await dlQuery.offerCode.findByOfferCode(offerCode)
          : ''
        const offerApplied: string = offerAppliedTemp ? offerCode || '' : ''

        const svcType = bst === 'B' ? 'CB' : bst === 'S' ? 'CS' : ''

        const transactionTypeRes = await dlQuery.transactionType.findByCode(bst)
        const propertyTypeRes =
          await dlQuery.propertyType.findByCode(propertyType)
        const stateRes = await dlQuery.state.findByCode(state)
        const transactionTimeRes =
          await dlQuery.transactionTime.findByCode(timeToTransact)
        const brandRes = await dlQuery.brand.findByCode('CCA')
        const serviceTypeRes = await dlQuery.serviceType.findByCode(svcType)
        const transactionStageRes =
          await dlQuery.transactionStage.findByCode('EC')
        const segmentRes = await dlQuery.segment.findByCode(bst)
        const tStatusRes = await dlQuery.transactionStatus.findByCode('LE')

        if (
          !transactionTypeRes ||
          !propertyTypeRes ||
          !stateRes ||
          !transactionTimeRes ||
          !brandRes ||
          !serviceTypeRes ||
          !transactionStageRes ||
          !segmentRes
        ) {
          throw new Error(
            `Insufficient RAQ data for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        const datalakeWebhook = {
          transactionTypeID: transactionTypeRes[0].id,
          propertyTypeID: propertyTypeRes[0].id,
          stateID: stateRes[0].id,
          transactionTimeID: transactionTimeRes[0].id,
          brandID: brandRes[0].id,
          serviceTypeID: serviceTypeRes[0].id,
          transactionStageID: transactionStageRes[0].id,
          segmentID: segmentRes[0].id,
          transactionStatusID: tStatusRes[0].id,
        }

        let lStatus: string = 'New Lead'
        let lReason: string = 'New Lead'
        let pdFlag: boolean = true

        const condition = {
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
        }

        const duplicateUserProfileID =
          await dlQuery.userProfile.checkDuplicate(condition)

        await logger.debug('Duplicate User Profile', duplicateUserProfileID)

        if (duplicateUserProfileID > 0) {
          lStatus = 'New Lead'
          lReason = 'New Lead'
          pdFlag = true
        }

        const cUserProfileID =
          await dlQuery.userProfile.checkDuplicateCorrection(condition)
        if (cUserProfileID > 0) {
          lStatus = 'New Lead'
          lReason = 'New Lead'
          pdFlag = true
        }

        await logger.debug('Duplicate Correction User Profile', cUserProfileID)

        // const updateUserSegment = false
        //const updatePropTran = false
        //const updateTranSvc = false
        let existingPropTran = false
        let transSvcPdData = null
        let updateTransSvcPdData = false
        let cLeadID = 0
        let userOnlyProcFlag = false
        let racvOnlyProcFlag = false
        let isNewOtoLeadFlag = false

        if (otoProductType && otoOfferIdHash) {
          await logger.debug(
            `Checking for duplicate OTO for File Id:${fileId}, Job Id:${jobId}`,
          )
          const isNewOtoLead = await dlQuery.leads.checkDuplicateOto({
            otoProduct: otoProductType,
            otoOfferIdHash: otoOfferIdHash,
          })

          if (isNewOtoLead?.id) {
            cLeadID = 0
            lStatus = 'New Lead'
            lReason = 'New Lead'
            pdFlag = true
            isNewOtoLeadFlag = true
          }
        }

        if (
          (duplicateUserProfileID > 0 || cUserProfileID > 0) &&
          !isNewOtoLeadFlag
        ) {
          const leadUserID =
            duplicateUserProfileID > 0 ? duplicateUserProfileID : cUserProfileID
          const cond = {
            UserID: leadUserID,
            UtmSource: utmSource,
            TransactionTypeID: datalakeWebhook.transactionTypeID,
            PropertyTypeID: datalakeWebhook.propertyTypeID,
            StateID: datalakeWebhook.stateID,
            TimeToTransactID: datalakeWebhook.transactionTimeID,
            CreatedDataInput: dbTimestampMelbourne(),
          }

          const resDuplicateLead = await dlQuery.leads.checkDuplicate(cond)

          await logger.debug('Duplicate Lead', resDuplicateLead)

          await logger.debug(
            `Updating DealCreate status to lead for File Id:${fileId}, Job Id:${jobId}`,
          )

          if (resDuplicateLead && resDuplicateLead.id > 0) {
            lStatus = 'Duplicate'
            lReason = 'Already Exists'

            if (
              resDuplicateLead.utmsource === 0 &&
              resDuplicateLead.transtype === 1 &&
              resDuplicateLead.proptype === 1 &&
              resDuplicateLead.state === 1 &&
              resDuplicateLead.transtime === 1
            ) {
              cLeadID = 0
              pdFlag = pdFlag ? true : false
              await logger.debug('Duplicate Lead Condition 1')
            } else if (
              resDuplicateLead.utmsource === 1 &&
              resDuplicateLead.transtype === 1 &&
              resDuplicateLead.proptype === 1 &&
              resDuplicateLead.state === 1 &&
              resDuplicateLead.transtime === 1
            ) {
              await logger.debug('Duplicate Lead Condition 2')
              cLeadID = resDuplicateLead.id
              pdFlag = false
              if (cUserProfileID > 0) {
                await logger.debug('Duplicate Lead Condition 3')
                pdFlag = true
                userOnlyProcFlag = true
                lStatus = 'Duplicate'
                lReason = 'Correction'
              }
            } else {
              await logger.debug('Duplicate Lead Condition 4')
              cLeadID = resDuplicateLead.id
              lStatus = 'New Lead'
              lReason = 'New Lead'
              pdFlag = true
            }

            if (resDuplicateLead.proptype === 0) {
              await logger.debug('Duplicate Lead Condition 5')
              lStatus = 'Duplicate'
              lReason = 'Correction'
              pdFlag = true

              if (resDuplicateLead.utmsource === 0) {
                await logger.debug('Duplicate Lead Condition 6')
                lReason = 'Already Exists'
              }
            }

            if (
              resDuplicateLead.transtime === 0 &&
              resDuplicateLead.utmsource === 1 &&
              resDuplicateLead.transtype === 1 &&
              resDuplicateLead.proptype === 1 &&
              resDuplicateLead.state === 1
            ) {
              await logger.debug('Duplicate Lead Condition 7')
              existingPropTran = true
              lStatus = 'Duplicate'
              lReason = 'Correction'
              pdFlag = true
            }

            if (lStatus === 'New Lead' && lReason === 'New Lead') {
              await logger.debug('Duplicate Lead Condition 8')
              cLeadID = 0
            }
          }
        }

        // check if RACV is changed
        if (racvMemberNo && cLeadID > 0) {
          const resRACV = await dlQuery.racvMembership.findByLeadId(cLeadID)
          if (resRACV.length && resRACV[0].membershipNo !== racvMemberNo) {
            lStatus = 'Duplicate'
            lReason = 'Correction'
            if (!pdFlag) {
              pdFlag = true
              racvOnlyProcFlag = true
            }
          }
        }

        // Check if pd notes or offerCode has changes
        if (offerApplied && cLeadID > 0) {
          const lead = await dlQuery.leads.getDuplicateLead(cLeadID)
          transSvcPdData = lead[0].transactionServiceId
            ? await dlQuery.transactionService.findById(
                lead[0].transactionServiceId!,
              )
            : null

          if (
            transSvcPdData &&
            transSvcPdData[0].offerApplied !== offerApplied
          ) {
            lStatus = 'Duplicate'
            lReason = 'Correction'
            pdFlag = true
            updateTransSvcPdData = true
          }
        }

        // check if Invalid - Test Lead
        const arrData = { firstName, lastName }
        if (checkIfTest(arrData)) {
          lStatus = 'Invalid'
          lReason = 'Test Lead'
          pdFlag = false
        }

        // check if Invalid - Location Not Supported
        if (stateRes && !stateRes[0].supported) {
          lStatus = 'Invalid'
          lReason = 'Location Not Supported'
          pdFlag = false
        }

        //common fake mobile numbers for CCA
        if (!empty(phone) && checkCommonPhone(phone)) {
          lStatus = 'Invalid'
          lReason = 'Mobile identified as fake'
          pdFlag = true
        }

        const leadStatusResult = await dlQuery.leadStatus.findByName(lStatus)
        const statusReason = await dlQuery.statusReason.findByName(lReason)

        /** TODO
         * 
                   const leadData = {
              LeadID: cLeadID,
              StatusID: leadStatus.ID,
              StatusReasonID: statusReason.ID,
              PDFlag: pdFlag,
              UpdateUserSegment: updateUserSegment,
              UpdatePropTran: updatePropTran,
              UpdateTranSvc: updateTranSvc,
              ExistingPropTran: existingPropTran,
              UpdateTransSvcPdData: updateTransSvcPdData,
            };
  
            await this.updateLeadStatus(leadData);* 
         */

        // create lead
        const leadData: InsertLeadsSchema = {
          id: dataInputID,
          cid: cid,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          transactionTypeId: datalakeWebhook.transactionTypeID,
          propertyTypeId: datalakeWebhook.propertyTypeID,
          stateId: datalakeWebhook.stateID,
          timeToTransactId: datalakeWebhook.transactionTimeID,
          acceptTerms: optIn,
          utmId: utmID,
          utmSource: utmSource,
          utmMedium: utmMed,
          utmCampaign: utmCampaign,
          channel: channel,
          utmContent: utmContent,
          referralPage: referralPage,
          sendEmail: sendEmailQuoteFinal,
          statusId: leadStatusResult[0].id,
          duplicateLeadId: cLeadID,
          statusReasonId: statusReason[0].id,
          offerCode: offerApplied,
          brandId: datalakeWebhook.brandID,
          fullName: fullName,
          created: dbTimestampMelbourne(),
          updated: dbTimestampMelbourne(),
          notes: notes,
          preferredContactTime: preferredContactTime,
          agentName: agent,
          referralId: referralID,
          referralPartnerEmail: referralPartnerEmail,
          referralFranchiseeEmail: referralFranchiseeEmail,
          conveyancingFirm: conveyancingFirm,
          conveyancingName: conveyancingName,
          experimentId: experiment_id,
          experimentVariation: experiment_variation,
          otoProduct: otoProduct,
          otoBuyerIdHash: otoBuyerIdHash,
          otoOfferIdHash: otoOfferIdHash,
          otoListingIdHash: otoListingIdHash,
        }

        if (duplicateUserProfileID > 0) {
          leadData.userId = duplicateUserProfileID
        }

        if (updateTransSvcPdData) {
          if (transSvcPdData && transSvcPdData[0]) {
            leadData.transactionServiceId = transSvcPdData[0].id
          }
        }

        // lead source category
        const resLeadSourceCat =
          await dlQuery.leadSourceCategory.findBySource(utmSource)

        if (resLeadSourceCat.length > 0) {
          leadData.leadSourceCat = resLeadSourceCat
            ? resLeadSourceCat[0].category
            : null
        }

        await logger.debug(
          `Creating Leads in datalake for File Id:${fileId}, Job Id:${jobId}`,
          leadData,
        )
        const leadID = await dlQuery.leads.insert(leadData)

        if (leadID) {
          await logger.info(
            `Lead created successfully for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        if (pdFlag) {
          await logger.debug(
            `Processing to continue with additional tables for File Id:${fileId}, Job Id:${jobId}`,
          )
          const leadDetails = {
            userId: duplicateUserProfileID || 0,
            correctionUserId: cUserProfileID || 0,
            correctionLeadId: cLeadID || 0,
            racvOnlyProcFlag: racvOnlyProcFlag,
            userOnlyProcFlag: userOnlyProcFlag,
            existingPropTran: existingPropTran,
            updateTransSvcPdData: updateTransSvcPdData,
          }

          // update DealCreate
          const updateDealCreate = {
            status: 'lead',
            leadId: leadID,
            leadDetails: leadDetails,
          }
          await DealCreateModel.updateOne({ jobId: jobId }, updateDealCreate)

          // process additional tables
          await next({
            pubsub: component.longQueues,
            queueName: 'johnny5-cca-raq-deal',
            path: 'v1.cca-raq-deal.process-additional-tables',
          })
        } else {
          await logger.debug(
            `Skipping processing of additional tables for File Id:${fileId}, Job Id:${jobId}`,
          )
          // update datainput
          const updateDataInput = {
            status: 'D', // process completed
            completedProcessing: dbTimestampMelbourne(),
            updated: dbTimestampMelbourne(),
          }
          await dlQuery.dataInput.update(dealData.datainputId!, updateDataInput)

          await logger.debug(
            `Lead not processed for File Id:${fileId}, Job Id:${jobId}, Status: ${lStatus}, Reason: ${lReason}`,
          )

          await status('completed')
        }

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
