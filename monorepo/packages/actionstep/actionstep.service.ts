import type { Readable } from 'stream'
import type {
  FetchParams,
  HttpServiceConfig,
  HttpServiceError,
  HttpServiceResponse,
} from '@dbc-tech/http'
import { HttpService, errorFrom } from '@dbc-tech/http'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import type { TSchema, TUnknown } from '@sinclair/typebox'
import type { TypeCheck } from '@sinclair/typebox/compiler'
import type { Result } from 'ts-results-es'
import {
  type Action,
  type ActionChangeStepPost,
  type ActionChangeStepPut,
  type ActionCreate,
  type ActionCreatePost,
  type ActionLinkParticipant,
  type ActionParticipant,
  type ActionParticipantPost,
  type ActionParticipantPostMultiple,
  type ActionPut,
  type ActionTypeParticipantType,
  type ActionTypes,
  CActionChangeStep,
  CActionCreate,
  CActionLinkParticipant,
  CActionStepToken,
  CDataCollectionRecord,
  CPagedActionDocumentFolder,
  CPagedActionParticipants,
  CPagedSteps,
  CSingleAction,
  CSingleActionDocumentFolder,
  CSingleActionParticipant,
  CSingleActionType,
  CSingleDataCollection,
  CSingleDataCollectionRecordValue,
  CSingleDataCollectionRecordValuev2,
  CSingleDocumentLinkMatterValue,
  CSingleFileNote,
  CSingleFileNotev2,
  CSingleParticipant,
  CSingleParticipantDataFieldValue,
  CSingleParticipantDefaultTypes,
  CSingleParticipantType,
  CSingleParticipantTypeDataField,
  CSingleStep,
  CSingleTask,
  CSingleUser,
  CUnknownActionFolders,
  CUnknownActionParticipants,
  CUnknownActionTypeParticipantTypes,
  CUnknownActionTypes,
  CUnknownActions,
  CUnknownDataCollectionFields,
  CUnknownDataCollectionRecordValues,
  CUnknownDataCollectionRecords,
  CUnknownDataCollections,
  CUnknownFileNotes,
  CUnknownParticipantDataFieldValues,
  CUnknownParticipantDefaultTypes,
  CUnknownParticipantTypeDataFields,
  CUnknownParticipantTypes,
  CUnknownParticipants,
  CUnknownTasks,
  CUnknownUsers,
  type DataCollection,
  type DataCollectionFields,
  type DataCollectionPost,
  type DataCollectionRecord,
  type DataCollectionRecordInner,
  type DataCollectionRecordPost,
  type DataCollectionRecordValue,
  type DataCollectionRecordValuePutv2,
  type DataCollectionRecordValuesPut,
  type DataCollectionRecordsPostMultiple,
  type EmptyResponse,
  type FileNote,
  type FileNotePostMultiple,
  type FileNotePostv2,
  type LinkMatterDocumentPost,
  type NoContent,
  type PagedActionChangeStep,
  type PagedActionDocumentFolder,
  type PagedActionParticipants,
  PagedActionParticipantsSchema,
  type PagedActionTypeParticipantTypes,
  type PagedActionTypes,
  type PagedActions,
  type PagedDataCollectionFields,
  type PagedDataCollectionRecordValuesv2,
  type PagedDataCollectionRecords,
  type PagedDataCollections,
  type PagedFileNotes,
  type PagedParticipantDataFieldValues,
  type PagedParticipantDefaultTypes,
  PagedParticipantDefaultTypesSchema,
  type PagedParticipantTypeDataFields,
  type PagedParticipantTypes,
  type PagedParticipants,
  type PagedSteps,
  type PagedTasks,
  type PagedUsers,
  type Participant,
  type ParticipantDataFieldValue,
  type ParticipantDataFieldValuePut,
  type ParticipantDefaultTypes,
  type ParticipantDefaultTypesPost,
  type ParticipantPut,
  type ParticipantType,
  type ParticipantTypeDataField,
  type SingleAction,
  type SingleActionDocumentFolder,
  type SingleActionParticipant,
  type SingleActionType,
  type SingleDataCollection,
  type SingleDataCollectionRecordValue,
  type SingleDataCollectionRecordValuev2,
  type SingleDocumentLinkMatterValue,
  type SingleDocumentValue,
  type SingleFileNote,
  type SingleFileNotev2,
  type SingleParticipant,
  type SingleParticipantDataFieldValue,
  type SingleParticipantDefaultTypes,
  type SingleParticipantType,
  type SingleParticipantTypeDataField,
  type SingleStep,
  type SingleTask,
  type SingleUser,
  type Tag,
  type Task,
  type TaskPut,
  type TaskPutPostMultiple,
  type TaskTemplate,
} from './actionstep.schema'

import { Value } from '@sinclair/typebox/value'
import type { MatterCreateBasics } from './interfaces'
import { mergeWithoutDupes, toBuffer } from './utils'
import {
  CSingleResthook,
  CUnknownResthook,
  type ResthookPutPost,
  type Resthooks,
  type SingleResthook,
} from './webhooks'

const noContentValue: NoContent = undefined

export type ActionStepServiceConfig = {
  baseUrl: string
  tokenUrl: string
  apikey: string
  clientId?: string
  correlationId?: string
  retries?: number
  logger?: Logger
}

export class ActionStepService {
  private logger: Logger
  private httpService: HttpService

  constructor(config: ActionStepServiceConfig) {
    this.logger = config.logger ?? NullLogger()

    const tokenService = new HttpService({
      baseUrl: config.tokenUrl,
      logger: this.logger,
      defaultHeaders: {
        apikey: config.apikey,
      },
    })
    const getToken = async (baseUrl: string) => {
      const result = await tokenService.get(
        {
          path: 'v1/actionstep/token',
        },
        CActionStepToken,
      )
      if (!result.ok) {
        await this.logger.error(
          `[ActionStepService.getToken] Failed to get token from ${baseUrl}`,
          result.val,
        )
        throw errorFrom(result.val)
      }

      return result.val.data.access_token
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      'x-client-id': config.clientId || 'ActionStepService',
    }
    if (config.correlationId) headers['x-correlation-id'] = config.correlationId

    const httpServiceConfig: HttpServiceConfig = {
      authHeader: async () => `Bearer ${await getToken(config.tokenUrl)}`,
      baseUrl: config.baseUrl,
      defaultHeaders: headers,
      logger: this.logger,
      retries: config.retries ?? 5,
      authFailureBackoffInitialDelay: 250,
    }
    this.httpService = new HttpService(httpServiceConfig)
  }

  private emptyMeta = {
    recordCount: 0,
    pageCount: 0,
    page: 0,
    pageSize: 0,
  }

  async delete(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async delete<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async delete<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.delete(fetchParams, typeCheck)
      : this.httpService.delete(fetchParams)
  }

  async get(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async get<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async get<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.get(fetchParams, typeCheck)
      : this.httpService.get(fetchParams)
  }

  async patch(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async patch<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async patch<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.patch(fetchParams, typeCheck)
      : this.httpService.patch(fetchParams)
  }

  async post(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async post<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async post<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.post(fetchParams, typeCheck)
      : this.httpService.post(fetchParams)
  }

