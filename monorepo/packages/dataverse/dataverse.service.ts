import { Readable } from 'stream'
import { type HttpServiceConfig, errorFrom } from '@dbc-tech/http'
import { HttpService } from '@dbc-tech/http'
import { isIsoDateString } from '@dbc-tech/johnny5'
import type { Tenant } from '@dbc-tech/johnny5/typebox/common.schema'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import { v4 as uuidv4 } from 'uuid'
import {
  type BespokeTasksFormattedInner,
  type BtrPexaAuditResults,
  type BusinessUnits,
  CBespokeTasks,
  CBtrPexaAuditGet,
  CBtrPexaAuditPostResponse,
  CBtrPexaAuditResults,
  CBusinessUnits,
  CDataverseToken,
  CEntitySet,
  CGenericResponse,
  CMatterAllocations,
  CPrices,
  type EntitySet,
  type GenericResponse,
  type MatterAllocations,
  type Prices,
  type dbcBtrPexaAuditGet,
  type dbcBtrPexaAuditPost,
  type dbcBtrPexaAuditPostResponse,
} from './schema'
import { chunkArray, finalGet, formatter } from './utils'

export type DataverseServiceConfig = {
  clientId: string
  clientSecret: string
  tenantId: string
  tokenUrl: string
  baseUrl: string
  correlationId?: string
  retries?: number
  logger?: Logger
}

export class DataverseService {
  private logger: Logger
  private httpService: HttpService
  private baseUrl: string

