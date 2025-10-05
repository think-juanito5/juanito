import {
  type DatalakeQuery,
  type InsertTransactionServiceSchema,
  type InsertUserSubscriptionSchema,
  type UserProfileHistorySchema,
  datalakeQuery,
} from '@dbc-tech/datalake'
import { component, jobCloudEventSchema } from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5'
import { setJsonContentHeader } from '@dbc-tech/johnny5'
import { dapr } from '@dbc-tech/johnny5'
import { CcaRaqModel, DealCreateModel } from '@dbc-tech/johnny5-mongodb'
import type { Logger } from '@dbc-tech/logger'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { dbTimestampMelbourne } from '../../../utils/date-utils'
import { datalakeDb } from '../../plugins/db.datalake.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const process_additional_tables = new Elysia()
  .use(jobContext({ name: 'cca-raq-deal.process-additional-tables' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .use(datalakeDb)
  .post(
    '/process-additional-tables',
    async ({ body, ctx, datalakeDb }) => {
      const { logger, status, next, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to process additional tables for File Id:${fileId}, Job Id:${jobId}`,
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

        let version = 0
        let campTrigger: string | null = null
        let transSvcID = 0
        const dataId = dealData.datainputId
        const leadId = dealData.leadId

        // load lead data
        const leadRes = await dlQuery.leads.getByID(dataId!)
        const leadData = leadRes[0]

        const {
          firstName,
          lastName,
          fullName,
          email,
          phone,
          transactionTypeId,
          propertyTypeId,
          stateId,
          timeToTransactId,
          acceptTerms,
          utmCampaign,
          offerCode,
          notes,
          preferredContactTime,
          agentName,
          otoProduct,
          otoBuyerIdHash,
          otoListingIdHash,
          otoOfferIdHash,
        } = leadData

        const {
          userId,
          correctionUserId,
          correctionLeadId,
          racvOnlyProcFlag,
          userOnlyProcFlag,
          existingPropTran,
          updateTransSvcPdData,
        } = dealData.leadDetails?.[0]!

        const svcType =
          raqData.bst === 'B' ? 'CB' : raqData.bst === 'S' ? 'CS' : ''

        const transactionTypeRes = await dlQuery.transactionType.findByCode(
          raqData.bst,
        )
        const stateRes = await dlQuery.state.findByCode(raqData.state)
        const serviceTypeRes = await dlQuery.serviceType.findByCode(svcType)
        const transactionStageRes =
          await dlQuery.transactionStage.findByCode('EC')
        const segmentRes = await dlQuery.segment.findByCode(raqData.bst)
        const tStatusRes = await dlQuery.transactionStatus.findByCode('LE')

        await logger.debug(
          `Additional tables - UserProfile processing for File Id:${fileId}, Job Id:${jobId}`,
        )
        let userProfileID: number
        if (userId > 0) {
          userProfileID = userId
        } else {
          if (correctionUserId > 0) {
            // add in history
            const userDataRes =
              await dlQuery.userProfile.findByUserId(correctionUserId)
            version = userDataRes[0].version || 1
            const duplicateData: UserProfileHistorySchema = {
              ...userDataRes[0],
            }
            await dlQuery.userProfileHistory.insert(duplicateData)

            // update record in primary table
            const { id, ...userData } = userDataRes[0]
            userData.version = version + 1
            userData.firstName = firstName
            userData.lastName = lastName
            userData.fullName = fullName!.trim()
            if (userData.email !== email) {
              userData.secondaryEmail = userData.email
            }
            userData.email = email
            if (userData.mobile !== phone) {
              userData.secondaryMobile = userData.mobile
            }
            userData.mobile = phone
            userData.dataId = dataId!
            userData.updated = dbTimestampMelbourne()
            await dlQuery.userProfile.update(correctionUserId, userData)
            userProfileID = correctionUserId
          } else {
            // add in UserProfile
            const userData = {
              firstName: firstName,
              lastName: lastName,
              fullName: fullName!.trim(),
              email: email,
              mobile: phone,
              hasSpamComplaint: false,
              disableDataSharing: false,
              dataId: dataId!,
              version: 1,
              created: dbTimestampMelbourne(),
              updated: dbTimestampMelbourne(),
            }
            userProfileID = await dlQuery.userProfile.insert(userData)
          }
        }

        // update leads with user ID
        const updateLeads = {
          userId: userProfileID,
          updated: dbTimestampMelbourne(),
        }
        await dlQuery.leads.update(dataId!, updateLeads)

        // UserSubscription
        await logger.debug(
          `Additional tables - UserSubscription processing for File Id:${fileId}, Job Id:${jobId}`,
        )
        const uSubRes =
          await dlQuery.userSubscription.findByUserId(userProfileID)
        let isModified = false
        if (uSubRes && uSubRes.length > 0) {
          // update subscribe fields
          const { id, ...uSubData } = uSubRes[0]
          version = uSubData.version || 1
          const duplicateDataForHist = { ...uSubRes[0] }

          if (acceptTerms) {
            uSubData.emailSubscribed = dbTimestampMelbourne()
            uSubData.smsSubscribed = dbTimestampMelbourne()
            uSubData.phoneSubscribed = dbTimestampMelbourne()
            isModified = true
          } else if (!acceptTerms && uSubData.emailSubscribed) {
            uSubData.emailSubscribed = null
            uSubData.smsSubscribed = null
            uSubData.phoneSubscribed = null
            isModified = true
          }

          if (isModified) {
            // history table
            //delete duplicateDataForHist.version
            duplicateDataForHist.id = id
            await dlQuery.userSubscriptionHistory.insert(duplicateDataForHist)

            // primary table
            uSubData.version = version + 1
            uSubData.dataId = dataId!
            uSubData.updated = dbTimestampMelbourne()

            await dlQuery.userSubscription.update(id, uSubData)
          }
        } else {
          // add in UserSubscription
          const data: InsertUserSubscriptionSchema = {
            userId: userProfileID,
            brandId: 1,
            optIn: true,
            isCustomer: false,
            sellingComms: true,
            buyingComms: true,
            transferringComms: true,
            dataId: dataId!,
            version: 1,
            created: dbTimestampMelbourne(),
            updated: dbTimestampMelbourne(),
          }
          if (acceptTerms) {
            data.emailSubscribed = dbTimestampMelbourne()
            data.smsSubscribed = dbTimestampMelbourne()
            data.phoneSubscribed = dbTimestampMelbourne()
          } else {
            data.emailSubscribed = null
            data.smsSubscribed = null
            data.phoneSubscribed = null
          }

          await dlQuery.userSubscription.insert(data)
        }

        await logger.debug(
          `Additional tables - PropertyTransaction processing for File Id:${fileId}, Job Id:${jobId}`,
        )
        // PropertyTransaction
        // check if there is a duplicate PropTrans
        let propTransID: number = 0
        version = 0
        if (correctionLeadId > 0) {
          // const cond = (cUserProfileID > 0 ? { UserID: userProfileID } : { DataID: cLeadID });
          const propTransData =
            await dlQuery.propertyTransaction.findByUserId(userProfileID)
          propTransID = propTransData[0].id

          if (!existingPropTran && !(userOnlyProcFlag || racvOnlyProcFlag)) {
            // add PropertyTransaction
            const data = {
              userId: userProfileID,
              transactionTypeId: transactionTypeId,
              propertyTypeId: propertyTypeId,
              contactPhone: phone,
              contactEmail: email,
              stateId: stateId,
              transactionStageId: transactionStageRes[0].id,
              isCompleted: false,
              dataId: dataId,
              version: 1,
              created: dbTimestampMelbourne(),
              updated: dbTimestampMelbourne(),
            }
            propTransID = await dlQuery.propertyTransaction.insert(data)
          }
        } else {
          if (userOnlyProcFlag || racvOnlyProcFlag) {
            // no new property transaction
          } else {
            // add PropertyTransaction
            const data = {
              userId: userProfileID,
              transactionTypeId: transactionTypeId,
              propertyTypeId: propertyTypeId,
              contactPhone: phone,
              contactEmail: email,
              stateId: stateId,
              transactionStageId: transactionStageRes[0].id,
              isCompleted: false,
              dataId: dataId,
              version: 1,
              created: dbTimestampMelbourne(),
              updated: dbTimestampMelbourne(),
            }
            propTransID = await dlQuery.propertyTransaction.insert(data)
          }
        }

        await logger.debug(
          `Additional tables - UserSegment processing for File Id:${fileId}, Job Id:${jobId}`,
        )
        // UserSegment
        //let userSegID = 0
        version = 0
        if (segmentRes.length > 0) {
          if (correctionLeadId > 0 || correctionUserId > 0) {
            // TODO do nothing
          } else {
            // add in UserSegment
            const userSegmentData = {
              userId: userProfileID,
              segmentId: segmentRes[0].id,
              propertyTransactionId: propTransID,
              dataId: dataId!,
              version: 1,
              created: dbTimestampMelbourne(),
              updated: dbTimestampMelbourne(),
            }
            await dlQuery.userSegment.insert(userSegmentData)
          }
        }

        await logger.debug(
          `Additional tables - TransactionService processing for File Id:${fileId}, Job Id:${jobId}`,
        )
        // TransactionService
        version = 0
        if (userOnlyProcFlag || racvOnlyProcFlag) {
          // no new transaction service
        } else if (updateTransSvcPdData && correctionLeadId > 0) {
          const duplicateLead =
            await dlQuery.leads.getDuplicateLead(correctionLeadId)
          const transSvcRes = await dlQuery.transactionService.findById(
            duplicateLead[0].transactionServiceId!,
          )

          const { id, ...transSvcData } = transSvcRes[0]

          if (transSvcData.notes !== notes) {
            transSvcData.notes = notes
          }

          transSvcData.offerApplied = offerCode
          transSvcData.updated = dbTimestampMelbourne()

          await dlQuery.transactionService.update(id, transSvcData)
        } else {
          // start TransactionService CCA

          const tSvc: InsertTransactionServiceSchema = {
            transactionId: propTransID,
            serviceTypeId: serviceTypeRes[0].id,
            statusId: tStatusRes[0].id,
            timeToTransactId: timeToTransactId,
            crmConfirmed: false,
            dataId: dataId!,
            version: 1,
            offerApplied: offerCode,
            notes: notes,
            created: dbTimestampMelbourne(),
            updated: dbTimestampMelbourne(),
            preferredContactTime: preferredContactTime,
            agentName: agentName,
            otoProduct: otoProduct,
          }

          // get campaign trigger
          campTrigger = await dlQuery.leadCampaignTrigger.getTrigger(
            utmCampaign || '',
          )
          tSvc.campaignTrigger = campTrigger ? campTrigger : null

          // online conversion
          if (
            stateRes[0].isOnlineConversion &&
            transactionTypeRes[0].isOnlineConversion
          ) {
            tSvc.leadJourney = 'Online Conversion'

            // check if camp trigger is online conversion
            if (campTrigger) {
              const resCampTrigger =
                await dlQuery.leadCampaignTrigger.findByCampaign(utmCampaign!)

              if (
                resCampTrigger &&
                resCampTrigger[0] &&
                resCampTrigger[0].isOnlineConversion
              ) {
                tSvc.leadJourney += ` - ${tSvc.campaignTrigger}`
              } else {
                tSvc.leadJourney = ''
              }
            } else {
              // campaign trigger = empty if its online conversion and not in LeadCampaignTrigger
              tSvc.campaignTrigger = ''
            }
          }
          if (raqData.sdsRequired) {
            if (raqData.bst === 'S' && raqData.state === 'QLD') {
              tSvc.leadJourney = 'Online Conversion - SDS'
            } else {
              await logger.warn(
                `SDS required but not in QLD or not a sale. SDS will not be processed.`,
              )
              await CcaRaqModel.updateOne(
                { jobId: jobId },
                { sdsRequired: false },
              )
            }
          }

          transSvcID = await dlQuery.transactionService.insert(tSvc)
        }

        await logger.debug(
          `Additional tables - RACVMembership processing for File Id:${fileId}, Job Id:${jobId}`,
        )
        if (raqData.membershipNo && userProfileID > 0) {
          const data = {
            userId: userProfileID,
            leadId: leadId,
            membershipNo: raqData.membershipNo,
            acceptTerms: acceptTerms,
            dataId: dataId,
            created: dbTimestampMelbourne(),
            updated: dbTimestampMelbourne(),
          }
          await dlQuery.racvMembership.insert(data)
        }

        if (correctionLeadId > 0) {
          if (userOnlyProcFlag || racvOnlyProcFlag || updateTransSvcPdData) {
            // no change in TransactionServiceID
            const resDuplicateLeadData =
              await dlQuery.leads.getDuplicateLead(correctionLeadId)

            if (
              resDuplicateLeadData &&
              resDuplicateLeadData[0].transactionServiceId! > 0
            ) {
              transSvcID = resDuplicateLeadData[0].transactionServiceId!
            }
          }
        }

        // update leads with TransactionServiceID
        const updateLeadsTransId = { transactionServiceId: transSvcID }
        await dlQuery.leads.update(dataId!, updateLeadsTransId)

        const isOtoLead = otoOfferIdHash || otoBuyerIdHash || otoListingIdHash
        if (isOtoLead) {
          await logger.debug(
            `OtoLinking - OtoLead found for File Id:${fileId}, Job Id:${jobId}`,
          )

          await processOtoLead(dlQuery, logger, fileId, jobId, dataId!, leadId!)
        }

        await logger.debug(
          `Updating DataInput and DealCreate status to processing done for File Id:${fileId}, Job Id:${jobId}`,
        )
        const updateDataInputEnd = {
          status: 'S', // processing done
          completedProcessing: dbTimestampMelbourne(),
          updated: dbTimestampMelbourne(),
        }
        await dlQuery.dataInput.update(dataId!, updateDataInputEnd)

        await DealCreateModel.updateOne(
          { jobId: jobId },
          { status: 'additional-tables' },
        )

        if (job.testMode === 'ignore-deal') {
          await logger.debug(
            `Test mode - ignore deal creation for File Id:${fileId}, Job Id:${jobId}`,
          )

          await status('completed')

          return dapr.success
        }

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-raq-deal',
          path: 'v1.cca-raq-deal.publish-pipedrive',
        })

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

export const processOtoLead = async (
  dlQuery: DatalakeQuery,
  logger: Logger,
  fileId: string,
  jobId: string,
  dataId: number,
  leadId: number,
) => {
  await logger.debug(
    `Additional tables - OtoLinking processing for File Id:${fileId}, Job Id:${jobId}`,
  )

  // load lead data
  const leadRes = await dlQuery.leads.getByID(dataId!)
  const leadData = leadRes[0]

  const {
    userId,
    transactionServiceId,
    otoBuyerIdHash,
    otoListingIdHash,
    otoOfferIdHash,
  } = leadData

  let otoRecordData: Array<Record<string, unknown>> = []

  if (otoOfferIdHash) {
    otoRecordData = await dlQuery.otoLinking.getByOtoOfferId(otoOfferIdHash)
    await logger.debug(
      `OtoLinking condition - otoOfferIdHash:${otoOfferIdHash}`,
    )
  }

  if (
    otoListingIdHash &&
    otoBuyerIdHash &&
    (!otoRecordData || otoRecordData.length === 0)
  ) {
    otoRecordData = await dlQuery.otoLinking.getByOtoListingIdBuyerId(
      otoListingIdHash!,
      otoBuyerIdHash!,
    )
    await logger.debug(
      `OtoLinking condition - otoListingIdHash:${otoListingIdHash}, otoBuyerIdHash:${otoBuyerIdHash}`,
    )
  }

  if (
    userId &&
    otoListingIdHash &&
    (!otoRecordData || otoRecordData.length === 0)
  ) {
    otoRecordData = await dlQuery.otoLinking.getByOtoListingIdUserId(
      otoListingIdHash!,
      userId,
    )
    await logger.debug(
      `OtoLinking condition - otoListingIdHash:${otoListingIdHash}, userId:${userId}`,
    )
  }

  let createOtoFlag = false

  await logger.debug('OtoLinking record details:', otoRecordData)

  if (!otoRecordData || otoRecordData.length === 0) {
    createOtoFlag = true
  } else {
    for (const otoRecord of otoRecordData) {
      const updateOtoRec: Record<string, unknown> = {
        dataId: dataId,
      }

      if (otoRecord.userId !== userId) {
        if (!otoRecord.ccaUserId) {
          updateOtoRec.ccaUserId = userId
        } else {
          createOtoFlag = true
        }
      }

      if (
        otoRecord.otoOfferIdHash &&
        otoRecord.otoOfferIdHash === otoOfferIdHash
      ) {
        if (
          otoRecord.otoBuyerIdHash !== otoBuyerIdHash &&
          otoRecord.otoListingIdHash === otoListingIdHash
        ) {
          await logger.debug(
            `Check if only otoBuyerIdHash is updated then continue`,
          )
          continue
        }

        if (otoRecord.ccaConveyancingServiceId) {
          createOtoFlag = true
        }
      }

      if (!otoRecord.otoBuyerIdHash) {
        updateOtoRec.otoBuyerIdHash = otoBuyerIdHash
      }

      if (!otoRecord.otoListingIdHash) {
        updateOtoRec.otoListingIdHash = otoListingIdHash
      }

      if (
        otoRecord.otoBuyerIdHash === otoBuyerIdHash &&
        otoRecord.otoListingIdHash !== otoListingIdHash
      ) {
        createOtoFlag = true
      }

      if (
        otoRecord.otoBuyerIdHash === otoBuyerIdHash &&
        otoRecord.otoListingIdHash === otoListingIdHash &&
        otoRecord.otoOfferIdHash !== otoOfferIdHash
      ) {
        await logger.debug(
          `Check if only otoOfferIdHash is updated then continue`,
        )
        continue
      }

      updateOtoRec.ccaLeadId = leadId
      if (transactionServiceId) {
        updateOtoRec.ccaTransactionServiceId = transactionServiceId
      }

      if (!createOtoFlag) {
        await logger.debug(
          `Updating OtoLinking record for File Id:${fileId}, Job Id:${jobId}, OtoLinking Id:${otoRecord.id}`,
        )
        await dlQuery.otoLinking.update(otoRecord.id as number, updateOtoRec)
      }
    }
  }

  await logger.debug(
    `OtoLinking flag for File Id:${fileId}, Job Id:${jobId}, createOtoFlag:${createOtoFlag}`,
  )

  if (createOtoFlag) {
    const data = {
      userId: userId,
      otoBuyerIdHash: otoBuyerIdHash,
      otoOfferIdHash: otoOfferIdHash,
      otoListingIdHash: otoListingIdHash,
      ccaUserId: userId,
      ccaLeadId: leadId,
      ccaTransactionServiceId: transactionServiceId,
      dataId: dataId,
      created: dbTimestampMelbourne(),
      updated: dbTimestampMelbourne(),
    }
    const otoId = await dlQuery.otoLinking.insert(data)
    await logger.debug(
      `Creating OtoLinking record for File Id:${fileId}, Job Id:${jobId}, OtoLinking Id:${otoId}`,
    )
  }
}