  async put(
    fetchParams: FetchParams,
  ): Promise<Result<HttpServiceResponse<TUnknown>, HttpServiceError>>
  async put<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck: TypeCheck<T>,
  ): Promise<Result<HttpServiceResponse<T>, HttpServiceError>>
  async put<T extends TSchema = TUnknown>(
    fetchParams: FetchParams,
    typeCheck?: TypeCheck<T>,
  ): Promise<
    | Result<HttpServiceResponse<T>, HttpServiceError>
    | Result<HttpServiceResponse<TUnknown>, HttpServiceError>
  > {
    return typeCheck
      ? this.httpService.put(fetchParams, typeCheck)
      : this.httpService.put(fetchParams)
  }

  async getAction(
    actionId: number,
    query?: Record<string, string>,
  ): Promise<SingleAction> {
    const result = await this.httpService.get(
      {
        path: `/actions/${actionId}`,
        query,
      },
      CSingleAction,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getActions(query?: Record<string, string>): Promise<PagedActions> {
    const result = await this.httpService.get(
      { path: `/actions`, query },
      CUnknownActions,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        actions: [],
        linked: {},
        meta: { paging: { actions: this.emptyMeta } },
      }
    }

    const { data } = result.val
    if (Array.isArray(data.actions)) return data as PagedActions
    const out: PagedActions = {
      links: data.links,
      actions: [data.actions],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async updateAction(actionId: number, body: ActionPut): Promise<SingleAction> {
    const result = await this.httpService.put(
      { path: `/actions/${actionId}`, body },
      CSingleAction,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getActionType(
    actionTypeId: number,
    query?: Record<string, string>,
  ): Promise<SingleActionType> {
    const result = await this.httpService.get(
      { path: `/actiontypes/${actionTypeId}`, query },
      CSingleActionType,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getActionTypes(
    query?: Record<string, string>,
  ): Promise<PagedActionTypes> {
    const result = await this.httpService.get(
      { path: `/actiontypes`, query },
      CUnknownActionTypes,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data, status } = result.val
    if (status === 204)
      return {
        links: {},
        actiontypes: [],
        meta: {
          paging: {
            actiontypes: this.emptyMeta,
          },
        },
      }

    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.actiontypes.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.actiontypes.pageCount

      // set up our output objects including linked
      let at: ActionTypes[] = []
      let pt: ParticipantType[] = []
      at = at.concat(data.actiontypes)
      if (data.linked && data.linked.participanttypes)
        pt = mergeWithoutDupes(pt, data.linked.participanttypes)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/actiontypes`,
            query: { ...query, page: i.toString() },
          },
          CUnknownActionTypes,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.actiontypes)) {
          at = mergeWithoutDupes(at, nextData.actiontypes)
        } else {
          at = mergeWithoutDupes(at, [nextData.actiontypes])
        }
        if (nextData.linked && nextData.linked.participanttypes)
          pt = mergeWithoutDupes(pt, nextData.linked.participanttypes)
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links ?? {},
        actiontypes: at,
        linked: {
          participanttypes: pt,
        },
        meta: {
          paging: {
            actiontypes: {
              recordCount: data.meta?.paging.actiontypes.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.actiontypes.recordCount,
            },
          },
        },
      }
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.actiontypes)) return data as PagedActionTypes
    const out: PagedActionTypes = {
      links: data.links,
      actiontypes: [data.actiontypes],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async getActionTypeParticipantTypes(
    query?: Record<string, string>,
  ): Promise<PagedActionTypeParticipantTypes> {
    const result = await this.httpService.get(
      { path: `/actiontypeparticipanttypes`, query },
      CUnknownActionTypeParticipantTypes,
    )
    if (!result.ok) throw errorFrom(result.val)

    const { data, status } = result.val
    if (status === 204) {
      return {
        links: {},
        actiontypeparticipanttypes: [],
        meta: { paging: { actiontypeparticipanttypes: this.emptyMeta } },
      }
    }
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.actiontypeparticipanttypes.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount =
        data.meta?.paging.actiontypeparticipanttypes.pageCount || 1

      // set up our output objects
      let atpt: ActionTypeParticipantType[] = []
      let pt: ParticipantType[] = []
      atpt = atpt.concat(data.actiontypeparticipanttypes)
      if (data.linked && data.linked.participanttypes)
        pt = mergeWithoutDupes(pt, data.linked.participanttypes)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const result = await this.httpService.get(
          {
            path: `/actiontypeparticipanttypes`,
            query: { ...query, page: i.toString() },
          },
          CUnknownActionTypeParticipantTypes,
        )
        if (!result.ok) throw errorFrom(result.val)
        const { data: nextData } = result.val
        if (Array.isArray(nextData.actiontypeparticipanttypes)) {
          atpt = mergeWithoutDupes(atpt, nextData.actiontypeparticipanttypes)
        } else {
          atpt = mergeWithoutDupes(atpt, [nextData.actiontypeparticipanttypes])
        }
        if (nextData.linked && nextData.linked.participanttypes)
          pt = mergeWithoutDupes(pt, nextData.linked.participanttypes)
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links,
        actiontypeparticipanttypes: atpt,
        linked: { participanttypes: pt },
        meta: {
          paging: {
            actiontypeparticipanttypes: {
              recordCount:
                data.meta?.paging.actiontypeparticipanttypes.recordCount,
              pageCount: 1,
              page: 1,
              pageSize:
                data.meta?.paging.actiontypeparticipanttypes.recordCount,
            },
          },
        },
      }
    }

    if (Array.isArray(data.actiontypeparticipanttypes))
      return data as PagedActionTypeParticipantTypes
    const out: PagedActionTypeParticipantTypes = {
      links: data.links,
      actiontypeparticipanttypes: [data.actiontypeparticipanttypes],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async getTask(
    taskId: number,
    query?: Record<string, string>,
  ): Promise<SingleTask> {
    const result = await this.httpService.get(
      { path: `/tasks/${taskId}`, query },
      CSingleTask,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getTasks(query?: Record<string, string>): Promise<PagedTasks> {
    const result = await this.httpService.get(
      { path: `/tasks`, query },
      CUnknownTasks,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        tasks: [],
        linked: {},
        meta: { paging: { tasks: this.emptyMeta } },
      }
    }

    const { data } = result.val
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.tasks.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.tasks.pageCount

      // set up our output objects including linked
      let tasks: Task[] = []
      let dc: DataCollection[] = []
      let participants: Participant[] = []
      let actions: Action[] = []
      let tt: TaskTemplate[] = []
      tasks = tasks.concat(data.tasks)
      if (data.linked && data.linked.datacollections)
        dc = mergeWithoutDupes(dc, data.linked.datacollections)
      if (data.linked && data.linked.participants)
        participants = mergeWithoutDupes(participants, data.linked.participants)
      if (data.linked && data.linked.actions)
        actions = mergeWithoutDupes(actions, data.linked.actions)
      if (data.linked && data.linked.tasktemplates)
        tt = mergeWithoutDupes(tt, data.linked.tasktemplates)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/tasks`,
            query: { ...query, page: i.toString() },
          },
          CUnknownTasks,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.tasks)) {
          tasks = mergeWithoutDupes(tasks, nextData.tasks)
        } else {
          tasks = mergeWithoutDupes(tasks, [nextData.tasks])
        }
        if (nextData.linked && nextData.linked.datacollections)
          dc = mergeWithoutDupes(dc, nextData.linked.datacollections)
        if (nextData.linked && nextData.linked.participants)
          participants = mergeWithoutDupes(
            participants,
            nextData.linked.participants,
          )
        if (nextData.linked && nextData.linked.actions)
          actions = mergeWithoutDupes(actions, nextData.linked.actions)
        if (nextData.linked && nextData.linked.tasktemplates)
          tt = mergeWithoutDupes(tt, nextData.linked.tasktemplates)
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links ?? {},
        tasks: tasks,
        linked: {
          datacollections: dc,
          participants: participants,
          actions: actions,
          tasktemplates: tt,
        },
        meta: {
          paging: {
            tasks: {
              recordCount: data.meta?.paging.tasks.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.tasks.recordCount,
            },
          },
        },
      }
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.tasks)) return data as PagedTasks
    const out: PagedTasks = {
      links: data.links,
      tasks: [data.tasks],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async createTask(body: TaskPut): Promise<SingleTask> {
    const result = await this.httpService.post(
      { path: `/tasks`, body },
      CSingleTask,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async createTasks(body: TaskPutPostMultiple): Promise<PagedTasks> {
    const result = await this.httpService.post(
      { path: `/tasks`, body },
      CUnknownTasks,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    if (Array.isArray(data.tasks)) return data as PagedTasks
    const out: PagedTasks = {
      links: data.links,
      tasks: [data.tasks],
      meta: data.meta,
    }
    return out
  }

  async updateTask(taskId: number, body: TaskPut): Promise<SingleTask> {
    const result = await this.httpService.put(
      { path: `/tasks/${taskId}`, body },
      CSingleTask,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async updateTasks(
    id: string[],
    body: TaskPutPostMultiple,
  ): Promise<PagedTasks> {
    const result = await this.httpService.put(
      { path: `/tasks/${id.join(',')}`, body },
      CUnknownTasks,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    if (Array.isArray(data.tasks)) return data as PagedTasks
    const out: PagedTasks = {
      links: data.links,
      tasks: [data.tasks],
      meta: data.meta,
    }
    return out
  }

  async deleteTask(id: number) {
    const result = await this.httpService.delete({
      path: `/tasks/${id}`,
    })
    if (!result.ok) throw errorFrom(result.val)
  }

  async getFileNote(
    fileNoteId: number,
    query?: Record<string, string>,
  ): Promise<SingleFileNote> {
    const result = await this.httpService.get(
      { path: `/filenotes/${fileNoteId}`, query },
      CSingleFileNote,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getFileNotes(query?: Record<string, string>): Promise<PagedFileNotes> {
    const result = await this.httpService.get(
      { path: `/filenotes`, query },
      CUnknownFileNotes,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        filenotes: [],
        linked: {},
        meta: { paging: { filenotes: this.emptyMeta } },
      }
    }

    const { data } = result.val
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.filenotes.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.filenotes.pageCount

      // set up our output objects including linked
      let filenotes: FileNote[] = []
      filenotes = filenotes.concat(data.filenotes)

      let actions: Action[] = []
      if (data.linked && data.linked.actions)
        actions = mergeWithoutDupes(actions, data.linked.actions)

      let participants: Participant[] = []
      if (data.linked && data.linked.participants)
        participants = mergeWithoutDupes(participants, data.linked.participants)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/filenotes`,
            query: { ...query, page: i.toString() },
          },
          CUnknownFileNotes,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.filenotes)) {
          filenotes = mergeWithoutDupes(filenotes, nextData.filenotes)
        } else {
          filenotes = mergeWithoutDupes(filenotes, [nextData.filenotes])
        }
        if (nextData.linked && nextData.linked.actions)
          actions = mergeWithoutDupes(actions, nextData.linked.actions)
        if (nextData.linked && nextData.linked.participants)
          participants = mergeWithoutDupes(
            participants,
            nextData.linked.participants,
          )
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links ?? {},
        filenotes: filenotes,
        linked: {
          actions: actions,
          participants: participants,
        },
        meta: {
          paging: {
            filenotes: {
              recordCount: data.meta?.paging.filenotes.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.filenotes.recordCount,
            },
          },
        },
      }
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.filenotes)) return data as PagedFileNotes
    const out: PagedFileNotes = {
      links: data.links,
      filenotes: [data.filenotes],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async createFileNote(body: FileNotePostv2): Promise<SingleFileNotev2> {
    const result = await this.httpService.post(
      { path: `/filenotes`, body },
      CSingleFileNotev2,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async createFileNotes(body: FileNotePostMultiple): Promise<PagedFileNotes> {
    const result = await this.httpService.post(
      { path: `/filenotes`, body },
      CUnknownFileNotes,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    if (Array.isArray(data.filenotes)) return data as PagedFileNotes
    const out: PagedFileNotes = {
      links: data.links,
      filenotes: [data.filenotes],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async getActionParticipant(
    actionParticipantId?: string,
    query?: Record<string, string>,
  ): Promise<SingleActionParticipant> {
    const result = await this.httpService.get(
      { path: `/actionparticipants/${actionParticipantId}`, query },
      CSingleActionParticipant,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data as SingleActionParticipant
  }

  async getActionParticipants(
    query?: Record<string, string>,
  ): Promise<PagedActionParticipants> {
    const result = await this.httpService.get(
      { path: `/actionparticipants`, query },
      CUnknownActionParticipants,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        actionparticipants: [],
        linked: {},
        meta: { paging: { actionparticipants: this.emptyMeta } },
      }
    }

    const { data } = result.val
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.actionparticipants.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.actionparticipants.pageCount

      // set up our output objects including linked
      let ap: ActionParticipant[] = []
      let pt: ParticipantType[] = []
      let actions: Action[] = []
      let participants: Participant[] = []
      ap = ap.concat(data.actionparticipants)
      if (data.linked && data.linked.participants)
        participants = mergeWithoutDupes(participants, data.linked.participants)
      if (data.linked && data.linked.participanttypes)
        pt = mergeWithoutDupes(pt, data.linked.participanttypes)
      if (data.linked && data.linked.actions)
        actions = mergeWithoutDupes(actions, data.linked.actions)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/actionparticipants`,
            query: { ...query, page: i.toString() },
          },
          CUnknownActionParticipants,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.actionparticipants)) {
          ap = mergeWithoutDupes(ap, nextData.actionparticipants)
        } else {
          ap = mergeWithoutDupes(ap, [nextData.actionparticipants])
        }
        if (nextData.linked && nextData.linked.participanttypes)
          pt = mergeWithoutDupes(pt, nextData.linked.participanttypes)
        if (nextData.linked && nextData.linked.participants)
          participants = mergeWithoutDupes(
            participants,
            nextData.linked.participants,
          )
        if (nextData.linked && nextData.linked.actions)
          actions = mergeWithoutDupes(actions, nextData.linked.actions)
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return Value.Parse(PagedActionParticipantsSchema, {
        links: data.links ?? {},
        actionparticipants: ap,
        linked: {
          participanttypes: pt,
          participants: participants,
          actions: actions,
        },
        meta: {
          paging: {
            actionparticipants: {
              recordCount: data.meta?.paging.actionparticipants.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.actionparticipants.recordCount,
            },
          },
        },
      })
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.actionparticipants))
      return Value.Parse(PagedActionParticipantsSchema, data)

    const out: PagedActionParticipants = {
      links: data.links,
      actionparticipants: [data.actionparticipants],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return Value.Parse(PagedActionParticipantsSchema, out)
  }

  async createActionParticipant(
    body: ActionParticipantPost,
  ): Promise<SingleActionParticipant> {
    const result = await this.httpService.post(
      { path: `/actionparticipants`, body },
      CSingleActionParticipant,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data as SingleActionParticipant
  }

  async createActionParticipants(
    body: ActionParticipantPostMultiple,
  ): Promise<PagedActionParticipants> {
    const result = await this.httpService.post(
      { path: `/actionparticipants`, body },
      CPagedActionParticipants,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async deleteActionParticipant(id: string) {
    const result = await this.httpService.delete({
      path: `/actionparticipants/${id}`,
    })
    if (!result.ok) throw errorFrom(result.val)
  }

  async getParticipant(
    participantId: number,
    query?: Record<string, string>,
  ): Promise<SingleParticipant> {
    const result = await this.httpService.get(
      { path: `/participants/${participantId}`, query },
      CSingleParticipant,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getParticipants(
    query?: Record<string, string>,
  ): Promise<PagedParticipants> {
    const result = await this.httpService.get(
      { path: `/participants`, query },
      CUnknownParticipants,
    )

    if (!result.ok) throw errorFrom(result.val)
    const { data, status } = result.val
    if (status === 204) {
      return {
        links: {},
        participants: [],
        linked: {},
        meta: { paging: { participants: this.emptyMeta } },
      }
    }
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.participants.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.participants.pageCount

      // set up our output objects including linked
      let participants: Participant[] = []
      participants = participants.concat(data.participants)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/participants`,
            query: { ...query, page: i.toString() },
          },
          CUnknownParticipants,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.participants)) {
          participants = mergeWithoutDupes(participants, nextData.participants)
        } else {
          participants = mergeWithoutDupes(participants, [
            nextData.participants,
          ])
        }
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links ?? {},
        participants: participants,
        linked: data.linked ?? {},
        meta: {
          paging: {
            participants: {
              recordCount: data.meta?.paging.participants.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.participants.recordCount,
            },
          },
        },
      }
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.participants)) return data as PagedParticipants
    const out: PagedParticipants = {
      links: data.links,
      participants: [data.participants],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async createParticipant(body: ParticipantPut): Promise<SingleParticipant> {
    const result = await this.httpService.post(
      { path: `/participants`, body },
      CSingleParticipant,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async linkActionParticipant(
    body: ActionParticipantPost,
  ): Promise<ActionLinkParticipant> {
    const result = await this.httpService.post(
      { path: `/actionparticipants`, body },
      CActionLinkParticipant,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async linkMultipleActionParticipants(
    body: ActionParticipantPostMultiple,
  ): Promise<PagedActionParticipants> {
    const result = await this.httpService.post(
      { path: `/actionparticipants`, body },
      CUnknownActionParticipants,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val

    if (Array.isArray(data.actionparticipants))
      return data as PagedActionParticipants
    return {
      links: data.links,
      actionparticipants: [data.actionparticipants],
      meta: data.meta,
    }
  }

  async updateParticipant(
    participantId: number,
    body: ParticipantPut,
  ): Promise<SingleParticipant> {
    const result = await this.httpService.put(
      { path: `/participants/${participantId}`, body },
      CSingleParticipant,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async deleteParticipant(id: string) {
    const result = await this.httpService.delete({
      path: `/participants/${id}`,
    })
    if (!result.ok) throw errorFrom(result.val)
  }

  async getParticipantDefaultType(
    participantDefaultTypeId: string,
    query?: Record<string, string>,
  ): Promise<SingleParticipantDefaultTypes> {
    const result = await this.httpService.get(
      { path: `/participantdefaulttypes/${participantDefaultTypeId}`, query },
      CSingleParticipantDefaultTypes,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getParticipantDefaultTypes(
    query?: Record<string, string>,
  ): Promise<PagedParticipantDefaultTypes> {
    const result = await this.httpService.get(
      {
        path: `/participantdefaulttypes`,
        query,
      },
      CUnknownParticipantDefaultTypes,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204)
      return {
        links: {},
        participantdefaulttypes: [],
        linked: {
          participanttypes: [],
        },
        meta: { paging: { participantdefaulttypes: this.emptyMeta } },
      }

    const data = result.val.data
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.participantdefaulttypes.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.participantdefaulttypes.pageCount || 1

      // set up our output objects including linked
      let pdt: ParticipantDefaultTypes[] = []
      let pt: ParticipantType[] = []
      let participants: Participant[] = []
      pdt = pdt.concat(data.participantdefaulttypes)
      if (data.linked && data.linked.participants)
        participants = mergeWithoutDupes(participants, data.linked.participants)
      if (data.linked && data.linked.participanttypes)
        pt = mergeWithoutDupes(pt, data.linked.participanttypes)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const result = await this.httpService.get(
          {
            path: `/participantdefaulttypes`,
            query: { ...query, page: i.toString() },
          },
          CUnknownParticipantDefaultTypes,
        )
        if (!result.ok) throw errorFrom(result.val)
        const nextData = result.val.data
        if (Array.isArray(nextData.participantdefaulttypes)) {
          pdt = mergeWithoutDupes(pdt, nextData.participantdefaulttypes)
        } else {
          pdt = mergeWithoutDupes(pdt, [nextData.participantdefaulttypes])
        }
        if (nextData.linked && nextData.linked.participanttypes)
          pt = mergeWithoutDupes(pt, nextData.linked.participanttypes)
        if (nextData.linked && nextData.linked.participants)
          participants = mergeWithoutDupes(
            participants,
            nextData.linked.participants,
          )
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return Value.Parse(PagedParticipantDefaultTypesSchema, {
        links: data.links ?? {},
        participantdefaulttypes: pdt,
        linked: {
          participanttypes: pt,
          participants: participants,
        },
        meta: {
          paging: {
            participantdefaulttypes: {
              recordCount:
                data.meta?.paging.participantdefaulttypes.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.participantdefaulttypes.recordCount,
            },
          },
        },
      })
    }

    if (Array.isArray(data.participantdefaulttypes))
      return Value.Parse(PagedParticipantDefaultTypesSchema, data)
    if (data.linked) {
      return Value.Parse(PagedParticipantDefaultTypesSchema, {
        links: data.links ?? {},
        participantdefaulttypes: [data.participantdefaulttypes],
        linked: data.linked,
        meta: data.meta,
      })
    }
    return Value.Parse(PagedParticipantDefaultTypesSchema, {
      links: data.links ?? {},
      participantdefaulttypes: [data.participantdefaulttypes],
      linked: {
        participanttypes: [],
      },
      meta: data.meta,
    })
  }

  async createParticipantDefaultType(
    body: ParticipantDefaultTypesPost,
  ): Promise<SingleParticipantDefaultTypes> {
    const result = await this.httpService.post(
      { path: `/participantdefaulttypes`, body },
      CSingleParticipantDefaultTypes,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async deleteParticipantDefaultType(
    id: string,
    targetParticipantTypeId: string,
  ) {
    const result = await this.httpService.delete({
      path: `/participantdefaulttypes/${id}--${targetParticipantTypeId}`,
    })
    if (!result.ok) throw errorFrom(result.val)
  }

  async createDataCollection(
    body: DataCollectionPost,
  ): Promise<SingleDataCollection> {
    const result = await this.httpService.post(
      { path: `/datacollections`, body },
      CSingleDataCollection,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getDataCollection(
    datacollectionId: number,
    query?: Record<string, string>,
  ): Promise<SingleDataCollection> {
    const result = await this.httpService.get(
      { path: `/datacollections/${datacollectionId}`, query },
      CSingleDataCollection,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getDataCollections(
    query?: Record<string, string>,
  ): Promise<PagedDataCollections> {
    const result = await this.httpService.get(
      { path: `/datacollections`, query },
      CUnknownDataCollections,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        datacollections: [],
        linked: {},
        meta: { paging: { datacollections: this.emptyMeta } },
      }
    }

    const { data } = result.val
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.datacollections.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.datacollections.pageCount || 1
      // set up our output objects including linked
      let dc: DataCollection[] = []
      let at: ActionTypes[] = []

      dc = dc.concat(data.datacollections)
      if (data.linked && data.linked.actiontypes)
        at = mergeWithoutDupes(at, data.linked.actiontypes)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/datacollections`,
            query: { ...query, page: i.toString() },
          },
          CUnknownDataCollections,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.datacollections)) {
          dc = mergeWithoutDupes(dc, nextData.datacollections)
        } else {
          dc = mergeWithoutDupes(dc, [nextData.datacollections])
        }
        if (nextData.linked && nextData.linked.actiontypes)
          at = mergeWithoutDupes(at, nextData.linked.actiontypes)
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links ?? {},
        datacollections: dc,
        linked: {
          actiontypes: at,
        },
        meta: {
          paging: {
            datacollections: {
              recordCount: data.meta?.paging.datacollections.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.datacollections.recordCount,
            },
          },
        },
      }
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.datacollections)) return data as PagedDataCollections
    const out: PagedDataCollections = {
      links: data.links,
      datacollections: [data.datacollections],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async getDataCollectionFields(
    query?: Record<string, string>,
  ): Promise<PagedDataCollectionFields> {
    const result = await this.httpService.get(
      { path: `/datacollectionfields`, query },
      CUnknownDataCollectionFields,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        datacollectionfields: [],
        linked: {},
        meta: { paging: { datacollectionfields: this.emptyMeta } },
      }
    }

    const { data } = result.val
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.datacollectionfields.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.datacollectionfields.pageCount || 1
      // set up our output objects including linked
      let dcf: DataCollectionFields[] = []
      let dc: DataCollection[] = []
      let tag: Tag[] = []

      dcf = dcf.concat(data.datacollectionfields)
      if (data.linked && data.linked.datacollections)
        dc = mergeWithoutDupes(dc, data.linked.datacollections)
      if (data.linked && data.linked.tags)
        tag = mergeWithoutDupes(tag, data.linked.tags)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/datacollectionfields`,
            query: { ...query, page: i.toString() },
          },
          CUnknownDataCollectionFields,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.datacollectionfields)) {
          dcf = mergeWithoutDupes(dcf, nextData.datacollectionfields)
        } else {
          dcf = mergeWithoutDupes(dcf, [nextData.datacollectionfields])
        }
        if (nextData.linked && nextData.linked.datacollections)
          dc = mergeWithoutDupes(dc, nextData.linked.datacollections)
        if (nextData.linked && nextData.linked.tags)
          tag = mergeWithoutDupes(tag, nextData.linked.tags)
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links ?? {},
        datacollectionfields: dcf,
        linked: {
          datacollections: dc,
          tags: tag,
        },
        meta: {
          paging: {
            datacollectionfields: {
              recordCount: data.meta?.paging.datacollectionfields.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.datacollectionfields.recordCount,
            },
          },
        },
      }
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.datacollectionfields))
      return data as PagedDataCollectionFields
    const out: PagedDataCollectionFields = {
      links: data.links,
      datacollectionfields: [data.datacollectionfields],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async getDataCollectionRecords(
    query?: Record<string, string>,
  ): Promise<PagedDataCollectionRecords> {
    const result = await this.httpService.get(
      { path: `/datacollectionrecords`, query },
      CUnknownDataCollectionRecords,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        datacollectionrecords: [],
        linked: {},
        meta: { paging: { datacollectionrecords: this.emptyMeta } },
      }
    }

    const { data } = result.val
    if (Array.isArray(data.datacollectionrecords))
      return data as PagedDataCollectionRecords
    const out: PagedDataCollectionRecords = {
      links: data.links,
      datacollectionrecords: [data.datacollectionrecords],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async createDataCollectionRecord(
    body: DataCollectionRecordPost,
  ): Promise<DataCollectionRecord> {
    const result = await this.httpService.post(
      { path: `/datacollectionrecords`, body },
      CDataCollectionRecord,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async createDataCollectionRecords(
    body: DataCollectionRecordsPostMultiple,
  ): Promise<PagedDataCollectionRecords> {
    const result = await this.httpService.post(
      { path: `/datacollectionrecords`, body },
      CUnknownDataCollectionRecords,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    if (Array.isArray(data.datacollectionrecords))
      return data as PagedDataCollectionRecords
    const out: PagedDataCollectionRecords = {
      links: data.links,
      datacollectionrecords: [data.datacollectionrecords],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async getDataCollectionRecordValue(
    dataCollectionRecordValueId: string,
    query?: Record<string, string>,
  ): Promise<SingleDataCollectionRecordValue> {
    const result = await this.httpService.get(
      {
        path: `/datacollectionrecordvalues/${dataCollectionRecordValueId}`,
        query,
      },
      CSingleDataCollectionRecordValue,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getDataCollectionRecordValues(
    query?: Record<string, string>,
  ): Promise<PagedDataCollectionRecordValuesv2> {
    const result = await this.httpService.get(
      { path: `/datacollectionrecordvalues`, query },
      CUnknownDataCollectionRecordValues,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        datacollectionrecordvalues: [],
        linked: {},
        meta: { paging: { datacollectionrecordvalues: this.emptyMeta } },
      }
    }

    const { data } = result.val
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.datacollectionrecordvalues.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount =
        data.meta?.paging.datacollectionrecordvalues.pageCount || 1
      // set up our output objects including linked
      let dcrv: DataCollectionRecordValue[] = []
      let actions: Action[] = []
      let dc: DataCollection[] = []
      let dcr: DataCollectionRecordInner[] = []
      let dcf: DataCollectionFields[] = []

      dcrv = dcrv.concat(data.datacollectionrecordvalues)
      if (data.linked && data.linked.actions)
        actions = mergeWithoutDupes(actions, data.linked.actions)
      if (data.linked && data.linked.datacollections)
        dc = mergeWithoutDupes(dc, data.linked.datacollections)
      if (data.linked && data.linked.datacollectionrecords)
        dcr = mergeWithoutDupes(dcr, data.linked.datacollectionrecords)
      if (data.linked && data.linked.datacollectionfields)
        dcf = mergeWithoutDupes(dcf, data.linked.datacollectionfields)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/datacollectionrecordvalues`,
            query: { ...query, page: i.toString() },
          },
          CUnknownDataCollectionRecordValues,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.datacollectionrecordvalues)) {
          dcrv = mergeWithoutDupes(dcrv, nextData.datacollectionrecordvalues)
        } else {
          dcrv = mergeWithoutDupes(dcrv, [nextData.datacollectionrecordvalues])
        }
        if (nextData.linked && nextData.linked.actions)
          actions = mergeWithoutDupes(actions, nextData.linked.actions)
        if (nextData.linked && nextData.linked.datacollections)
          dc = mergeWithoutDupes(dc, nextData.linked.datacollections)
        if (nextData.linked && nextData.linked.datacollectionrecords)
          dcr = mergeWithoutDupes(dcr, nextData.linked.datacollectionrecords)
        if (nextData.linked && nextData.linked.datacollectionfields)
          dcf = mergeWithoutDupes(dcf, nextData.linked.datacollectionfields)
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links ?? {},
        datacollectionrecordvalues: dcrv,
        linked: {
          actions,
          datacollections: dc,
          datacollectionrecords: dcr,
          datacollectionfields: dcf,
        },
        meta: {
          paging: {
            datacollectionrecordvalues: {
              recordCount:
                data.meta?.paging.datacollectionrecordvalues.recordCount,
              pageCount: 1,
              page: 1,
              pageSize:
                data.meta?.paging.datacollectionrecordvalues.recordCount,
            },
          },
        },
      }
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.datacollectionrecordvalues))
      return data as PagedDataCollectionRecordValuesv2
    const out: PagedDataCollectionRecordValuesv2 = {
      links: data.links,
      datacollectionrecordvalues: [data.datacollectionrecordvalues],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async updateDataCollectionRecordValue(
    dataCollectionRecordValueId: string,
    body: DataCollectionRecordValuePutv2,
  ): Promise<SingleDataCollectionRecordValuev2> {
    const result = await this.httpService.put(
      {
        path: `/datacollectionrecordvalues/${dataCollectionRecordValueId}`,
        body,
      },
      CSingleDataCollectionRecordValuev2,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async updateDataCollectionRecordValues(
    dataCollectionRecordValueId: string,
    body: DataCollectionRecordValuesPut,
  ): Promise<PagedDataCollectionRecordValuesv2> {
    const result = await this.httpService.put(
      {
        path: `/datacollectionrecordvalues/${dataCollectionRecordValueId}`,
        body,
      },
      CUnknownDataCollectionRecordValues,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    if (Array.isArray(data.datacollectionrecordvalues))
      return data as PagedDataCollectionRecordValuesv2

    const out: PagedDataCollectionRecordValuesv2 = {
      links: data.links,
      datacollectionrecordvalues: [data.datacollectionrecordvalues],
      meta: data.meta,
    }
    return out
  }

  async getParticipantType(
    ParticipantTypeId: number,
    query?: Record<string, string>,
  ): Promise<SingleParticipantType> {
    const result = await this.httpService.get(
      { path: `/participanttypes/${ParticipantTypeId}`, query },
      CSingleParticipantType,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getParticipantTypes(
    query?: Record<string, string>,
  ): Promise<PagedParticipantTypes> {
    const result = await this.httpService.get(
      { path: `/participanttypes`, query },
      CUnknownParticipantTypes,
    )
    if (!result.ok) throw errorFrom(result.val)

    const { data, status } = result.val
    if (status === 204) {
      return {
        participanttypes: [],
        meta: { paging: { participanttypes: this.emptyMeta } },
      }
    }
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.participanttypes.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.participanttypes.pageCount || 1

      // set up our output objects
      let pt: ParticipantType[] = []
      pt = pt.concat(data.participanttypes)

      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const result = await this.httpService.get(
          {
            path: `/participanttypes`,
            query: { ...query, page: i.toString() },
          },
          CUnknownParticipantTypes,
        )
        if (!result.ok) throw errorFrom(result.val)
        const { data: nextData } = result.val
        if (Array.isArray(nextData.participanttypes)) {
          pt = mergeWithoutDupes(pt, nextData.participanttypes)
        } else {
          pt = mergeWithoutDupes(pt, [nextData.participanttypes])
        }
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        participanttypes: pt,
        meta: {
          paging: {
            participanttypes: {
              recordCount: data.meta?.paging.participanttypes.recordCount,
              pageCount: 1,
              page: 1,
              pageSize: data.meta?.paging.participanttypes.recordCount,
            },
          },
        },
      }
    }

    if (Array.isArray(data.participanttypes))
      return data as PagedParticipantTypes
    const out: PagedParticipantTypes = {
      participanttypes: [data.participanttypes],
      meta: data.meta,
    }
    return out
  }

  async getParticipantDataFieldValue(
    participantDataFieldValueId: string,
    query?: Record<string, string>,
  ): Promise<SingleParticipantDataFieldValue> {
    const result = await this.httpService.get(
      {
        path: `/participantdatafieldvalues/${participantDataFieldValueId}`,
        query,
      },
      CSingleParticipantDataFieldValue,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async updateParticipantDataFieldValue(
    participantDataFieldValueId: string,
    body: ParticipantDataFieldValuePut,
  ): Promise<SingleParticipantDataFieldValue> {
    const result = await this.httpService.put(
      {
        path: `/participantdatafieldvalues/${participantDataFieldValueId}`,
        body,
      },
      CSingleParticipantDataFieldValue,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async getParticipantDataFieldValues(
    query?: Record<string, string>,
  ): Promise<PagedParticipantDataFieldValues> {
    const result = await this.httpService.get(
      { path: `/participantdatafieldvalues`, query },
      CUnknownParticipantDataFieldValues,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        participantdatafieldvalues: [],
        linked: {},
        meta: { paging: { participantdatafieldvalues: this.emptyMeta } },
      }
    }

    const { data } = result.val
    // check for paging
    if (
      query &&
      query.pageSize &&
      query.pageSize === 'All' &&
      data.meta?.paging.participantdatafieldvalues.pageCount > 1
    ) {
      // get the remaining results and return combined values
      const pageCount = data.meta?.paging.participantdatafieldvalues.pageCount
      // set up our output objects including linked
      let pd: ParticipantDataFieldValue[] = []
      let participants: Participant[] = []
      let pt: ParticipantType[] = []
      let ptdf: ParticipantTypeDataField[] = []
      pd = pd.concat(data.participantdatafieldvalues)
      if (data.linked && data.linked.participants)
        participants = mergeWithoutDupes(participants, data.linked.participants)
      if (data.linked && data.linked.participanttypes)
        pt = mergeWithoutDupes(pt, data.linked.participanttypes)
      if (data.linked && data.linked.participanttypedatafields)
        ptdf = mergeWithoutDupes(ptdf, data.linked.participanttypedatafields)
      // get the rest of the pages
      for (let i = 2; i <= pageCount; i++) {
        const pageResult = await this.httpService.get(
          {
            path: `/participantdatafieldvalues`,
            query: { ...query, page: i.toString() },
          },
          CUnknownParticipantDataFieldValues,
        )
        if (!pageResult.ok) throw errorFrom(pageResult.val)
        const { data: nextData } = pageResult.val
        if (Array.isArray(nextData.participantdatafieldvalues)) {
          pd = mergeWithoutDupes(pd, nextData.participantdatafieldvalues)
        } else {
          pd = mergeWithoutDupes(pd, [nextData.participantdatafieldvalues])
        }
        if (nextData.linked && nextData.linked.participants)
          participants = mergeWithoutDupes(
            participants,
            nextData.linked.participants,
          )
        if (nextData.linked && nextData.linked.participanttypes)
          pt = mergeWithoutDupes(pt, nextData.linked.participanttypes)
        if (nextData.linked && nextData.linked.participanttypedatafields)
          ptdf = mergeWithoutDupes(
            ptdf,
            nextData.linked.participanttypedatafields,
          )
      }
      // return the combined results (linked can be empty arrays as opposed to missing)
      return {
        links: data.links ?? {},
        participantdatafieldvalues: pd,
        linked: {
          participants: participants,
          participanttypes: pt,
          participanttypedatafields: ptdf,
        },
        meta: {
          paging: {
            participantdatafieldvalues: {
              recordCount:
                data.meta?.paging.participantdatafieldvalues.recordCount,
              pageCount: 1,
              page: 1,
              pageSize:
                data.meta?.paging.participantdatafieldvalues.recordCount,
            },
          },
        },
      }
    }

    // this is what we do if there is no paging
    if (Array.isArray(data.participantdatafieldvalues))
      return data as PagedParticipantDataFieldValues
    const out: PagedParticipantDataFieldValues = {
      links: data.links,
      participantdatafieldvalues: [data.participantdatafieldvalues],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async getParticipantTypeDataField(
    ParticipantTypeDataFieldId: number,
    query?: Record<string, string>,
  ): Promise<SingleParticipantTypeDataField> {
    const result = await this.httpService.get(
      {
        path: `/participanttypedatafields/${ParticipantTypeDataFieldId}`,
        query,
      },
      CSingleParticipantTypeDataField,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getParticipantTypeDataFields(
    query?: Record<string, string>,
  ): Promise<PagedParticipantTypeDataFields> {
    const result = await this.httpService.get(
      { path: `/participanttypedatafields`, query },
      CUnknownParticipantTypeDataFields,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        links: {},
        participanttypedatafields: [],
        linked: {},
        meta: { paging: { participanttypedatafields: this.emptyMeta } },
      }
    }

    const { data } = result.val
    if (Array.isArray(data.participanttypedatafields))
      return data as PagedParticipantTypeDataFields
    const out: PagedParticipantTypeDataFields = {
      links: data.links,
      participanttypedatafields: [data.participanttypedatafields],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async createResthook(body: ResthookPutPost): Promise<Resthooks> {
    const result = await this.httpService.post(
      {
        path: `/resthooks`,
        body,
      },
      CUnknownResthook,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        resthooks: [],
      }
    }
    const { data } = result.val
    if (Array.isArray(data.resthooks)) return data as Resthooks
    return {
      resthooks: [data.resthooks],
    }
  }

  async updateResthook(
    resthookId: number,
    body: ResthookPutPost,
  ): Promise<Resthooks> {
    const result = await this.httpService.put(
      {
        path: `/resthooks/${resthookId}`,
        body,
      },
      CUnknownResthook,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        resthooks: [],
      }
    }
    const { data } = result.val
    if (Array.isArray(data.resthooks)) return data as Resthooks
    return {
      resthooks: [data.resthooks],
    }
  }

  async deleteResthook(resthookId: number) {
    const result = await this.httpService.delete({
      path: `/resthooks/${resthookId}`,
    })
    if (!result.ok) throw errorFrom(result.val)
  }

  async getResthook(
    ResthookId: number,
    query?: Record<string, string>,
  ): Promise<SingleResthook> {
    const result = await this.httpService.get(
      { path: `/resthooks/${ResthookId}`, query },
      CSingleResthook,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getResthooks(query?: Record<string, string>): Promise<Resthooks> {
    const result = await this.httpService.get(
      {
        path: `/resthooks`,
        query,
      },
      CUnknownResthook,
    )
    if (!result.ok) throw errorFrom(result.val)
    if (result.val.status === 204) {
      return {
        resthooks: [],
      }
    }
    const { data } = result.val
    if (Array.isArray(data.resthooks)) return data as Resthooks
    return {
      resthooks: [data.resthooks],
    }
  }

  async getUser(
    UserId: number,
    query?: Record<string, string>,
  ): Promise<SingleUser> {
    const result = await this.httpService.get(
      { path: `/users${UserId}`, query },
      CSingleUser,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getUsers(query?: Record<string, string>): Promise<PagedUsers> {
    const result = await this.httpService.get(
      { path: `/users`, query },
      CUnknownUsers,
    )
    if (!result.ok) throw errorFrom(result.val)

    const { data, status } = result.val
    if (status === 204)
      return {
        links: {},
        users: [],
        meta: { paging: { users: this.emptyMeta } },
      }
    if (Array.isArray(data.users)) return data as PagedUsers
    if (data.linked) {
      return {
        links: data.links,
        users: [data.users],
        linked: data.linked,
        meta: data.meta,
      }
    }
    return {
      links: data.links,
      users: [data.users],
      meta: data.meta,
    }
  }

  async getCurrentUser(query?: Record<string, string>): Promise<SingleUser> {
    const result = await this.httpService.get(
      { path: `/users/current`, query },
      CSingleUser,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    return data as SingleUser
  }

  ///----------------- Custom Methods -----------------///
  async createAction(body: ActionCreatePost): Promise<ActionCreate> {
    const result = await this.httpService.post(
      { path: `/actioncreate`, body },
      CActionCreate,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  ///----------------- Custom Methods -----------------///
  /**
   * Uploads a document to the Actionstep.
   *
   * @param stream - The readable stream containing the document data.
   * @param documentName - The name of the file.
   * @param fileUploadUrl - The URL of the upload API of Actionstep.
   * @returns A promise that resolves to the uploaded document.
   * @throws An error if the upload fails.
   */
  async uploadDocument(
    stream: Readable,
    documentName: string,
    fileUploadUrl: string,
  ): Promise<SingleDocumentValue> {
    const payload = await toBuffer(stream)
    const result = await this.httpService.post({
      path: '/files',
      query: { part_count: '1', part_number: '1' },
      body: payload,
      customOptions: {
        action: 'upload',
        filename: documentName,
        overrideBaseUrl: fileUploadUrl,
      },
    })
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data as SingleDocumentValue
  }

  /**
   * Links a document to a matter.
   *
   * @param body - The data for linking the document to the matter.
   * @returns A promise that resolves to the linked document value.
   * @throws An error if the linking process fails.
   */
  async linkDocumentToMatter(
    body: LinkMatterDocumentPost,
  ): Promise<SingleDocumentLinkMatterValue> {
    const result = await this.httpService.post(
      {
        path: '/actiondocuments',
        body,
      },
      CSingleDocumentLinkMatterValue,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  /**
   * Retrieves an action folder based on the provided query parameters.
   *
   * @param query - An optional record of query parameters to filter the action folders.
   * @returns A promise that resolves to an `ActionDocumentFolder` if found, or an `EmptyResponse` if no content is available.
   * @throws Will throw an error if the HTTP request fails.
   */
  async getActionFolder(
    query?: Record<string, string>,
  ): Promise<SingleActionDocumentFolder | EmptyResponse> {
    const result = await this.httpService.get(
      { path: `/actionfolders`, query },
      CSingleActionDocumentFolder,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    if (!data) return noContentValue
    return data
  }

  async getActionFolders(
    query?: Record<string, string>,
  ): Promise<PagedActionDocumentFolder | EmptyResponse> {
    const result = await this.httpService.get(
      { path: `/actionfolders`, query },
      CPagedActionDocumentFolder,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    if (!data) return noContentValue
    return data
  }

  async getActionFolderv2(
    actionFolderId: number,
    query?: Record<string, string>,
  ): Promise<SingleActionDocumentFolder> {
    const result = await this.httpService.get(
      { path: `/actionfolders/${actionFolderId}`, query },
      CSingleActionDocumentFolder,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async getActionFoldersv2(
    query?: Record<string, string>,
  ): Promise<PagedActionDocumentFolder> {
    const result = await this.httpService.get(
      { path: `/actionfolders`, query },
      CUnknownActionFolders,
    )
    if (!result.ok) throw errorFrom(result.val)
    const { data } = result.val
    if (result.val.status === 204) {
      return {
        links: {},
        actionfolders: [],
        linked: {},
        meta: { paging: { actionfolders: this.emptyMeta } },
      }
    }
    if (Array.isArray(data.actionfolders))
      return data as PagedActionDocumentFolder
    const out: PagedActionDocumentFolder = {
      links: data.links,
      actionfolders: [data.actionfolders],
      meta: data.meta,
    }
    if (data.linked) out.linked = data.linked
    return out
  }

  async createMatter(
    payload: MatterCreateBasics,
    trustAccounts?: string[],
  ): Promise<number> {
    const param: ActionCreatePost = {
      actioncreate: {
        actionName: payload.name,
        links: {
          actionType: payload.matter_type_id,
          trustAccounts,
        },
      },
    }
    param.actioncreate.fileReference = payload.reference || undefined
    param.actioncreate.fileNote = payload.notes || undefined

    const matterResponse = await this.createAction(param)
    if (!matterResponse.actioncreate.id) {
      throw new Error('Failed to create Action, no action id returned!')
    }
    return matterResponse.actioncreate.id // Matter Id
  }

  async getPropertyParticipantId(
    matterId: number,
    propertyTypeId: string,
  ): Promise<string | undefined> {
    const query: Record<string, string> = {
      action: `${matterId}`,
      participantType: propertyTypeId,
    }
    const res = await this.getActionParticipants(query)
    if (!res.actionparticipants.length) {
      await this.logger.warn(
        `No property participant found for matter ${matterId} with type ${propertyTypeId}`,
      )
      return undefined
    }
    return res.actionparticipants[0].id.split('--')[2]
  }

  async getActionChangeStep(id: number): Promise<PagedActionChangeStep> {
    const result = await this.httpService.get(
      {
        path: `/actionchangestep/${id}`,
      },
      CActionChangeStep,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async postActionChangeStep(
    body: ActionChangeStepPost,
  ): Promise<PagedActionChangeStep> {
    const result = await this.httpService.post(
      {
        path: `/actionchangestep`,
        body,
      },
      CActionChangeStep,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  async updateActionChangeStepNode(
    body: ActionChangeStepPut,
  ): Promise<PagedActionChangeStep> {
    const result = await this.httpService.post(
      { path: `/actionchangestep`, body },
      CActionChangeStep,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  /**
   * Updates the value of a data collection record value for a specific action.
   *
   * This function retrieves the current value of a data collection record for the specified
   * action, data collection name, and data field name. If the record exists, it updates the
   * value with the provided string value. If the record does not exist, it is created.
   *
   * @param {number} actionId - The ID of the action.
   * @param {string} dataCollectionName - The name of the data collection.
   * @param {string} dataFieldName - The name of the data field.
   * @param {string} stringValue - The new value to be set for the data field.
   * @returns {Promise<SingleDataCollectionRecordValue>} - A promise that resolves to the updated data collection record value.
   * @throws {Error} - Throws an error if the data collection record value cannot be retrieved or updated.
   */
  async updateDataCollectionRecordValuev2(
    actionId: number,
    dataCollectionName: string,
    dataFieldName: string,
    stringValue: string,
  ): Promise<SingleDataCollectionRecordValue> {
    this.logger.debug(
      `Checking for existance of ${actionId} - ${dataCollectionName} - ${dataFieldName}`,
    )
    const dfv = await this.getFirstDataCollectionRecordValue(
      actionId,
      dataCollectionName,
      dataFieldName,
    )
    if (dfv && dfv.datacollectionrecordvalues.id) {
      // record exists, just update it
      this.logger.debug(`Found ${dfv.datacollectionrecordvalues.id}`)
      const body = {
        datacollectionrecordvalues: {
          stringValue,
          links: {
            dataCollectionField:
              dfv.datacollectionrecordvalues.links.dataCollectionField,
            dataCollection: dfv.datacollectionrecordvalues.links.dataCollection,
            action: dfv.datacollectionrecordvalues.links.action,
            dataCollectionRecord:
              dfv.datacollectionrecordvalues.links.dataCollectionRecord,
          },
        },
      }
      const response = await this.httpService.put(
        {
          path: `/datacollectionrecordvalues/${dfv.datacollectionrecordvalues.id}`,
          body,
        },
        CSingleDataCollectionRecordValue,
      )
      if (!response.ok) throw errorFrom(response.val)
      return response.val.data
    }

    // record does not exist, create it, then update the value
    this.logger.debug(`Creating new record`)
    const action = await this.getAction(actionId)
    if (!action.actions?.links?.actionType) {
      throw new Error(`Failed to retrieve action type for action: ${actionId}`)
    }
    const actionType = action.actions.links.actionType
    this.logger.debug(`Found actionType: ${actionType}`)
    const dataCollection = await this.getDataCollections({
      filter: `actionType = ${actionType} AND name = '${dataCollectionName}'`,
    })
    if (!dataCollection.datacollections[0].id) {
      throw new Error(
        `Failed to retrieve data collection for action type: ${actionType}`,
      )
    }
    const dataCollectionId = dataCollection.datacollections[0].id
    this.logger.debug(`Found dataCollectionId: ${dataCollectionId}`)
    const record = await this.createDataCollectionRecord({
      datacollectionrecords: {
        links: {
          dataCollection: `${dataCollectionId}`,
          action: `${actionId}`,
        },
      },
    })
    if (!record.datacollectionrecords.id) {
      throw new Error(
        `Failed to create data collection record for action: ${actionId}`,
      )
    }
    this.logger.debug(`Created record: ${record.datacollectionrecords.id}`)
    const body = {
      datacollectionrecordvalues: {
        stringValue,
        links: {
          dataCollectionField: `${dataCollectionId}--${dataFieldName}`,
          dataCollection: `${dataCollectionId}`,
          action: `${actionId}`,
          dataCollectionRecord: `${record.datacollectionrecords.id}`,
        },
      },
    }
    const result = await this.httpService.put(
      {
        path: `/datacollectionrecordvalues/${dataCollectionId}--${dataFieldName}--${record.datacollectionrecords.id}`,
        body,
      },
      CSingleDataCollectionRecordValue,
    )
    if (!result.ok) throw errorFrom(result.val)
    return result.val.data
  }

  /**
   * Retrieves the value of a data collection record for a specific action.
   *
   * This function fetches the current value of a data collection record for the specified
   * action, data collection name, and data field name.
   *
   * In the case of the record being multi-row,
   * or an error in ActionStep having records for multiple data collections
   * the first record is returned.
   *
   * @param {number} actionId - The ID of the action.
   * @param {string} dataCollectionName - The name of the data collection.
   * @param {string} dataFieldName - The name of the data field.
   * @returns {Promise<SingleDataCollectionRecordValue>} - A promise that resolves to the data collection record value.
   * @throws {Error} - Throws an error if the data collection record value cannot be retrieved.
   */
  async getFirstDataCollectionRecordValue(
    actionId: number,
    dataCollectionName: string,
    dataFieldName: string,
  ): Promise<SingleDataCollectionRecordValue | undefined> {
    const response = await this.getDataCollectionRecordValues({
      filter: `action = ${actionId} AND dataCollection.name = '${dataCollectionName}' AND dataCollectionField.name = '${dataFieldName}'`,
    })
    if (response.datacollectionrecordvalues.length === 0) return undefined
    return {
      links: response.links,
      datacollectionrecordvalues: response.datacollectionrecordvalues[0],
      meta: response.meta,
    }
  }

  /**
   * Deletes all incomplete tasks for a specific action.
   *
   * This function retrieves all tasks associated with the specified action that have an
   * incomplete status and deletes them.
   *
   * @param {number} actionId - The ID of the action.
   * @returns {Promise<void>} - A promise that resolves when all incomplete tasks are deleted.
   * @throws {Error} - Throws an error if the tasks cannot be retrieved or deleted.
   */
  async deleteIncompleteTasks(actionId: number): Promise<void> {
    this.logger.info(
      `Preparing to delete incomplete tasks found for action: ${actionId}`,
    )
    const incompleteTasks = await this.getTasks({
      filter: `action = ${actionId} AND status = 'Incomplete'`,
    })

    // will return a 204 if no tasks are found which is good
    if (incompleteTasks.meta.paging.tasks.recordCount === 0) {
      this.logger.info(`No incomplete tasks found for action: ${actionId}`)
      return
    }

    for (const task of incompleteTasks.tasks) {
      // log the deletion of the task
      this.logger.info(`Deleting task: ${task.id}`)
      await this.deleteTask(task.id)
    }
    return
  }
  /**
   * Retrieves the intent for a specific action.
   *
   * This function fetches the intent associated with the specified action ID by retrieving
   * the value of the 'ConveyType' field from the 'convdet' data collection.
   *
   * @param {number} actionId - The ID of the action.
   * @returns {Promise<'buy' | 'sell' | undefined>} - A promise that resolves to the intent of the action as a lowercase string, or null if not found.
   */
  async getIntent(actionId: number): Promise<'buy' | 'sell' | undefined> {
    const result = await this.getFirstDataCollectionRecordValue(
      actionId,
      'convdet',
      'ConveyType',
    )
    if (result === undefined) return undefined
    const stringValue: string =
      result.datacollectionrecordvalues.stringValue || ''
    const mapping: { [key: string]: 'sell' | 'buy' | undefined } = {
      Sale: 'sell',
      Purchase: 'buy',
      'Purchase - OTP': 'buy',
      Transfer: undefined,
      '': undefined,
    }
    const out = mapping[stringValue] || undefined
    return out
  }

  async getSteps(query?: Record<string, string>): Promise<PagedSteps> {
    const result = await this.httpService.get(
      { path: `/steps`, query },
      CPagedSteps,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  async getStep(
    id: string,
    query?: Record<string, string>,
  ): Promise<SingleStep> {
    const result = await this.httpService.get(
      { path: `/steps/${id}`, query },
      CSingleStep,
    )
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }
}