  constructor(config: DataverseServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const tokenService = new HttpService({
      baseUrl: config.tokenUrl,
      defaultHeaders: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    const getToken = async (config: DataverseServiceConfig) => {
      const raw: string = `scope=${config.baseUrl}/.default&client_id=${config.clientId}&grant_type=client_credentials&client_secret=${config.clientSecret}`
      const result = await tokenService.post(
        {
          path: `/${config.tenantId}/oauth2/v2.0/token`,
          body: raw,
          customOptions: {
            rawBody: true,
          },
        },
        CDataverseToken,
      )
      if (!result.ok) {
        await this.logger.error(
          `Failed to get token from ${
            config.tokenUrl
          }/${config.tenantId}/oauth2/v2.0/token`,
          result.val,
        )
        throw errorFrom(result.val)
      }
      return result.val.data.access_token
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Accept: 'application/json',
      'x-client-id': config.clientId || 'DataverseService',
      Prefer:
        'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
    }
    if (config.correlationId) headers['x-correlation-id'] = config.correlationId

    const httpServiceConfig: HttpServiceConfig = {
      authHeader: async () => `Bearer ${await getToken(config)}`,
      baseUrl: config.baseUrl,
      defaultHeaders: headers,
      logger: this.logger,
      retries: config.retries ?? 5,
      authFailureBackoffInitialDelay: 250,
    }
    this.baseUrl = config.baseUrl
    this.httpService = new HttpService(httpServiceConfig)
  }

  async odataFormatter<T extends Record<string, unknown>>(
    item: Record<string, unknown>,
  ): Promise<T> {
    const newItem = { ...item }
    delete newItem['@odata.etag']

    // Replace raw values with formatted values where available
    const keys = Object.keys(newItem)
    for (const key in keys) {
      // Check if this is a formatted value field
      if (keys[key].includes('@OData.Community.Display.V1.FormattedValue')) {
        // Extract the base field name (before the @)
        const baseFieldName = keys[key].split('@')[0]
        const raw = newItem[baseFieldName]

        // Replace the raw value with the formatted value
        if (
          baseFieldName in newItem &&
          !(typeof raw === 'string' && isIsoDateString(raw)) && // raw timestamps are better
          !(typeof raw === 'boolean') // raw booleans are better
        ) {
          newItem[baseFieldName] = newItem[keys[key]]
        }

        // Remove the formatted value property
        delete newItem[keys[key]]
      }
    }
    return newItem as T
  }

  async getMetaData(): Promise<Readable> {
    const result = await this.httpService.get({
      path: `/api/data/v9.2/$metadata`,
      headers: {
        'If-None-Match': 'null',
        Accept: 'application/xml',
      },
      customOptions: {
        dataFormat: 'stream',
      },
    })
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data as Readable
  }

  async getEntitySet(): Promise<EntitySet> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2`,
        headers: {
          'If-None-Match': 'null',
        },
      },
      CEntitySet,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async query(
    table: string,
    query: Record<string, string>,
  ): Promise<GenericResponse> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2/${table}`,
        query,
      },
      CGenericResponse,
    )
    if (!result.ok) {
      throw errorFrom(result.val)
    }
    return result.val.data
  }

  async getMatterAllocations(): Promise<MatterAllocations> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2/crcf3_matter_allocations`,
      },
      CMatterAllocations,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getBtrPexaAudits(
    query: Record<string, string>,
  ): Promise<dbcBtrPexaAuditGet> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2/dbc_btr_pexa_audits`,
        query,
      },
      CBtrPexaAuditGet,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getBusinessUnits(): Promise<BusinessUnits> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2/businessunits`,
        query: {
          $select: 'businessunitid,name',
        },
      },
      CBusinessUnits,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async getBusinessUnitByName(name: string): Promise<string> {
    const businessUnits = await this.getBusinessUnits()
    const businessUnit = businessUnits.value.find(
      (bu) => bu.name.toLowerCase() === name.toLowerCase(),
    )
    if (!businessUnit) {
      throw new Error(`Business unit with name ${name} not found`)
    }
    return businessUnit.businessunitid
  }

  async insertBtrPexaAudit(
    data: dbcBtrPexaAuditPost,
  ): Promise<dbcBtrPexaAuditPostResponse> {
    const result = await this.httpService.post(
      {
        path: `/api/data/v9.2/dbc_btr_pexa_audits`,
        body: {
          ...data,
        },
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      },
      CBtrPexaAuditPostResponse,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async getBtrPexaAuditResults(
    query: Record<string, string>,
  ): Promise<BtrPexaAuditResults> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2/dbc_btr_pexa_audit_results`,
        query,
      },
      CBtrPexaAuditResults,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getPricing(query: Record<string, string>): Promise<Prices> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2/dbc_prices`,
        query,
      },
      CPrices,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async getBespokeTasks(
    tenant: Tenant,
    form_id: string,
    actionType: number,
  ): Promise<BespokeTasksFormattedInner> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2/dbc_bespoke_taskses`,
        query: {
          $filter: `owningbusinessunit/name eq '${tenant}' and dbc_typeform_form_id eq '${form_id}' and dbc_actionstep_matter_type eq ${actionType}`,
          $select:
            'dbc_bespoke_tasksid,' +
            'dbc_action_type,' +
            'dbc_actionstep_matter_type,' +
            'dbc_data_collection,' +
            'dbc_datafield,' +
            'dbc_name,' +
            'dbc_stringvalue,' +
            'dbc_task_assignee,' +
            'dbc_task_business_day_offset,' +
            'dbc_task_due_date_anchor,' +
            'dbc_task_due_date_offset,' +
            'dbc_task_name,' +
            'dbc_taskdescription,' +
            'dbc_trigger_type,' +
            'dbc_typeform_answer,' +
            'dbc_typeform_form_id,' +
            'dbc_typeform_question_id,' +
            'dbc_folder,' +
            'dbc_parent_folder,' +
            'dbc_file_trigger_question,' +
            'dbc_file_trigger_response',
          $expand: 'owningbusinessunit($select=name)',
          // $top: '1',
        },
      },
      CBespokeTasks,
    )
    if (!result.ok) throw errorFrom(result.val)

    const out = await Promise.all(
      result.val.data.value.map((item) =>
        this.odataFormatter<BespokeTasksFormattedInner[number]>(item),
      ),
    )
    return out
  }

  async getBespokeTasksTypeformIds(tenant: Tenant): Promise<string[]> {
    const result = await this.httpService.get(
      {
        path: `/api/data/v9.2/dbc_bespoke_taskses`,
        query: {
          $filter: `owningbusinessunit/name eq '${tenant}'`,
          $select: 'dbc_typeform_form_id',
        },
      },
      CBespokeTasks,
    )
    if (!result.ok) throw errorFrom(result.val)
    const typeformIds = result.val.data.value
      .map((task) => task.dbc_typeform_form_id)
      .filter((id): id is string => typeof id === 'string' && !!id)
    return Array.from(new Set(typeformIds)) // Remove duplicates
  }

  async bulkInsert(
    entitySetName: string,
    data: Record<string, unknown>[],
  ): Promise<unknown> {
    if (data.length === 0) {
      throw new Error('No data to upsert')
    }
    const chunks = chunkArray(data, 999)
    const bulk = (
      boundaryId: string,
      chunk: Record<string, unknown>[],
    ): string => {
      let out: string = ''
      chunk.forEach((record) => {
        const objArr: string[] = []
        Object.entries(record).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            objArr.push(`\t"${key}": ${formatter(value)}`)
          }
        })
        out += `Content-Type: application/http\r\n`
        out += `Content-Transfer-Encoding: binary\r\n`
        out += `\r\n`
        out += `POST ${this.baseUrl}/api/data/v9.2/${entitySetName} HTTP/1.1\r\n`
        out += `Content-Type: application/json; type=entry\r\n\r\n{\r\n`
        out += objArr.join(',\r\n')
        out += `\r\n}\r\n--batch_${boundaryId}\r\n`
      })
      return out
    }

    const returnResult = []
    for (const chunk of chunks) {
      const boundaryId = uuidv4()
      let body: string = `--batch_${boundaryId}\r\n`
      body += bulk(boundaryId, chunk)
      body += finalGet(this.baseUrl) + `\r\n`
      body += `--batch_${boundaryId}--\r\n`

      const result = await this.httpService.post({
        path: `/api/data/v9.2/$batch`,
        headers: {
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'If-None-Match': 'null',
          Accept: 'application/json',
          'Content-Type': `multipart/mixed; boundary="batch_${boundaryId}"`,
        },
        body: body,
        customOptions: { rawBody: true },
      })

      if (!result.ok) {
        await this.logger.error(
          `Failed to bulk upsert ${entitySetName}`,
          result.val,
        )
        throw errorFrom(result.val)
      }
      returnResult.push(result.val.data)
    }
    return returnResult
  }

  async bulkUpsert(
    entitySetName: string,
    alternateKey: string[],
    data: Record<string, unknown>[],
  ): Promise<unknown> {
    if (data.length === 0) {
      throw new Error('No data to upsert')
    }
    const chunks = chunkArray(data, 999)
    const bulk = (
      boundaryId: string,
      chunk: Record<string, unknown>[],
    ): string => {
      let out: string = ''
      chunk.forEach((record) => {
        const keyArr: string[] = []
        alternateKey.forEach((key) => {
          keyArr.push(`${key}=${formatter(record[key])}`)
        })
        const outArr: string[] = []
        out += `Content-Type: application/http\r\n`
        out += `Content-Transfer-Encoding: binary\r\n`
        out += `\r\n`
        out += `PATCH ${this.baseUrl}/api/data/v9.2/${entitySetName}(${keyArr.join(',')}) HTTP/1.1\r\n`
        out += `Content-Type: application/json; type=entry\r\n\r\n{\r\n`
        Object.entries(record).forEach(([key, value]) => {
          if (!(key in alternateKey) && value !== undefined && value !== null) {
            outArr.push(`\t"${key}": ${formatter(value)}`)
          }
        })
        out += outArr.join(',\r\n')
        out += `\r\n}\r\n--batch_${boundaryId}\r\n`
      })
      return out
    }

    const returnResult = []
    for (const chunk of chunks) {
      const boundaryId = uuidv4()
      let body: string = `--batch_${boundaryId}\r\n`
      body += bulk(boundaryId, chunk) + `\r\n`
      body += finalGet(this.baseUrl) + `\r\n`
      body += `--batch_${boundaryId}--`

      const result = await this.httpService.post({
        path: `/api/data/v9.2/$batch`,
        headers: {
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'If-None-Match': 'null',
          Accept: 'application/json',
          'Content-Type': `multipart/mixed; boundary="batch_${boundaryId}"`,
        },
        body: body,
        customOptions: { rawBody: true },
      })
      await this.logger.debug('Bulk upsert result', result)
      if (!result.ok) {
        await this.logger.error(
          `Failed to bulk upsert ${entitySetName}`,
          result.val,
        )
        throw errorFrom(result.val)
      }
      returnResult.push(result.val.data)
    }
    return returnResult
  }

  async bulkUpdate(
    entitySetName: string,
    primaryKey: string,
    data: Record<string, unknown>[],
  ): Promise<unknown> {
    if (data.length === 0) {
      throw new Error('No data to upsert')
    }
    const chunks = chunkArray(data, 999)
    const bulk = (
      boundaryId: string,
      chunk: Record<string, unknown>[],
    ): string => {
      let out: string = ''
      chunk.forEach((record) => {
        const outArr: string[] = []
        out += `Content-Type: application/http\r\n`
        out += `Content-Transfer-Encoding: binary\r\n`
        out += `\r\n`
        out += `PATCH ${this.baseUrl}/api/data/v9.2/${entitySetName}(${primaryKey}) HTTP/1.1\r\n`
        out += `Content-Type: application/json; type=entry\r\n\r\n{\r\n`
        Object.entries(record).forEach(([key, value]) => {
          if (key !== primaryKey && value !== undefined && value !== null) {
            outArr.push(`\t"${key}": ${formatter(value)}`)
          }
        })
        out += outArr.join(',\r\n') + '\r\n'
        out += `}\r\n--batch_${boundaryId}\r\n`
      })
      return out
    }

    const returnResult = []
    for (const chunk of chunks) {
      const boundaryId = uuidv4()
      let body: string = `--batch_${boundaryId}\r\n`
      body += bulk(boundaryId, chunk) + `\r\n`
      body += finalGet(this.baseUrl) + `\r\n`
      body += `--batch_${boundaryId}--\r\n`

      const result = await this.httpService.post({
        path: `/api/data/v9.2/$batch`,
        headers: {
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'If-None-Match': 'null',
          Accept: 'application/json',
          'Content-Type': `multipart/mixed; boundary="batch_${boundaryId}"`,
        },
        body: body,
        customOptions: { rawBody: true },
      })
      await this.logger.debug('Bulk upsert result', result)
      if (!result.ok) {
        await this.logger.error(
          `Failed to bulk upsert ${entitySetName}`,
          result.val,
        )
        throw errorFrom(result.val)
      }
      returnResult.push(result.val.data)
    }
    return returnResult
  }
}
