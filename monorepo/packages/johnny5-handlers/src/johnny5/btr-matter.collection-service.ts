import {
  ActionStepService,
  type CollectionRecordValuePut,
  type RecordData,
} from '@dbc-tech/actionstep'
import type { Logger } from '@dbc-tech/logger'
import { getMatterUpdatedAction } from '../johnny5/btr/utils/matter-activity-update-utils'

export class BtrCollectionHelper {
  private logger: Logger
  private actionstep: ActionStepService
  private matterId: number

  constructor(
    readonly as: ActionStepService,
    readonly xlogger: Logger,
    readonly matter_id: number,
  ) {
    this.logger = xlogger
    this.actionstep = as
    this.matterId = matter_id
  }

  async getCollectionRecords(
    dataCollectionIds: Record<string, number>,
    colFields: Record<string, string>,
  ): Promise<{ data: RecordData[] } | undefined> {
    const collectionRecords: RecordData[] = []
    const dataCollectionIdValues = new Set(Object.values(dataCollectionIds))

    await this.logger.info(`getCollectionRecords(+) @matterId:${this.matterId}`)

    const fetchCollectionRecords = async (
      page: number,
    ): Promise<string | undefined> => {
      const xparam = {
        action: `${this.matterId}`,
        pageSize: `200`,
        page: `${page}`,
      }

      await this.logger.debug(
        `getCollectionRecords(*) @matterId:${this.matterId} #fetchCollectionRecords xparam: ${JSON.stringify(
          xparam,
        )}`,
      )

      const response =
        await this.actionstep.getDataCollectionRecordValues(xparam)
      if (!response || !response.datacollectionrecordvalues) {
        await this.logger.warn(`No data found for @matterId:${this.matterId}`)
        return undefined
      }

      response.datacollectionrecordvalues.forEach((el) => {
        const [, cfieldId, dataCollectionId] = el.id?.split('--') ?? []

        const isMatchingRecord =
          dataCollectionId &&
          dataCollectionIdValues.has(Number(el.links?.dataCollection)) &&
          Object.hasOwn(colFields, cfieldId)

        if (isMatchingRecord) {
          collectionRecords.push(el)
        }
      })
      return (
        response.meta.paging.datacollectionrecordvalues.nextPage ?? undefined
      )
    }

    const delay = async (ms: number): Promise<void> => {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    let page = 1
    const maxPages = 5
    let pagesFetched = 0

    while (pagesFetched < maxPages) {
      await delay(2000)
      const nextPage = await fetchCollectionRecords(page)
      if (!nextPage) break
      page++
      pagesFetched++
    }

    await this.logger.info(
      `getCollectionRecords(-) @matterId:${this.matterId} #collectionRecords `,
      collectionRecords,
    )

    return collectionRecords.length > 0
      ? { data: collectionRecords }
      : undefined
  }

  async processMatterCollectionRecords(
    crefRecords: RecordData[] | undefined,
    incomingCollectionData: Record<string, string>,
  ) {
    await this.logger.debug(
      `processMatterCollectionRecords(+) @matterId:${this.matterId} #crefRecords length: ${crefRecords?.length}`,
      crefRecords?.map((r) => {
        return { id: r.id, v: r.stringValue }
      }),
    )

    const getFieldNameValue = (
      records: RecordData[],
      targetFieldname: string,
    ): string | undefined => {
      const record = records.find(({ id }) => {
        const parts = id.split('--')
        if (parts.length !== 3) return false
        const [, fieldname] = parts
        return fieldname === targetFieldname
      })

      const value = record?.stringValue
      return value ?? undefined
    }

    if (crefRecords) {
      const natureProperty = getFieldNameValue(crefRecords, 'propnat')
      await this.logger.info(
        `processMatterCollectionRecords(*) @matterId:${this.matterId} #natureProperty: ${natureProperty}`,
      )

      for (const row of crefRecords) {
        const { id, links, stringValue } = row
        const { dataCollection, dataCollectionField, dataCollectionRecord } =
          links
        const keyField = id.split('--')
        const index = keyField[1]

        const sourceDataField = incomingCollectionData[index]

        await this.logger.debug(
          `processMatterCollectionRecords(*) @matterId:${this.matterId} stringValue:${stringValue} #index: ${index} sourceDataField: ${sourceDataField}`,
        )

        if (
          (sourceDataField || '').length > 0 &&
          sourceDataField !== 'undefined'
        ) {
          const { status, action } = getMatterUpdatedAction(
            index,
            sourceDataField,
            stringValue ?? '',
            natureProperty === 'Vacant Land',
          )
          await this.logger.debug(
            `processMatterCollectionRecords(*) @matterId:${this.matterId} #actionStatus: ${status}`,
            {
              sourceDataField,
              stringValue,
              index,
              action,
            },
          )

          if (status === 'skipField') {
            await this.logger.info(
              `processMatterCollectionRecords(*) @matterId:${this.matterId} #Skipping field: ${index}`,
            )
            continue
          }

          const postCollectionRecord: CollectionRecordValuePut = {
            datacollectionrecordvalues: {
              stringValue: sourceDataField,
              links: {
                action: `${this.matterId}`,
                dataCollectionField: dataCollectionField!,
                dataCollectionRecord: dataCollectionRecord!,
                dataCollection: dataCollection!,
              },
            },
          }
          await this.logger.debug(
            `processMatterCollectionRecords(*) @matterId:${this.matterId} #Updating collection record value with payload: dataCollectionRecordValueId: ${id} => ${JSON.stringify(
              postCollectionRecord,
            )}`,
          )

          const res = await this.actionstep.updateDataCollectionRecordValue(
            id,
            postCollectionRecord,
          )
          await this.logger.debug(
            `processMatterCollectionRecords(*) @matterId:${this.matterId} #Updated <${index}> collection record: ${res.datacollectionrecordvalues.id} with value: ${res.datacollectionrecordvalues.stringValue}`,
          )
        }
      }
    }
  }

  async createDataCollectionIgnoreResponse(dataCollectionId: number) {
    const param = {
      datacollectionrecords: {
        links: {
          action: `${this.matterId}`,
          dataCollection: `${dataCollectionId}`,
        },
      },
    }
    try {
      const collection = await this.actionstep.createDataCollectionRecord(param)
      await this.logger.debug(
        `createDataCollectionIgnoreResponse(*) @matterId:${this.matterId} #Created new collection cid: ${collection.datacollectionrecords.id}`,
      )
    } catch (error) {
      await this.logger.error(
        `createDataCollectionIgnoreResponse(-) @matterId:${this.matterId} #Ignore/Error creating new collections: `,
        error,
      )
    }
  }
}
