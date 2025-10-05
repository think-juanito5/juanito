import { ccaMatterConstants, ccaParticipantTypes } from '@dbc-tech/actionstep'
import { and, desc, eq, sql } from 'drizzle-orm'
import { type NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres'
import type { PoolClient } from 'pg'
import * as asr from '../schemas/drizzle/asreplica.schema'

export type ASReplicaQuery = ReturnType<typeof asreplicaQuery>
export const asreplicaQuery = (client: PoolClient) => {
  const db = drizzle(client, { schema: asr })
  return {
    client,
    matter: {
      findByMatterId: async (matterId: number) => {
        const result = await db
          .select()
          .from(asr.action)
          .where(eq(asr.action.actionId, matterId))
        return result
      },
      findPrimaryClientParticipantByMatterId: async (matterId: number) => {
        const result = await matterClientPrimaryParticipant(db, matterId)
        const typeId = +(result?.[0]?.type ?? 0)
        result[0].type = ccaParticipantTypes[typeId]
        return result
      },
      findStepNameByStepNumber: async (
        actionTypeId: number,
        stepNumber: number,
      ) => {
        const result = await db
          .select({ stepName: asr.step.stepName })
          .from(asr.step)
          .where(
            and(
              eq(asr.step.actionTypeId, actionTypeId),
              eq(asr.step.stepNumber, stepNumber),
            ),
          )
        return result
      },
      findAssignedToById: async (participantId: number) => {
        const result = await db
          .select({ displayName: asr.participant.displayName })
          .from(asr.participant)
          .where(eq(asr.participant.participantId, participantId))
        return result
      },
      findMatterByParticipantId: async (participantId: number) => {
        const result = await db
          .select({ matterId: asr.actionParticipant.actionId })
          .from(asr.actionParticipant)
          .where(eq(asr.actionParticipant.participantId, participantId))
          .orderBy(desc(asr.actionParticipant.actionId))
          .limit(1)
        return result
      },
      findMatterDetailsForPH: async (matterId: number) => {
        const result = await matterDetailsForPropertyHelper(db, matterId)
        return result
      },
    },
    collectionRecord: {
      findCollectionRecordByMatterId: async (matterId: number) => {
        const result = await db
          .select({
            actionId: asr.dataFieldValue.actionId,
            dataFieldName: asr.dataFieldValue.dataFieldName,
            dataCollectionId: asr.dataFieldValue.dataCollectionId,
            recordId: asr.dataFieldValue.recordId,
            stringValue: asr.dataFieldValue.stringValue,
          })
          .from(asr.dataFieldValue)
          .where(eq(asr.dataFieldValue.actionId, matterId))
        return result
      },
      findCollectionRecordByMatterIdV2: async (matterId: number) => {
        const result = await matterCollectionRecords(db, matterId)
        return result
      },
    },
    tasks: {
      findTasksByMatterId: async (matterId: number) => {
        const result = await db
          .select({ task_id: asr.task.taskId })
          .from(asr.task)
          .where(eq(asr.task.actionId, matterId))
        return result
      },
      findByTaskId: async (taskId: number, matterId: number) => {
        const result = await db
          .select()
          .from(asr.task)
          .where(
            and(eq(asr.task.taskId, taskId), eq(asr.task.actionId, matterId)),
          )
        return result
      },
    },
  }
}

export type MatterBaseType = typeof asr.action.$inferSelect

export const matterClientPrimaryParticipant = (
  db: NodePgDatabase<typeof asr>,
  matterId: number,
) =>
  db
    .select({
      id: asr.actionParticipant.participantId,
      firstName: asr.participant.firstName,
      lastName: asr.participant.lastName,
      middleName: asr.participant.middleName,
      displayName: asr.participant.displayName,
      email: asr.participant.eMail,
      WorkPhone: asr.participant.phone1,
      MobilePhone: asr.participant.phone1,
      HomePhone: asr.participant.phone1,
      participantTypeId: asr.actionParticipant.participantTypeId,
      occupation: asr.participant.occupation,
      isCompany: asr.participant.companyFlag,
      title: asr.participant.salutation,
      gender: asr.participant.gender,
      maritalStatus: asr.participant.maritalStatus,
      preferredName: asr.participant.preferredName,
      birthTimestamp: asr.participant.dateOfBirth,
      deathTimestamp: asr.participant.dateOfDeath,
      type: sql<string>`CAST(${asr.participantType.participantTypeId} AS CHAR(50))`,
      mailingAddress: {
        state: asr.participant.mailingStateProvince,
        suburb: asr.participant.mailingAddressLine2,
        postcode: asr.participant.mailingPostCode,
        street_name: asr.participant.mailingAddressLine1,
      },
      physicalAddress: {
        state: asr.participant.stateProvince,
        suburb: asr.participant.addressLine2,
        postcode: asr.participant.stateProvince,
        street_name: asr.participant.addressLine1,
      },
    })
    .from(asr.actionParticipant)
    .innerJoin(
      asr.participantType,
      eq(
        asr.participantType.participantTypeId,
        asr.actionParticipant.participantTypeId,
      ),
    )
    .innerJoin(
      asr.participant,
      eq(asr.participant.participantId, asr.actionParticipant.participantId),
    )
    .where(
      and(
        eq(
          asr.participantType.participantTypeId,
          ccaMatterConstants.primaryClientParticipantTypeId,
        ),
        eq(asr.actionParticipant.actionId, matterId),
      ),
    )

export const matterCollectionRecords = (
  db: NodePgDatabase<typeof asr>,
  matterId: number,
) =>
  db
    .select({
      dataFieldName: asr.dataFieldValue.dataFieldName,
      dataCollectionId: asr.dataFieldValue.dataCollectionId,
      stringValue: asr.dataFieldValue.stringValue,
      dataCollectionName: asr.dataCollection.dataCollectionName,
    })
    .from(asr.dataFieldValue)
    .innerJoin(
      asr.dataCollection,
      eq(
        asr.dataCollection.dataCollectionId,
        asr.dataFieldValue.dataCollectionId,
      ),
    )
    .where(eq(asr.dataFieldValue.actionId, matterId))
    .orderBy(asr.dataFieldValue.dataCollectionId)

export type MatterTaskType = typeof asr.task.$inferSelect

export const matterDetailsForPropertyHelper = (
  db: NodePgDatabase<typeof asr>,
  matterId: number,
) =>
  db
    .select({
      actionName: asr.action.actionName,
      actionStatus: asr.action.actionStatus,
      actionTypeName: asr.actionType.actionTypeName,
      stepName: asr.step.stepName,
      firstName: asr.participant.firstName,
      lastName: asr.participant.lastName,
      email: asr.participant.eMail,
      phone: asr.participant.phone1,
    })
    .from(asr.action)
    .innerJoin(
      asr.step,
      and(
        eq(asr.step.stepNumber, asr.action.stepNumber),
        eq(asr.step.actionTypeId, asr.action.actionTypeId),
      ),
    )
    .innerJoin(
      asr.actionType,
      eq(asr.actionType.actionTypeId, asr.action.actionTypeId),
    )
    .innerJoin(
      asr.actionParticipant,
      and(
        eq(asr.actionParticipant.actionId, asr.action.actionId),
        eq(asr.actionParticipant.participantTypeId, 72),
      ),
    )
    .innerJoin(
      asr.participant,
      eq(asr.participant.participantId, asr.actionParticipant.participantId),
    )
    .where(eq(asr.action.actionId, matterId))
