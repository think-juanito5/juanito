import {
  type DataInputStatus,
  DatalakeStatus,
  dataSourceTypeId,
  datalakeQuery,
} from '@dbc-tech/datalake'
import type { AustralianState } from '@dbc-tech/johnny5/typebox'
import type { Intent } from '@dbc-tech/johnny5/utils'
import type { Logger } from '@dbc-tech/logger'
import { matterTypeCompatId, matterTypeId } from '@dbc-tech/pipedrive'
import { Pool, type PoolClient } from 'pg'
import { serializeError } from 'serialize-error'
import { dbTimestampMelbourne } from '../../../../utils/date-utils'
import { FixedRequest } from '../../constants'
import { MatterSyncService } from './updater-service'
import type { CalcuMatterUpdateRequest } from './updater-service.types'

export const datalakeMatterUpdater = async (
  datalake: Pool,
  dealId: number,
  matterId: number,
  r: Request,
  logger: Logger,
): Promise<void> => {
  let dlClient: PoolClient | undefined

  try {
    dlClient = await datalake.connect()
    const dlQuery = datalakeQuery(dlClient)
    const sourceIpAddress =
      r.headers.get('x-forwarded-for') ||
      r.headers.get('cf-connecting-ip') ||
      r.headers.get('x-real-ip')

    const xdta = {
      DealID: dealId,
      MatterID: matterId,
    }
    await logger.debug(`datalakeMatterUpdate(*) data: ${JSON.stringify(xdta)}`)

    const inputId = await dlQuery.dataInput.insertData({
      sourceId: dataSourceTypeId.MatterUpdate,
      data: JSON.stringify(xdta),
      status: 'N',
      sourceIpAddress,
      isTest: false,
      created: dbTimestampMelbourne(),
      updated: dbTimestampMelbourne(),
    })

    const transSvc = await dlQuery.transactionService.findByDeal(dealId!)
    await logger.debug(
      `datalakeMatterUpdate(*) transSvc: ${JSON.stringify(transSvc)}`,
    )

    const transSvcId = transSvc?.[0]?.id ?? undefined

    const performDataInputUpdate = async (
      inputId: number,
      status: DataInputStatus,
    ) => {
      const xdata = {
        status,
        completedProcessing: dbTimestampMelbourne(),
      }
      await dlQuery.dataInput.update(inputId, xdata)
    }

    if (!transSvcId) {
      await logger.warn(
        `CrmDealID :${dealId} not found in Datalake transactionService!`,
      )
      await performDataInputUpdate(inputId, DatalakeStatus.notProcessed)
      return
    }

    await dlQuery.transactionService.update(transSvcId, { matterId })

    const transSvcRow = await dlQuery.transactionService.findById(transSvcId)
    if (!transSvcRow || transSvcRow.length === 0) {
      await logger.error(`transactionService Id :${transSvcId} not found!`)
      await performDataInputUpdate(inputId, DatalakeStatus.notProcessed)
      return
    }
    const { version, ...historyData } = transSvcRow[0]

    const historyId =
      await dlQuery.transactionServiceHistory.insert(historyData)
    await performDataInputUpdate(inputId, DatalakeStatus.processingSuccess)
    await logger.info(
      `Updated Deal-Matter in Datalake for Deal:${dealId} Matter:${matterId}`,
      { historyId },
    )
  } catch (error) {
    const errMsg = serializeError(error)
    await logger.error(
      `#Ignore/Error updating Deal-Matter in Datalake for Deal:${dealId} Matter:${matterId}`,
      errMsg,
    )
  } finally {
    if (dlClient) dlClient.release()
  }
}

export type MatterSyncParams = {
  dealId?: number
  matterId: number
  matterName?: string
  state: AustralianState
  intent: Intent
}

export const settlmentCalculatorMatterUpdater = async (
  service: MatterSyncService,
  logger: Logger,
  { dealId, matterId, matterName, state, intent }: MatterSyncParams,
) => {
  try {
    if (!state) {
      throw new Error('State is missing, skipping Calculator update')
    }

    if (!intent) {
      throw new Error('Intent is missing, skipping Calculator update')
    }

    if (!dealId) {
      throw new Error('dealId is missing, skipping Calculator update')
    }

    const mTypeId = matterTypeId[state]
    const actionTypeId = matterTypeCompatId[intent]
      ? `${mTypeId}${matterTypeCompatId[intent]}`
      : `${mTypeId}`

    const data: CalcuMatterUpdateRequest = {
      id: dealId,
      matter_id: matterId,
      file_note: 'EMC Posted Matter',
      matter_type_id: +actionTypeId,
      matter_name: matterName ?? 'Pending Matter',
      assignedto_id: FixedRequest.defaultAssignedId,
      client_id1: FixedRequest.defaultClientId,
      status: FixedRequest.defaultStatus,
    }

    const res = await service.settlementCalcuSyncMatter(data)

    await logger.debug(
      `calcuMatterUpdate(*) data: ${JSON.stringify(data)} #response: `,
      res,
    )
  } catch (error) {
    const errMsg = serializeError(error)
    await logger.error('#Ignore/Error in calcuMatterUpdate: ', errMsg)
  }
}
