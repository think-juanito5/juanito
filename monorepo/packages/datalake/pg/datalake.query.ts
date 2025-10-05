import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
} from 'drizzle-orm'
import { type NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres'
import { type ClientConfig, type PoolClient } from 'pg'
import * as dl from '../schemas/drizzle/datalake.schema'
import type {
  DuplicateLeadCondition,
  DuplicateLeadOtoCondition,
  DuplicateUserCondition,
} from '../schemas/typebox/datalake.schema'
import { brandId, datalakeLeadStatus, getOfficeHourCategory } from '../utils'

export type ConveyancingServiceWith = {
  movingHubLogs?: boolean
}

export const clientConfig: ClientConfig = {
  host: process.env.DATALAKE_POSTGRES_HOST!,
  port: +process.env.DATALAKE_POSTGRES_PORT!,
  user: process.env.DATALAKE_POSTGRES_USER!,
  password: process.env.DATALAKE_POSTGRES_PASSWORD!,
  database: process.env.DATALAKE_POSTGRES_DB!,
  ssl:
    process.env.POSTGRES_DISABLE_SSL === 'true'
      ? false
      : { rejectUnauthorized: false },
}

export type DatalakeQuery = ReturnType<typeof datalakeQuery>
export const datalakeQuery = (client: PoolClient) => {
  const db = drizzle(client, { schema: dl })
  return {
    client,
    transactionService: {
      hasDeal: async (dealId: number) => {
        const result = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(dl.transactionService)
          .where(eq(dl.transactionService.crmDealId, dealId))
        return result[0].count > 0
      },
      findById: async (id: number) => {
        const result = await db
          .select()
          .from(dl.transactionService)
          .where(eq(dl.transactionService.id, id))
        return result
      },
      findByDeal: async (dealId: number) => {
        const result = await db
          .select()
          .from(dl.transactionService)
          .where(eq(dl.transactionService.crmDealId, dealId))
        return result
      },
      hasTransactionService: async (matterId: number) => {
        const result = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(dl.transactionService)
          .where(eq(dl.transactionService.matterId, matterId))
        return result[0].count > 0
      },
      insert: async (data: dl.InsertTransactionServiceSchema) => {
        const result = await db
          .insert(dl.transactionService)
          .values(data)
          .returning({ id: dl.transactionService.id })
        return result[0].id
      },
      update: async (id: number, data: dl.InsertTransactionServiceSchema) => {
        const result = await db
          .update(dl.transactionService)
          .set(data)
          .where(eq(dl.transactionService.id, id))
        return result
      },
      findByDataInputId: async (id: number) => {
        const result = await db
          .select()
          .from(dl.transactionService)
          .where(eq(dl.transactionService.dataId, id))
        return result
      },
      findByCrmDealId: async (dealId: number) => {
        const result = await db.query.transactionService
          .findMany({ where: eq(dl.transactionService.crmDealId, dealId) })
          .execute()
        return result
      },
      findByMatterId: async (matterId: number) => {
        const result = await db.query.transactionService
          .findMany({ where: eq(dl.transactionService.matterId, matterId) })
          .execute()
        return result
      },
    },
    transactionServiceHistory: {
      insert: async (data: dl.TransactionServiceHistorySchema) => {
        const result = await db
          .insert(dl.transactionServiceHistory)
          .values(data)
          .returning({ id: dl.transactionServiceHistory.id })
        return result[0].id
      },
    },
    conveyancingService: {
      hasConveyancingService: async (matterId: number) => {
        const result = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(dl.conveyancingService)
          .where(eq(dl.conveyancingService.matterId, matterId))
        return result[0].count > 0
      },
      findConveyancingDetails: async (matterId: number) => {
        const result = await conveyancingDetails(db, matterId)
        return result
      },
      findById: async (id: number, include?: ConveyancingServiceWith) => {
        const result = await db.query.conveyancingService
          .findMany({
            where: eq(dl.conveyancingService.id, id),
            with: {
              movingHubLogs: include?.movingHubLogs || undefined,
            },
          })
          .execute()
        return result
      },
      findByMatterId: async (
        matterId: number,
        include?: ConveyancingServiceWith,
      ) => {
        const result = await db.query.conveyancingService
          .findMany({
            where: eq(dl.conveyancingService.matterId, matterId),
            with: {
              movingHubLogs: include?.movingHubLogs || undefined,
            },
          })
          .execute()
        return result
      },
    },
    dataInput: {
      insertData: async (data: dl.InsertDataInputSchema) => {
        const result = await db
          .insert(dl.dataInput)
          .values(data)
          .returning({ id: dl.dataInput.id })
        return result[0].id
      },
      findByDataInputId: async (id: number) => {
        const result = await db
          .select()
          .from(dl.dataInput)
          .where(eq(dl.dataInput.id, id))
        return result
      },
      findByDataInputIdCustom: async (id: number) => {
        const result = await db
          .select()
          .from(dl.dataInput)
          .where(eq(dl.dataInput.id, id))
        return result
      },
      update: async (id: number, data: dl.InsertDataInputSchema) => {
        const result = await db
          .update(dl.dataInput)
          .set(data)
          .where(eq(dl.dataInput.id, id))
        return result
      },
    },
    documentType: {
      insertData: async (data: dl.InsertDocumentTypeSchema) => {
        const result = await db
          .insert(dl.documentType)
          .values(data)
          .returning({ id: dl.movingHubLog.id })
        return result[0].id
      },
    },
    movingHubLog: {
      insert: async (data: dl.InsertMovingHubLog) => {
        const result = await db
          .insert(dl.movingHubLog)
          .values(data)
          .returning({ id: dl.movingHubLog.id })
        return result[0].id
      },
    },
    propertyHelperApplication: {
      insert: async (data: dl.InsertPropertyHelperApplication) => {
        const result = await db
          .insert(dl.propertyHelperApplication)
          .values(data)
          .returning({ id: dl.propertyHelperApplication.id })
        return result[0].id
      },
      hasRecord: async (MatterId: number) => {
        const result = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(dl.propertyHelperApplication)
          .innerJoin(
            dl.conveyancingService,
            eq(
              dl.conveyancingService.id,
              dl.propertyHelperApplication.conveyancingServiceId,
            ),
          )
          .where(eq(dl.conveyancingService.matterId, MatterId))
        return result[0].count > 0
      },
    },
    dataSource: {
      findBySubSource: async (subSource: string) => {
        const result = await db
          .select({ source_id: dl.dataSource.id })
          .from(dl.dataSource)
          .where(eq(dl.dataSource.subSource, subSource))
        return result
      },
      findBySource: async (sourceName: string, subSource: string) => {
        const result = await db
          .select({ source_id: dl.dataSource.id })
          .from(dl.dataSource)
          .where(
            and(
              eq(dl.dataSource.sourceName, sourceName),
              eq(dl.dataSource.subSource, subSource),
            ),
          )
        return result
      },
      getAll: async () => {
        const result = await db.select().from(dl.dataSource)
        return result
      },
    },
    userIdentity: {
      findByCrmPersonID: async (personId: number) => {
        const result = await db
          .select()
          .from(dl.userIdentity)
          .where(eq(dl.userIdentity.crmPersonId, personId))
        return result
      },
      hasCrmPerson: async (personId: number) => {
        const result = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(dl.userIdentity)
          .where(eq(dl.userIdentity.crmPersonId, personId))
        return result[0].count > 0
      },
      findByUserId: async (userId: number) => {
        const result = await db
          .select()
          .from(dl.userIdentity)
          .where(eq(dl.userIdentity.userId, userId))
        return result
      },
      insert: async (data: dl.InsertUserIdentitySchema) => {
        const result = await db
          .insert(dl.userIdentity)
          .values(data)
          .returning({ id: dl.userIdentity.id })
        return result[0].id
      },
      update: async (userId: number, data: dl.InsertUserIdentitySchema) => {
        const result = await db
          .update(dl.userIdentity)
          .set(data)
          .where(eq(dl.userIdentity.userId, userId))
        return result
      },
    },
    transactionType: {
      findByCode: async (code: string) => {
        const result = await db
          .select({
            id: dl.transactionType.id,
            isOnlineConversion: dl.transactionType.isOnlineConversion,
          })
          .from(dl.transactionType)
          .where(eq(dl.transactionType.code, code))
        return result
      },
    },
    propertyType: {
      findByCode: async (code: string) => {
        const result = await db
          .select({ id: dl.propertyType.id })
          .from(dl.propertyType)
          .where(eq(dl.propertyType.code, code))
        return result
      },
    },
    state: {
      findByCode: async (code: string) => {
        const result = await db
          .select({
            id: dl.state.id,
            supported: dl.state.supported,
            isOnlineConversion: dl.state.isOnlineConversion,
            pipedriveId: dl.state.pdStateId,
          })
          .from(dl.state)
          .where(eq(dl.state.code, code))
        return result
      },
      getById: async (id: number) => {
        const result = await db
          .select({
            id: dl.state.id,
            supported: dl.state.supported,
            isOnlineConversion: dl.state.isOnlineConversion,
            pipedriveId: dl.state.pdStateId,
          })
          .from(dl.state)
          .where(eq(dl.state.id, id))
        return result
      },
    },
    transactionTime: {
      findByCode: async (code: string) => {
        const result = await db
          .select({ id: dl.transactionTime.id })
          .from(dl.transactionTime)
          .where(eq(dl.transactionTime.code, code))
        return result
      },
    },
    brand: {
      findByCode: async (code: string) => {
        const result = await db
          .select({ id: dl.brand.id })
          .from(dl.brand)
          .where(eq(dl.brand.code, code))
        return result
      },
    },
    serviceType: {
      findByCode: async (code: string) => {
        const result = await db
          .select({ id: dl.serviceType.id })
          .from(dl.serviceType)
          .where(eq(dl.serviceType.code, code))
        return result
      },
    },
    transactionStage: {
      findByCode: async (code: string) => {
        const result = await db
          .select({ id: dl.transactionStage.id })
          .from(dl.transactionStage)
          .where(eq(dl.transactionStage.code, code))
        return result
      },
    },
    segment: {
      findByCode: async (code: string) => {
        const result = await db
          .select({ id: dl.segment.id })
          .from(dl.segment)
          .where(eq(dl.segment.code, code))
        return result
      },
    },
    transactionStatus: {
      findByCode: async (code: string) => {
        const result = await db
          .select({ id: dl.transactionStatus.id })
          .from(dl.transactionStatus)
          .where(eq(dl.transactionStatus.code, code))
        return result
      },
    },
    offerCode: {
      findByOfferCode: async (code: string) => {
        const result = await db
          .select({
            offerCode: dl.offerCode.offerCode,
            pipedriveOfferId: dl.offerCode.pipedriveOfferId,
          })
          .from(dl.offerCode)
          .where(eq(dl.offerCode.offerCode, code))
        return result
      },
    },
    userProfile: {
      checkDuplicate: async (data: DuplicateUserCondition) => {
        const result = await checkDuplicateUserProfile(db, data)
        return result
      },
      checkDuplicateCorrection: async (data: DuplicateUserCondition) => {
        const result = await checkDuplicateUserCorrection(db, data)
        return result
      },
      insert: async (data: dl.InsertUserProfileSchema) => {
        const result = await db
          .insert(dl.userProfile)
          .values(data)
          .returning({ id: dl.userProfile.id })
        return result[0].id
      },
      update: async (userId: number, data: dl.InsertUserProfileSchema) => {
        const result = await db
          .update(dl.userProfile)
          .set(data)
          .where(eq(dl.userProfile.id, userId))
        return result
      },
      findByUserId: async (userId: number) => {
        const result = await db
          .select()
          .from(dl.userProfile)
          .where(eq(dl.userProfile.id, userId))
        return result
      },
    },
    userProfileHistory: {
      insert: async (data: dl.UserProfileHistorySchema) => {
        const result = await db
          .insert(dl.userProfileHistory)
          .values(data)
          .returning({ id: dl.userProfileHistory.id })
        return result[0].id
      },
    },
    leads: {
      insert: async (data: dl.InsertLeadsSchema) => {
        const result = await db
          .insert(dl.leads)
          .values(data)
          .returning({ id: dl.leads.id })
        return result[0].id
      },
      update: async (leadId: number, data: dl.InsertLeadsSchema) => {
        const result = await db
          .update(dl.leads)
          .set(data)
          .where(eq(dl.leads.id, leadId))
        return result
      },
      getAll: async () => {
        const result = await db.select().from(dl.leads)
        return result
      },
      checkDuplicate: async (data: DuplicateLeadCondition) => {
        const result = await checkDuplicateLead(db, data)
        return result
      },
      getDuplicateLead: async (id: number) => {
        const result = await db
          .select()
          .from(dl.leads)
          .where(
            and(eq(dl.leads.id, id), isNotNull(dl.leads.transactionServiceId)),
          )
          .orderBy(desc(dl.leads.created))
        return result
      },
      getByID: async (id: number) => {
        const result = await db
          .select()
          .from(dl.leads)
          .where(eq(dl.leads.id, id))
        return result
      },
      getNewLeads: async (limit: number = 10) => {
        const result = await db
          .select({
            lead: dl.leads,
            transactionCode: dl.transactionType.code,
            transactionTypeName: dl.transactionType.name,
            propertyTypeName: dl.propertyType.name,
            propertyCode: dl.propertyType.code,
            stateCode: dl.state.code,
            stateName: dl.state.name,
          })
          .from(dl.leads)
          .leftJoin(
            dl.transactionType,
            eq(dl.transactionType.id, dl.leads.transactionTypeId),
          )
          .leftJoin(
            dl.propertyType,
            eq(dl.propertyType.id, dl.leads.propertyTypeId),
          )
          .leftJoin(dl.state, eq(dl.state.id, dl.leads.stateId))
          .where(
            and(
              eq(dl.leads.publishToTeams, false),
              eq(dl.leads.brandId, brandId.CCA),
              inArray(dl.leads.statusReasonId, [
                datalakeLeadStatus.new,
                datalakeLeadStatus.alreadyExists,
                datalakeLeadStatus.correction,
              ]),
            ),
          )
          .orderBy(asc(dl.leads.created))
          .limit(limit)
        return result
      },
      checkDuplicateOto: async (data: DuplicateLeadOtoCondition) => {
        const result = await checkDuplicateOtoLead(db, data)
        return result
      },
    },
    racvMembership: {
      insert: async (data: dl.InsertRacvMembershipSchema) => {
        const result = await db
          .insert(dl.racvMembership)
          .values(data)
          .returning({ id: dl.racvMembership.id })
        return result[0].id
      },
      findByMembershipNo: async (membershipNo: string) => {
        const result = await db
          .select()
          .from(dl.racvMembership)
          .where(eq(dl.racvMembership.membershipNo, membershipNo))
        return result
      },
      findByLeadId: async (leadId: number) => {
        const result = await db
          .select()
          .from(dl.racvMembership)
          .where(eq(dl.racvMembership.leadId, leadId))
        return result
      },
    },
    developerLog: {
      insert: async (data: dl.InsertDeveloperLogSchema) => {
        const result = await db
          .insert(dl.developerLog)
          .values(data)
          .returning({ id: dl.developerLog.id })
        return result[0].id
      },
    },
    leadStatus: {
      findByName: async (name: string) => {
        const result = await db
          .select({ id: dl.leadStatus.id })
          .from(dl.leadStatus)
          .where(eq(dl.leadStatus.name, name))
        return result
      },
    },
    statusReason: {
      findByName: async (name: string) => {
        const result = await db
          .select({ id: dl.statusReason.id })
          .from(dl.statusReason)
          .where(eq(dl.statusReason.name, name))
        return result
      },
    },
    leadSourceCategory: {
      findBySource: async (source: string) => {
        const result = await db
          .select()
          .from(dl.leadSourceCategory)
          .where(
            and(
              eq(dl.leadSourceCategory.source, source),
              eq(dl.leadSourceCategory.brandId, brandId.CCA),
              isNull(dl.leadSourceCategory.deleted),
            ),
          )
        return result
      },
    },
    userSubscription: {
      insert: async (data: dl.InsertUserSubscriptionSchema) => {
        const result = await db
          .insert(dl.userSubscription)
          .values(data)
          .returning({ id: dl.userSubscription.id })
        return result[0].id
      },
      findByUserId: async (userId: number) => {
        const result = await db
          .select()
          .from(dl.userSubscription)
          .where(
            and(
              eq(dl.userSubscription.userId, userId),
              eq(dl.userSubscription.brandId, brandId.CCA),
            ),
          )
        return result
      },
      update: async (userId: number, data: dl.InsertUserSubscriptionSchema) => {
        const result = await db
          .update(dl.userSubscription)
          .set(data)
          .where(eq(dl.userSubscription.userId, userId))
        return result
      },
      findByUserEmail: async (email: string) => {
        const result = await db
          .select({
            id: dl.userSubscription.id,
            userId: dl.userSubscription.userId,
          })
          .from(dl.userSubscription)
          .innerJoin(
            dl.userProfile,
            eq(dl.userProfile.id, dl.userSubscription.userId),
          )
          .where(
            and(
              eq(dl.userProfile.email, email),
              isNull(dl.userSubscription.emailUnsubscribed),
              isNull(dl.userSubscription.smsUnsubscribed),
              isNull(dl.userSubscription.phoneUnsubscribed),
            ),
          )
        return result
      },
    },
    userSubscriptionHistory: {
      insert: async (data: dl.UserSubscriptionHistorySchema) => {
        const result = await db
          .insert(dl.userSubscriptionHistory)
          .values(data)
          .returning({ id: dl.userSubscriptionHistory.id })
        return result[0].id
      },
    },
    propertyTransaction: {
      insert: async (data: dl.InsertPropertyTransactionSchema) => {
        const result = await db
          .insert(dl.propertyTransaction)
          .values(data)
          .returning({ id: dl.propertyTransaction.id })
        return result[0].id
      },
      update: async (
        userId: number,
        data: dl.InsertPropertyTransactionSchema,
      ) => {
        const result = await db
          .update(dl.propertyTransaction)
          .set(data)
          .where(eq(dl.propertyTransaction.userId, userId))
        return result
      },
      findByUserId: async (userId: number) => {
        const result = await db
          .select()
          .from(dl.propertyTransaction)
          .where(eq(dl.propertyTransaction.userId, userId))
        return result
      },
    },
    userSegment: {
      insert: async (data: dl.InsertUserSegmentSchema) => {
        const result = await db
          .insert(dl.userSegment)
          .values(data)
          .returning({ id: dl.userSegment.id })
        return result[0].id
      },
      findByUserId: async (userId: number) => {
        const result = await db
          .select()
          .from(dl.userSegment)
          .where(eq(dl.userSegment.userId, userId))
        return result
      },
      update: async (userId: number, data: dl.InsertUserSegmentSchema) => {
        const result = await db
          .update(dl.userSegment)
          .set(data)
          .where(eq(dl.userSegment.userId, userId))
        return result
      },
    },
    userSegmentHistory: {
      insert: async (data: dl.UserSegmentHistorySchema) => {
        const result = await db
          .insert(dl.userSegmentHistory)
          .values(data)
          .returning({ id: dl.userSegmentHistory.id })
        return result[0].id
      },
    },
    leadCampaignTrigger: {
      insert: async (data: dl.InsertLeadCampaignTriggerSchema) => {
        const result = await db
          .insert(dl.leadCampaignTrigger)
          .values(data)
          .returning({ id: dl.leadCampaignTrigger.id })
        return result[0].id
      },
      findByCampaign: async (campaign: string) => {
        const result = await db
          .select()
          .from(dl.leadCampaignTrigger)
          .where(eq(dl.leadCampaignTrigger.campaign, campaign))
        return result
      },
      getTrigger: async (data: string) => {
        const result = await getCampaignTrigger(db, data)
        return result
      },
    },
    pipedriveDdLists: {
      getPipedriveId: async (fieldName: string, code: string) => {
        const result = await db
          .select({ pipedriveId: dl.pipedriveDdLists.pipedriveId })
          .from(dl.pipedriveDdLists)
          .where(
            and(
              eq(dl.pipedriveDdLists.code, code),
              eq(dl.pipedriveDdLists.brandId, brandId.CCA),
              eq(dl.pipedriveDdLists.fieldName, fieldName),
            ),
          )
        return result
      },
    },
    pipedriveUserList: {
      getPipedriveToken: async (userId: string) => {
        const result = await db
          .select({ token: dl.pipedriveUserList.pdUserToken })
          .from(dl.pipedriveUserList)
          .where(
            and(
              eq(dl.pipedriveUserList.pdUserId, userId),
              eq(dl.pipedriveUserList.brandId, brandId.CCA),
              eq(dl.pipedriveUserList.isEnabled, true),
            ),
          )
        return result
      },
    },
    otoLinking: {
      insert: async (data: dl.InsertOtoLinking) => {
        const result = await db
          .insert(dl.otoLinking)
          .values(data)
          .returning({ id: dl.otoLinking.id })
        return result[0].id
      },
      update: async (id: number, data: dl.InsertOtoLinking) => {
        const result = await db
          .update(dl.otoLinking)
          .set(data)
          .where(eq(dl.otoLinking.id, id))
        return result
      },
      getByUserId: async (userId: number) => {
        const result = await db
          .select()
          .from(dl.otoLinking)
          .where(eq(dl.otoLinking.userId, userId))
        return result
      },
      getByOtoOfferId: async (otoOfferId: string) => {
        const result = await db
          .select()
          .from(dl.otoLinking)
          .where(eq(dl.otoLinking.otoOfferIdHash, otoOfferId))
        return result
      },
      getByOtoListingIdBuyerId: async (
        otoListingId: string,
        otoBuyerId: string,
      ) => {
        const result = await db
          .select()
          .from(dl.otoLinking)
          .where(
            and(
              eq(dl.otoLinking.otoListingIdHash, otoListingId),
              eq(dl.otoLinking.otoBuyerIdHash, otoBuyerId),
            ),
          )
        return result
      },
      getByOtoListingIdUserId: async (otoListingId: string, userId: number) => {
        const result = await db
          .select()
          .from(dl.otoLinking)
          .where(
            and(
              eq(dl.otoLinking.otoListingIdHash, otoListingId),
              eq(dl.otoLinking.userId, userId),
            ),
          )
        return result
      },
    },
    conveyancingPayment: {
      insert: async (data: dl.InsertConveyancingPaymentSchema) => {
        const result = await db
          .insert(dl.conveyancingPayment)
          .values(data)
          .returning({ id: dl.conveyancingPayment.id })
        return result[0].id
      },
      findByMatterId: async (matterId: number) => {
        const result = await db
          .select()
          .from(dl.conveyancingPayment)
          .where(eq(dl.conveyancingPayment.matterId, matterId))
          .orderBy(desc(dl.conveyancingPayment.created))
        return result[0]
      },
    },
  }
}

export const conveyancingDetails = (
  db: NodePgDatabase<typeof dl>,
  matterId: number,
) =>
  db
    .select({
      conveyancingServiceId: dl.conveyancingService.id,
      userId: dl.conveyancingParty.userId,
      transId: dl.conveyancingService.transactionServiceId,
    })
    .from(dl.conveyancingService)
    .innerJoin(
      dl.conveyancingParty,
      eq(dl.conveyancingParty.conveyancingServiceId, dl.conveyancingService.id),
    )
    .where(eq(dl.conveyancingService.matterId, matterId))

export const checkDuplicateUserProfile = async (
  db: NodePgDatabase<typeof dl>,
  data: DuplicateUserCondition,
): Promise<number> => {
  let cond = and(
    or(
      and(
        eq(dl.userProfile.fullName, data.fullName),
        eq(dl.userProfile.email, data.email),
        eq(dl.userProfile.mobile, data.phone),
      ),
      and(
        eq(dl.userProfile.firstName, data.firstName),
        eq(dl.userProfile.lastName, data.lastName),
        eq(dl.userProfile.email, data.email),
        eq(dl.userProfile.mobile, data.phone),
      ),
    ),
  )

  if (!data.email) {
    cond = or(
      and(
        eq(dl.userProfile.fullName, data.fullName),
        eq(dl.userProfile.mobile, data.phone),
      ),
      and(
        eq(dl.userProfile.firstName, data.firstName),
        eq(dl.userProfile.lastName, data.lastName),
        eq(dl.userProfile.mobile, data.phone),
      ),
    )
  }

  if (!data.lastName) {
    cond = or(
      and(
        eq(dl.userProfile.fullName, data.fullName),
        eq(dl.userProfile.email, data.email),
        eq(dl.userProfile.mobile, data.phone),
      ),
      and(
        eq(dl.userProfile.firstName, data.firstName),
        eq(dl.userProfile.email, data.email),
        eq(dl.userProfile.mobile, data.phone),
      ),
    )
  }

  const res = await db
    .select({ id: dl.userProfile.id })
    .from(dl.userProfile)
    .where(cond)
    .limit(1)

  return res.length > 0 ? res[0].id : 0
}

export const checkDuplicateUserCorrection = async (
  db: NodePgDatabase<typeof dl>,
  data: DuplicateUserCondition,
) => {
  const condition = sql`( (((CASE WHEN ${dl.userProfile.fullName} = ${data.fullName} THEN 1 ELSE 0 END) +
                  (CASE WHEN ${dl.userProfile.email} = ${data.email} THEN 1 ELSE 0 END) +
                  (CASE WHEN ${dl.userProfile.mobile} = ${data.phone} THEN 1 ELSE 0 END) ) = 2 )
                  OR (((CASE WHEN ${dl.userProfile.firstName} = ${data.firstName} THEN 1 ELSE 0 END) +
                  (CASE WHEN ${dl.userProfile.lastName} = ${data.lastName} THEN 1 ELSE 0 END) +
                  (CASE WHEN ${dl.userProfile.email} = ${data.email} THEN 1 ELSE 0 END) +
                  (CASE WHEN ${dl.userProfile.mobile} = ${data.phone} THEN 1 ELSE 0 END) ) = 3) )`

  /* TODO
  if (data.Oto) {
    condition = sql`${condition} AND ${dl.userProfile.email} = ${data.Email}`
  }*/

  const res = await db
    .select({ id: dl.userProfile.id })
    .from(dl.userProfile)
    .where(condition)
    .limit(1)

  return res.length > 0 ? res[0].id : 0
}

export const checkDuplicateLead = async (
  db: NodePgDatabase<typeof dl>,
  data: DuplicateLeadCondition,
) => {
  const selectQuery = {
    id: dl.leads.id,
    utmsource: sql<number>`CASE WHEN ${dl.leads.utmSource} = ${data.UtmSource} THEN 1 ELSE 0 END`,
    transtype: sql<number>`CASE WHEN ${dl.leads.transactionTypeId} = ${data.TransactionTypeID} THEN 1 ELSE 0 END`,
    proptype: sql<number>`CASE WHEN ${dl.leads.propertyTypeId} = ${data.PropertyTypeID} THEN 1 ELSE 0 END`,
    state: sql<number>`CASE WHEN ${dl.leads.stateId} = ${data.StateID} THEN 1 ELSE 0 END`,
    transtime: sql<number>`CASE WHEN ${dl.leads.timeToTransactId} = ${data.TimeToTransactID} THEN 1 ELSE 0 END`,
    timedatediff: sql<number>`date_part('day', ${data.CreatedDataInput}::timestamp AT TIME ZONE 'Australia/Melbourne' - ${dl.leads.created}::timestamp AT TIME ZONE 'Australia/Melbourne') * 24 +
    date_part('hour', ${data.CreatedDataInput}::timestamp AT TIME ZONE 'Australia/Melbourne' - ${dl.leads.created}::timestamp AT TIME ZONE 'Australia/Melbourne') * 60 +
    date_part('minute', ${data.CreatedDataInput}::timestamp AT TIME ZONE 'Australia/Melbourne' - ${dl.leads.created}::timestamp AT TIME ZONE 'Australia/Melbourne')`,
  }

  const conditionTime = sql`
    (date_part('day', ${data.CreatedDataInput}::timestamp AT TIME ZONE 'Australia/Melbourne' - "Created"::timestamp AT TIME ZONE 'Australia/Melbourne') * 24 +
    date_part('hour', ${data.CreatedDataInput}::timestamp AT TIME ZONE 'Australia/Melbourne' - "Created"::timestamp AT TIME ZONE 'Australia/Melbourne') * 60 +
    date_part('minute', ${data.CreatedDataInput}::timestamp AT TIME ZONE 'Australia/Melbourne' - "Created"::timestamp AT TIME ZONE 'Australia/Melbourne')) <= 3
  `

  const condition = sql`
    ${conditionTime} AND "UserID" = ${data.UserID} AND
    ((CASE WHEN "utmSource" = ${data.UtmSource} THEN 1 ELSE 0 END) +
    (CASE WHEN "TransactionTypeID" = ${data.TransactionTypeID} THEN 1 ELSE 0 END) +
    (CASE WHEN "PropertyTypeID" = ${data.PropertyTypeID} THEN 1 ELSE 0 END) +
    (CASE WHEN "StateID" = ${data.StateID} THEN 1 ELSE 0 END) +
    (CASE WHEN "TimeToTransactID" = ${data.TimeToTransactID} THEN 1 ELSE 0 END)) >= 3 
    AND ${dl.leads.transactionServiceId} is not null
  `

  const res = await db
    .select(selectQuery)
    .from(dl.leads)
    .where(condition)
    .orderBy(desc(dl.leads.created))
    .limit(1)

  return res.length > 0 ? res[0] : 0
}

const getCampaignTrigger = async (
  db: NodePgDatabase<typeof dl>,
  data: string,
) => {
  const ofcHrCat = getOfficeHourCategory()
  let campTrigger = ''

  const query = await db
    .select()
    .from(dl.leadCampaignTrigger)
    .where(
      and(
        eq(dl.leadCampaignTrigger.brandId, brandId.CCA),
        eq(dl.leadCampaignTrigger.campaign, `${data}`),
        isNull(dl.leadCampaignTrigger.deleted),
        eq(dl.leadCampaignTrigger.isEnabled, true),
      ),
    )

  const resCampTrigger = query[0]?.trigger ?? null

  if (resCampTrigger) {
    campTrigger = resCampTrigger
  } else {
    if (ofcHrCat === 1) {
      // weekday in hours
      campTrigger = ''
    } else if (ofcHrCat === 3) {
      // Weekend
      campTrigger = 'Weekend'
    } else if (ofcHrCat === 2) {
      // Weeknight
      campTrigger = 'Weeknight'
    }
  }

  return campTrigger
}

export const checkDuplicateOtoLead = async (
  db: NodePgDatabase<typeof dl>,
  data: DuplicateLeadOtoCondition,
) => {
  const oto = await db
    .select()
    .from(dl.leads)
    .where(
      and(
        eq(dl.leads.otoOfferIdHash, data.otoOfferIdHash),
        ne(dl.leads.otoProduct, data.otoProduct),
      ),
    )
    .limit(1)

  return oto.length > 0 ? oto[0] : null
}
